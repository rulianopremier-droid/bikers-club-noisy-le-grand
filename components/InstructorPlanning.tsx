import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, HelpCircle } from 'lucide-react';

interface Instructor {
  id: string;
  name: string;
  status: 'present' | 'absent' | 'to_confirm';
}

interface InstructorPlanningProps {
  instructors: Instructor[];
  onStatusChange?: (id: string, status: Instructor['status']) => void;
}

export default function InstructorPlanning({ instructors, onStatusChange }: InstructorPlanningProps) {
  const getStatusBadge = (status: Instructor['status']) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-500 text-white" data-testid="status-present">Présent</Badge>;
      case 'absent':
        return <Badge variant="destructive" data-testid="status-absent">Absent</Badge>;
      case 'to_confirm':
        return <Badge className="bg-yellow-500 text-black" data-testid="status-to-confirm">À confirmer</Badge>;
    }
  };

  return (
    <Card className="p-6" data-testid="instructor-planning">
      <h2 className="text-2xl font-bold text-white mb-6" data-testid="planning-title">
        Planning Encadrants - Mercredi prochain
      </h2>
      <div className="space-y-4">
        {instructors.map((instructor) => (
          <div
            key={instructor.id}
            className="flex items-center justify-between p-4 rounded-lg bg-card/40 backdrop-blur-sm border border-primary/30"
            data-testid={`instructor-${instructor.id}`}
          >
            <div className="flex-1">
              <h3 className="text-lg font-medium text-white mb-2" data-testid={`instructor-name-${instructor.id}`}>
                {instructor.name}
              </h3>
              {getStatusBadge(instructor.status)}
            </div>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant={instructor.status === 'present' ? 'default' : 'secondary'}
                onClick={() => onStatusChange?.(instructor.id, 'present')}
                data-testid={`button-present-${instructor.id}`}
                title="Présent"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant={instructor.status === 'absent' ? 'destructive' : 'secondary'}
                onClick={() => onStatusChange?.(instructor.id, 'absent')}
                data-testid={`button-absent-${instructor.id}`}
                title="Absent"
              >
                <X className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant={instructor.status === 'to_confirm' ? 'default' : 'secondary'}
                className={instructor.status === 'to_confirm' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                onClick={() => onStatusChange?.(instructor.id, 'to_confirm')}
                data-testid={`button-to-confirm-${instructor.id}`}
                title="À confirmer"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
