import AppHeader from '@/components/AppHeader';
import WeatherWidget from '@/components/WeatherWidget';
import SummarySynthesis from '@/components/SummarySynthesis';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, BarChart3, Calendar, Settings, BookOpen, Users2, FileText, MapPin, User, TrendingUp, AlertTriangle, Bell } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const { user, sessionId } = useAuth();

  // Fetch pending users count for admin alert
  const { data: usersData } = useQuery({
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

  const pendingCount = usersData?.users?.filter((u: any) => u.status === 'pending').length || 0;

  const menuItems = [
    { path: '/pointage', label: 'Pointage', icon: CheckSquare },
    { path: '/evaluation', label: 'Évaluation', icon: BarChart3 },
    { path: '/planning-encadrants', label: 'Planning', icon: Calendar },
    { path: '/localisation', label: 'Localisation', icon: MapPin },
    { path: '/fiches-eleve', label: 'Fiches élève', icon: BookOpen },
    { path: '/personnalisation', label: 'Compétences', icon: Settings },
    { path: '/encadrants', label: 'Encadrants', icon: Users2 },
    { path: '/mon-profil', label: 'Mon Profil', icon: FileText },
  ];

  const adminItems = user?.role === 'admin' 
    ? [{ path: '/gestion', label: 'Gestion', icon: Users2, hasPending: pendingCount > 0 }]
    : [];

  const allItems = [...menuItems, ...adminItems];

  return (
    <div className="min-h-screen">
      <AppHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <WeatherWidget />

          <div className="grid md:grid-cols-3 gap-4 pt-4">
            <Link href="/pointage">
              <Card className="p-6 cursor-pointer hover-elevate active-elevate-2 h-28 flex flex-col justify-between" data-testid="card-pointage-quick-access">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Accès rapide</p>
                  <p className="text-2xl font-bold text-white flex items-center gap-2">
                    <CheckSquare className="w-6 h-6 text-primary" />
                    Pointage
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Gérez la présence des élèves</p>
              </Card>
            </Link>

            <Link href="/evaluation">
              <Card className="p-6 cursor-pointer hover-elevate active-elevate-2 h-28 flex flex-col justify-between" data-testid="card-evaluation-quick-access">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Accès rapide</p>
                  <p className="text-2xl font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    Évaluation
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Évaluez les compétences des élèves</p>
              </Card>
            </Link>

            <Link href="/urgence">
              <Card className="p-6 cursor-pointer hover-elevate active-elevate-2 h-28 flex flex-col justify-between bg-red-900/30 border-red-600" data-testid="card-urgence-quick-access">
                <div>
                  <p className="text-sm text-red-300 mb-1">⚠️ Important</p>
                  <p className="text-2xl font-bold text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6" />
                    Urgence
                  </p>
                </div>
                <p className="text-xs text-red-300">Appels d'urgence et encadrants proches</p>
              </Card>
            </Link>
          </div>

          <div className="space-y-2" data-testid="menu-grid">
            {allItems.map((item: any) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path}>
                  <Card 
                    className={`p-4 cursor-pointer hover-elevate active-elevate-2 flex items-center gap-4 h-16 ${item.hasPending ? 'border-red-500 border-2' : ''}`}
                    data-testid={`card-${item.path.slice(1) || 'home'}`}
                  >
                    <div className={`p-2 rounded-md flex-shrink-0 relative ${item.hasPending ? 'bg-red-900/30' : 'bg-primary/20'}`}>
                      <Icon className={`w-6 h-6 ${item.hasPending ? 'text-red-400' : 'text-primary'}`} />
                      {item.hasPending && (
                        <Badge className="absolute -top-2 -right-2 bg-red-500 text-white" data-testid="alert-pending-count">
                          {pendingCount}
                        </Badge>
                      )}
                    </div>
                    <p className={`text-base font-semibold ${item.hasPending ? 'text-red-400' : 'text-white'}`}>{item.label}</p>
                    {item.hasPending && (
                      <Badge variant="destructive" className="ml-auto" data-testid="alert-badge">
                        <Bell className="w-3 h-3 mr-1" />
                        {pendingCount} en attente
                      </Badge>
                    )}
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Summary Synthesis Section */}
          <div className="pt-8" data-testid="synthesis-section">
            <SummarySynthesis />
          </div>
        </div>
      </main>
    </div>
  );
}
