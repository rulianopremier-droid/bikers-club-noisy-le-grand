import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useLocation } from 'wouter';

export default function PageHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const [, setLocation] = useLocation();

  return (
    <header className="w-full py-4 px-6 border-b-2 border-primary flex items-center gap-4">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setLocation('/')}
        data-testid="button-back"
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>
      {title && (
        <div>
          <h1 className="text-2xl font-bold text-white" data-testid="page-header-title">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground" data-testid="page-header-subtitle">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </header>
  );
}
