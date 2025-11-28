import { Button } from '@/components/ui/button';
import { Home, CheckSquare, BarChart3, Settings, Calendar, Users, LogOut, Users2, FileText, BookOpen } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';

export default function NavigationMenu() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/', label: 'Accueil', icon: Home },
    { path: '/pointage', label: 'Pointage', icon: CheckSquare },
    { path: '/evaluation', label: 'Évaluation', icon: BarChart3 },
    { path: '/personnalisation', label: 'Personnalisation', icon: Settings },
    { path: '/planning-encadrants', label: 'Planning', icon: Calendar },
    { path: '/fiches-eleve', label: 'Fiches élève', icon: BookOpen },
    { path: '/encadrants', label: 'Encadrants', icon: Users2 },
    { path: '/mon-profil', label: 'Mon Profil', icon: FileText },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ path: '/gestion', label: 'Gestion', icon: Users });
  }

  return (
    <nav className="w-full border-b-2 border-primary bg-card/60 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap gap-2 py-3 justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'secondary'}
                    size="default"
                    className="gap-2"
                    data-testid={`nav-${item.path.slice(1) || 'home'}`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-white" data-testid="user-name">
              {user?.name}
            </span>
            <Button
              variant="secondary"
              size="default"
              onClick={() => logout()}
              data-testid="button-logout"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
