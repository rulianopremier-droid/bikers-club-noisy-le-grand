import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Copy, Eye, EyeOff, Camera } from 'lucide-react';
import PortraitAvatar from '@/components/PortraitAvatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageCropper from '@/components/ImageCropper';

interface InstructorDetail {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string | null;
  group: string | null;
  photoUrl: string | null;
}

export default function EditInstructor({ params }: { params: { id: string } }) {
  const { user, sessionId } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [group, setGroup] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [croppingImage, setCroppingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not admin
  if (user && user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const { data: instructor, isLoading } = useQuery({
    queryKey: [`/api/instructors/${params.id}`],
    queryFn: async () => {
      const response = await fetch(`/api/instructors/${params.id}`, {
        headers: { 'Authorization': `Bearer ${sessionId}` },
      });
      if (!response.ok) throw new Error('Impossible de charger l\'encadrant');
      return response.json();
    },
    enabled: !!sessionId && user?.role === 'admin',
  });

  // Initialize fields when instructor data loads
  useEffect(() => {
    if (instructor) {
      setName(instructor.name);
      setEmail(instructor.email);
      setPhone(instructor.phone || '');
      setGroup(instructor.group || '');
      setPhotoUrl(instructor.photoUrl || null);
      setPassword('');
    }
  }, [instructor]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copié!',
      description: 'Le texte a été copié au presse-papiers.',
    });
  };

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 2000;
          const maxHeight = 2000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          } else {
            reject(new Error('Failed to compress image'));
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setCroppingImage(compressed);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la compression de l\'image',
        variant: 'destructive',
      });
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    setPhotoUrl(croppedImage);
    setCroppingImage(null);
  };

  const handleSave = async () => {
    if (!sessionId || !instructor) {
      toast({ title: 'Erreur', description: 'Session expirée', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/instructors/${instructor.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${sessionId}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name || undefined,
          phone: phone || undefined,
          group: group || undefined,
          email: email || undefined,
          password: password || undefined,
          photoUrl: photoUrl || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      toast({
        title: 'Mis à jour!',
        description: 'Les informations ont été modifiées avec succès.',
      });

      // Reset
      setEmail('');
      setPassword('');
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Chargement...</p>
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="min-h-screen">
        <PageHeader title="Encadrant introuvable" subtitle="" />
        <main className="container mx-auto px-4 py-8">
          <Card className="p-6 text-center">
            <p className="text-white mb-4">Cet encadrant n'existe pas.</p>
            <Button onClick={() => navigate('/encadrants')}>Retour</Button>
          </Card>
        </main>
      </div>
    );
  }

  if (croppingImage) {
    return (
      <div className="min-h-screen">
        <PageHeader title="Ajuster la photo" subtitle="Ajustez votre photo de profil" />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="p-6">
              <ImageCropper
                src={croppingImage}
                onCropComplete={handleCropComplete}
              />
              <div className="flex justify-center gap-3 mt-6 pt-6 border-t border-primary/30">
                <Button 
                  onClick={() => setCroppingImage(null)}
                  variant="secondary"
                  data-testid="button-cancel-crop"
                >
                  Annuler
                </Button>
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader title="Fiche Encadrant" subtitle={`Gestion complète - ${instructor.name}`} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 space-y-6">
            {/* Photo */}
            <div className="flex flex-col items-center gap-4">
              <PortraitAvatar 
                src={photoUrl || undefined}
                fallback={instructor.name}
                alt={instructor.name}
                className="w-32 h-48"
              />
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white">{name}</h2>
                <p className="text-muted-foreground text-sm">{group || 'Groupe non défini'}</p>
              </div>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  data-testid="input-photo-file"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="secondary"
                  size="sm"
                  data-testid="button-upload-photo"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Modifier la photo
                </Button>
              </div>
            </div>

            {/* Informations personnelles */}
            <div className="border-t border-primary/30 pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Informations personnelles</h3>
              
              <div>
                <Label className="text-white mb-2 block">Nom</Label>
                <Input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-card text-white border-primary"
                  data-testid="input-edit-name"
                />
              </div>

              <div>
                <Label className="text-white mb-2 block">Téléphone</Label>
                <Input 
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-card text-white border-primary"
                  data-testid="input-edit-phone"
                />
              </div>

              <div>
                <Label className="text-white mb-2 block">Groupe</Label>
                <Select value={group} onValueChange={setGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un groupe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Groupe 1">Groupe 1</SelectItem>
                    <SelectItem value="Groupe 2">Groupe 2</SelectItem>
                    <SelectItem value="Groupe 3">Groupe 3</SelectItem>
                    <SelectItem value="Groupe 4">Groupe 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Identifiants actuels */}
            <div className="border-t border-primary/30 pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Identifiants actuels</h3>
              
              <div>
                <Label className="text-white mb-2 block">Email</Label>
                <div className="flex gap-2">
                  <Input 
                    value={instructor.email} 
                    disabled 
                    className="bg-card/40 text-white border-primary"
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => handleCopy(instructor.email)}
                    data-testid="button-copy-email"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-white mb-2 block">Mot de passe</Label>
                <div className="flex gap-2">
                  <Input 
                    type={showPassword ? 'text' : 'password'}
                    value={instructor.password} 
                    disabled 
                    className="bg-card/40 text-white border-primary"
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password-visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => handleCopy(instructor.password)}
                    data-testid="button-copy-password"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Modification des identifiants */}
            <div className="border-t border-primary/30 pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Modifier les identifiants</h3>
              
              <div>
                <Label className="text-white mb-2 block">Nouvel Email (optionnel)</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={instructor.email}
                  className="bg-card text-white border-primary"
                  data-testid="input-new-email"
                />
              </div>

              <div>
                <Label className="text-white mb-2 block">Nouveau mot de passe (optionnel)</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Laisser vide pour ne pas modifier"
                  className="bg-card text-white border-primary"
                  data-testid="input-new-password"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-primary/30">
              <Button 
                onClick={() => navigate('/encadrants')} 
                variant="secondary"
                data-testid="button-cancel"
              >
                Retour
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                data-testid="button-save"
              >
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
