import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { insertStudentSchema, type Student } from '@shared/schema';
import PhotoUploadEditor from '@/components/PhotoUploadEditor';
import PortraitAvatar from '@/components/PortraitAvatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

interface EditStudentPageProps {
  params: { id: string };
}

export default function EditStudent({ params }: EditStudentPageProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { sessionId } = useAuth();
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: studentData, isLoading } = useQuery({
    queryKey: ['/api/students', params.id],
    queryFn: async () => {
      const response = await fetch(`/api/students/${params.id}`, {
        headers: { 'Authorization': `Bearer ${sessionId}` },
      });
      if (!response.ok) throw new Error('Élève non trouvé');
      return response.json();
    },
    enabled: !!sessionId,
  });

  const student = studentData?.student as Student | undefined;

  const form = useForm({
    resolver: zodResolver(insertStudentSchema),
    defaultValues: {
      name: '',
      phone: '',
      birthDate: '',
      parentEmail: '',
      group: '',
      photoUrl: '',
    },
  });

  // Mise à jour des champs du formulaire quand les données de l'élève changent
  useEffect(() => {
    if (student) {
      form.reset({
        name: student.name,
        phone: student.phone || '',
        birthDate: student.birthDate || '',
        parentEmail: student.parentEmail || '',
        group: student.group || '',
        photoUrl: student.photoUrl || '',
      });
      setPhotoData(null);
    }
  }, [student, form]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PATCH', `/api/students/${params.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/students', params.id] });
      setIsSubmitting(false);
      toast({ title: 'Succès', description: 'Élève modifié avec succès' });
      navigate('/fiches-eleve');
    },
    onError: (error: any) => {
      setIsSubmitting(false);
      toast({ title: 'Erreur', description: error?.message || 'Erreur lors de la modification', variant: 'destructive' });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    if (isSubmitting || mutation.isPending) return;
    setIsSubmitting(true);

    const updateData = {
      name: data.name,
      phone: data.phone || undefined,
      birthDate: data.birthDate || undefined,
      parentEmail: data.parentEmail || undefined,
      group: data.group || undefined,
      photoUrl: photoData !== null ? (photoData || undefined) : undefined,
    };

    mutation.mutate(updateData);
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <PageHeader title="Modifier élève" subtitle="Chargement..." />
        <div className="flex items-center justify-center py-12">
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen">
        <PageHeader title="Erreur" subtitle="Élève non trouvé" />
        <main className="container mx-auto px-4 py-8">
          <Button onClick={() => navigate('/fiches-eleve')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour aux fiches
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader title="Modifier élève" subtitle={student.name} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button onClick={() => navigate('/fiches-eleve')} variant="ghost" className="gap-2 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Retour aux fiches
          </Button>

          <Card className="p-6 space-y-6">
            {/* Photo actuelle */}
            {student.photoUrl && (
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Photo actuelle</p>
                  <PortraitAvatar 
                    src={student.photoUrl}
                    fallback={student.name}
                    alt={student.name}
                    className="w-32 h-32"
                  />
                </div>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de l'élève" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="+33..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de naissance</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parentEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email des parents</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="group"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Groupe</FormLabel>
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un groupe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Groupe 1">Groupe 1</SelectItem>
                          <SelectItem value="Groupe 2">Groupe 2</SelectItem>
                          <SelectItem value="Groupe 3">Groupe 3</SelectItem>
                          <SelectItem value="Groupe 4">Groupe 4</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <PhotoUploadEditor
                  onPhotoSelected={setPhotoData}
                  currentPhoto={photoData !== null ? photoData : student.photoUrl}
                  onPhotoCleared={() => setPhotoData('')}
                />

                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button onClick={() => navigate('/fiches-eleve')} variant="secondary">
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSubmitting || mutation.isPending}>
                    {isSubmitting || mutation.isPending ? 'Modification en cours...' : 'Modifier'}
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        </div>
      </main>
    </div>
  );
}
