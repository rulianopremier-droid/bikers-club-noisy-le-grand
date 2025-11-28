import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import ImageCropper from '@/components/ImageCropper';
import PortraitAvatar from '@/components/PortraitAvatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Camera, Phone } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';

export default function InstructorProfile() {
  const { user, sessionId } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [group, setGroup] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mise à jour des champs quand l'utilisateur change
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setGroup(user.group || '');
      setPhotoUrl(user.photoUrl || '');
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const img = new Image();
        
        img.onload = () => {
          try {
            // Crée un canvas pour redimensionner
            const canvas = document.createElement('canvas');
            let { width, height } = img;

            // Réduit la taille si > 2000px (pour éviter les crashes)
            if (width > 2000 || height > 2000) {
              const ratio = Math.min(2000 / width, 2000 / height);
              width = Math.floor(width * ratio);
              height = Math.floor(height * ratio);
            }

            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas context');
            
            ctx.drawImage(img, 0, 0, width, height);
            
            // Conversion en base64 avec compression
            const compressed = canvas.toDataURL('image/jpeg', 0.8);
            setPreviewPhoto(compressed);
            setIsCropping(true);
          } catch (err) {
            console.error('Erreur canvas:', err);
            toast({
              title: 'Erreur',
              description: 'Impossible de traiter la photo',
              variant: 'destructive',
            });
          }
        };

        img.onerror = () => {
          console.error('Erreur chargement image');
          toast({
            title: 'Erreur',
            description: 'Impossible de charger la photo',
            variant: 'destructive',
          });
        };

        img.src = event.target?.result as string;
      } catch (err) {
        console.error('Erreur fichier:', err);
        toast({
          title: 'Erreur',
          description: 'Erreur de lecture du fichier',
          variant: 'destructive',
        });
      }
    };

    reader.onerror = () => {
      console.error('Erreur FileReader');
      toast({
        title: 'Erreur',
        description: 'Impossible de lire le fichier',
        variant: 'destructive',
      });
    };

    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImage: string) => {
    if (croppedImage) {
      setPhotoUrl(croppedImage);
    }
    setIsCropping(false);
    setPreviewPhoto(null);
  };

  const handleSave = async () => {
    if (!sessionId) {
      toast({ title: 'Erreur', description: 'Session expirée', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      console.log('Envoi du formulaire:', { phone, group });
      
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${sessionId}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name || undefined,
          phone: phone || undefined,
          group: group || undefined,
          photoUrl: photoUrl || undefined,
        }),
      });

      console.log('Réponse serveur:', response.status);
      const data = await response.json();
      console.log('Données:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Échec de la mise à jour');
      }

      // Invalider les caches pour forcer le rechargement
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/instructors'] });

      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations et votre photo ont été sauvegardées.',
      });
    } catch (error: any) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user.name || '');
    setPhone(user.phone || '');
    setGroup(user.group || '');
    setPhotoUrl(user.photoUrl || '');
    setPreviewPhoto(null);
  };

  return (
    <div className="min-h-screen">
      <PageHeader title="Mon Profil" subtitle="Gérez vos informations d'encadrant" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {isCropping && previewPhoto && (
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Recadrer votre photo</h2>
              <ImageCropper
                src={previewPhoto}
                onCropComplete={handleCropComplete}
              />
            </Card>
          )}

          <Card className="p-6 space-y-6">
            {/* Photo Section */}
            <div>
              <Label className="text-white text-lg font-semibold mb-4 block">
                Photo de Profil
              </Label>
              
              <div className="flex flex-col items-center gap-4 mb-4">
                {/* Avatar Display */}
                <PortraitAvatar 
                  src={photoUrl || undefined}
                  fallback={user.name}
                  alt={user.name}
                  className="w-32 h-48"
                  data-testid="profile-avatar"
                />

                {/* Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="file-input"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="secondary"
                  className="gap-2"
                  data-testid="button-upload-photo"
                >
                  <Camera className="w-4 h-4" />
                  Charger une photo
                </Button>

                {photoUrl && (
                  <Button
                    onClick={() => setPhotoUrl('')}
                    variant="destructive"
                    size="sm"
                    data-testid="button-remove-photo"
                  >
                    Supprimer
                  </Button>
                )}
              </div>
            </div>

            {/* Personal Info */}
            <div className="border-t border-primary/30 pt-6 space-y-4">
              <div>
                <Label htmlFor="name" className="text-white mb-2 block">Nom</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="bg-card text-white border-primary"
                  data-testid="input-name"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-white mb-2 block flex items-center gap-2">
                  <Phone className="w-4 h-4" />Téléphone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-card text-white border-primary"
                  data-testid="input-phone"
                />
              </div>

              <div>
                <Label htmlFor="group" className="text-white mb-2 block">Groupe</Label>
                <Select value={group} onValueChange={setGroup}>
                  <SelectTrigger id="group">
                    <SelectValue placeholder="Sélectionner" />
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

            <div className="flex justify-end gap-3 pt-6 border-t border-primary/30">
              <Button onClick={handleCancel} variant="secondary" data-testid="button-cancel">
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={isSaving} data-testid="button-save">
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
