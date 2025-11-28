import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
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
import { insertStudentSchema, type Student, type InsertStudent } from '@shared/schema';
import PhotoUploadEditor from '@/components/PhotoUploadEditor';
import { Plus, Trash2 } from 'lucide-react';
import PortraitAvatar from '@/components/PortraitAvatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function calculateAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function StudentCard({ student, onDelete }: { student: Student; onDelete: () => void }) {
  const [, navigate] = useLocation();
  const age = calculateAge(student.birthDate);

  return (
    <Card className="p-4 space-y-3" data-testid={`card-student-${student.id}`}>
      <div className="flex gap-4">
        <PortraitAvatar 
          src={student.photoUrl || undefined}
          fallback={student.name}
          alt={student.name}
          className="w-20 h-20"
        />
        <div className="flex-1 min-w-0">
          <button
            onClick={() => navigate(`/fiches-eleve/${student.id}/modifier`)}
            className="text-lg font-bold text-white hover:text-yellow-400 transition-colors text-left"
            data-testid={`text-name-${student.id}`}
          >
            {student.name}
          </button>
          <p className="text-sm text-muted-foreground" data-testid={`text-group-${student.id}`}>
            {student.group || 'Groupe non assigné'}
          </p>
          {age !== null && (
            <p className="text-sm text-muted-foreground" data-testid={`text-age-${student.id}`}>
              {age} ans
            </p>
          )}
        </div>
        <Button
          size="icon"
          variant="destructive"
          onClick={onDelete}
          data-testid={`button-delete-${student.id}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        {student.phone && (
          <p data-testid={`text-phone-${student.id}`}>
            📱 {student.phone}
          </p>
        )}
        {student.birthDate && (
          <p data-testid={`text-birthdate-${student.id}`}>
            📅 {new Date(student.birthDate).toLocaleDateString('fr-FR')}
          </p>
        )}
        {student.parentEmail && (
          <a
            href={`mailto:${student.parentEmail}`}
            className="text-primary hover:underline"
            data-testid={`link-email-${student.id}`}
          >
            📧 {student.parentEmail}
          </a>
        )}
      </div>
    </Card>
  );
}

function AddStudentForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const mutation = useMutation({
    mutationFn: async (data: InsertStudent) => {
      try {
        return await apiRequest('POST', '/api/students', data);
      } catch (error: any) {
        if (error.status === 401) {
          console.log('Session expired, retrying...');
          await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('sessionId') || ''}`
            }
          });
          return await apiRequest('POST', '/api/students', data);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      form.reset();
      setPhotoData(null);
      setIsSubmitting(false);
      toast({
        title: 'Succès',
        description: 'Élève ajouté avec succès',
      });
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Error adding student:', error);
      setIsSubmitting(false);
      toast({
        title: 'Erreur',
        description: error?.message || 'Erreur lors de l\'ajout de l\'élève',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    if (isSubmitting || mutation.isPending) {
      return;
    }

    const finalData: InsertStudent = {
      name: data.name,
      phone: data.phone || undefined,
      birthDate: data.birthDate || undefined,
      parentEmail: data.parentEmail || undefined,
      group: data.group || undefined,
      photoUrl: photoData || undefined,
    };
    
    setIsSubmitting(true);
    mutation.mutate(finalData);
  });

  return (
    <>
      <Card className="p-6 space-y-4" data-testid="form-add-student">
        <h3 className="text-xl font-bold text-white">Ajouter un élève</h3>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de l'élève" {...field} data-testid="input-name" />
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
                    <Input placeholder="+33..." {...field} data-testid="input-phone" />
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
                    <Input type="date" {...field} data-testid="input-birthdate" />
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
                    <Input placeholder="email@example.com" {...field} data-testid="input-parent-email" />
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
                      <SelectTrigger data-testid="select-group">
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
              currentPhoto={photoData}
              onPhotoCleared={() => {
                setPhotoData(null);
                const fileInput = document.querySelector('[data-testid="input-photo"]') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
              }}
            />
            <Button type="submit" disabled={isSubmitting || mutation.isPending} data-testid="button-submit">
              {isSubmitting || mutation.isPending ? 'Ajout en cours...' : 'Ajouter'}
            </Button>
          </form>
        </Form>
      </Card>

    </>
  );
}


export default function StudentProfiles() {
  const [showForm, setShowForm] = useState(false);
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['/api/students'],
  });
  const students = (studentsData as any)?.students || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/students/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <PageHeader title="Fiches Élève" subtitle="Gérez les profils des élèves" />
        <div className="flex items-center justify-center py-12">
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader title="Fiches Élève" subtitle="Gérez les profils des élèves" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-start">
            <div></div>
            <Button
              onClick={() => setShowForm(!showForm)}
              data-testid="button-add-student"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </Button>
          </div>

          {showForm && (
            <AddStudentForm onSuccess={() => setShowForm(false)} />
          )}

          <div className="grid gap-4" data-testid="students-list">
            {students.length === 0 ? (
              <Card className="p-6 text-center" data-testid="empty-state">
                <p className="text-muted-foreground">Aucun élève enregistré</p>
              </Card>
            ) : (
              students.map((student: Student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onDelete={() => deleteMutation.mutate(student.id)}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
