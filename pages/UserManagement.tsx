import { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createInstructorSchema } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Check, X, Shield, User, Trash2, Download, Upload, Copy } from 'lucide-react';
import type { UserWithoutPassword } from '@shared/schema';
import { z } from 'zod';

export default function UserManagement() {
  const { user, sessionId } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${sessionId}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    enabled: !!sessionId && user?.role === 'admin',
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: 'pending' | 'active' }) => {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${sessionId}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: 'Statut mis à jour',
        description: 'Le statut de l\'utilisateur a été modifié avec succès.',
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'instructor' }) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${sessionId}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) throw new Error('Failed to update role');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: 'Rôle mis à jour',
        description: 'Le rôle de l\'utilisateur a été modifié avec succès.',
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionId}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: 'Utilisateur supprimé',
        description: 'L\'utilisateur a été supprimé avec succès.',
      });
    },
  });

  const exportExcelMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/export-excel', {
        headers: {
          'Authorization': `Bearer ${sessionId}`,
        },
      });
      if (!response.ok) throw new Error('Erreur lors de l\'export');
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bikers-Club-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: 'Export réussi',
        description: 'Le fichier Excel a été téléchargé.',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'export',
        variant: 'destructive',
      });
    },
  });

  const importExcelMutation = useMutation({
    mutationFn: async (file: File) => {
      const buffer = await file.arrayBuffer();
      const response = await fetch('/api/import-excel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionId}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ buffer: Array.from(new Uint8Array(buffer)) }),
      });
      if (!response.ok) throw new Error('Erreur lors de l\'import');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: 'Import réussi',
        description: data.message,
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'import',
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importExcelMutation.mutate(file);
    }
  };

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createdInstructor, setCreatedInstructor] = useState<{ user: any; password: string } | null>(null);

  const form = useForm({
    resolver: zodResolver(createInstructorSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      group: '',
    },
  });

  const createInstructorMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createInstructorSchema>) => {
      const result = await apiRequest('POST', '/api/admin/instructors', data);
      return result as { user: any; password: string };
    },
    onSuccess: (result: { user: any; password: string }) => {
      setCreatedInstructor(result);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: 'Succès',
        description: 'Encadrant créé avec succès',
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la création',
        variant: 'destructive',
      });
    },
  });

  const users: UserWithoutPassword[] = usersData?.users || [];
  const pendingUsers = users.filter(u => u.status === 'pending');
  const activeUsers = users.filter(u => u.status === 'active');

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen">
        <PageHeader />
        <main className="container mx-auto px-4 py-8">
          <Card className="p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-2">Accès refusé</h2>
            <p className="text-muted-foreground">Cette page est réservée aux administrateurs.</p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader title="Gestion des Utilisateurs" subtitle="Valider les inscriptions et gérer les rôles" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2" data-testid="page-title">
                Gestion des Utilisateurs
              </h1>
              <p className="text-muted-foreground" data-testid="page-subtitle">
                Valider les inscriptions et gérer les rôles
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => exportExcelMutation.mutate()}
                disabled={exportExcelMutation.isPending}
                variant="secondary"
                className="gap-2"
                data-testid="button-export-excel"
              >
                <Download className="w-4 h-4" />
                Export Excel
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={importExcelMutation.isPending}
                variant="secondary"
                className="gap-2"
                data-testid="button-import-excel"
              >
                <Upload className="w-4 h-4" />
                Importer
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="file-input-excel"
              />
            </div>
          </div>

          {isLoading ? (
            <Card className="p-6 text-center">
              <p className="text-white">Chargement...</p>
            </Card>
          ) : (
            <>
              {/* Create Instructor Form */}
              <Card className="p-6" data-testid="create-instructor-section">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-white">Créer un Encadrant</h2>
                  <Button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    variant={showCreateForm ? 'secondary' : 'default'}
                  >
                    {showCreateForm ? 'Annuler' : 'Ajouter'}
                  </Button>
                </div>

                {showCreateForm && !createdInstructor && (
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit((data) => createInstructorMutation.mutate(data))}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                              <Input placeholder="Nom de l'encadrant" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="email@example.com" {...field} />
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
                            <FormLabel>Téléphone (optionnel)</FormLabel>
                            <FormControl>
                              <Input placeholder="+33..." {...field} />
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
                            <FormLabel>Groupe (optionnel)</FormLabel>
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

                      <Button type="submit" disabled={createInstructorMutation.isPending} className="w-full">
                        {createInstructorMutation.isPending ? 'Création...' : 'Créer'}
                      </Button>
                    </form>
                  </Form>
                )}

                {createdInstructor && (
                  <Card className="p-4 bg-green-500/10 border-green-500/30" data-testid="credentials-display">
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-white">Identifiants créés</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Nom</p>
                          <p className="text-white font-mono">{createdInstructor.user.name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <div className="flex gap-2 items-center">
                            <p className="text-white font-mono">{createdInstructor.user.email}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                navigator.clipboard.writeText(createdInstructor.user.email);
                                toast({ title: 'Copié' });
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Mot de passe</p>
                          <div className="flex gap-2 items-center">
                            <p className="text-white font-mono">{createdInstructor.password}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                navigator.clipboard.writeText(createdInstructor.password);
                                toast({ title: 'Copié' });
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          setCreatedInstructor(null);
                          setShowCreateForm(false);
                        }}
                        className="w-full"
                      >
                        Fermer
                      </Button>
                    </div>
                  </Card>
                )}
              </Card>

              {pendingUsers.length > 0 && (
                <Card className="p-6" data-testid="pending-users-section">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Demandes en attente ({pendingUsers.length})
                  </h2>
                  <div className="space-y-3">
                    {pendingUsers.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-card/40 backdrop-blur-sm border border-primary/30"
                        data-testid={`pending-user-${u.id}`}
                      >
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-white" data-testid={`user-name-${u.id}`}>
                            {u.name}
                          </h3>
                          <p className="text-sm text-muted-foreground" data-testid={`user-email-${u.id}`}>
                            {u.email}
                          </p>
                          <Badge variant="secondary" className="mt-1 bg-yellow-500 text-black">
                            En attente
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => updateStatusMutation.mutate({ userId: u.id, status: 'active' })}
                            data-testid={`button-approve-${u.id}`}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Valider
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (confirm('Supprimer cet utilisateur ?')) {
                                deleteUserMutation.mutate(u.id);
                              }
                            }}
                            data-testid={`button-reject-${u.id}`}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Refuser
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Card className="p-6" data-testid="active-users-section">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Utilisateurs actifs ({activeUsers.length})
                </h2>
                <div className="space-y-3">
                  {activeUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-card/40 backdrop-blur-sm border border-primary/30"
                      data-testid={`active-user-${u.id}`}
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-white" data-testid={`user-name-${u.id}`}>
                          {u.name}
                        </h3>
                        <p className="text-sm text-muted-foreground" data-testid={`user-email-${u.id}`}>
                          {u.email}
                        </p>
                        <Badge 
                          variant={u.role === 'admin' ? 'default' : 'secondary'} 
                          className="mt-1"
                          data-testid={`user-role-${u.id}`}
                        >
                          {u.role === 'admin' ? (
                            <><Shield className="w-3 h-3 mr-1" /> Administrateur</>
                          ) : (
                            <><User className="w-3 h-3 mr-1" /> Encadrant</>
                          )}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {u.id !== user.id && (
                          <>
                            <Button
                              size="sm"
                              variant={u.role === 'admin' ? 'secondary' : 'default'}
                              onClick={() => 
                                updateRoleMutation.mutate({ 
                                  userId: u.id, 
                                  role: u.role === 'admin' ? 'instructor' : 'admin' 
                                })
                              }
                              data-testid={`button-toggle-role-${u.id}`}
                            >
                              {u.role === 'admin' ? 'Rétrograder' : 'Promouvoir admin'}
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => {
                                if (confirm(`Supprimer ${u.name} ?`)) {
                                  deleteUserMutation.mutate(u.id);
                                }
                              }}
                              data-testid={`button-delete-${u.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
