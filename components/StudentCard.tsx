import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone } from 'lucide-react';

interface StudentCardProps {
  student: {
    id: string;
    name: string;
    photo?: string;
    age?: number;
  };
  size?: 'small' | 'medium';
  showStatus?: boolean;
  status?: 'present' | 'absent';
  onStatusChange?: (id: string, status: 'present' | 'absent') => void;
}

export default function StudentCard({ 
  student, 
  size = 'medium',
  showStatus = false,
  status,
  onStatusChange 
}: StudentCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (size === 'small') {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-card/40 backdrop-blur-sm border border-primary/30">
        <Avatar className="w-12 h-12" data-testid={`avatar-${student.id}`}>
          <AvatarImage src={student.photo} alt={student.name} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(student.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate" data-testid={`name-${student.id}`}>
            {student.name}
          </p>
        </div>
        {showStatus && onStatusChange && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={status === 'present' ? 'default' : 'secondary'}
              onClick={() => onStatusChange(student.id, 'present')}
              data-testid={`button-present-${student.id}`}
              className="min-h-8"
            >
              Présent
            </Button>
            <Button
              size="sm"
              variant={status === 'absent' ? 'destructive' : 'secondary'}
              onClick={() => onStatusChange(student.id, 'absent')}
              data-testid={`button-absent-${student.id}`}
              className="min-h-8"
            >
              Absent
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="p-6 hover-elevate" data-testid={`student-card-${student.id}`}>
      <div className="flex items-start gap-4">
        <Avatar className="w-16 h-16" data-testid={`avatar-${student.id}`}>
          <AvatarImage src={student.photo} alt={student.name} />
          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
            {getInitials(student.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1" data-testid={`name-${student.id}`}>
            {student.name}
          </h3>
          {student.age && (
            <Badge variant="secondary" className="mb-2" data-testid={`age-${student.id}`}>
              {student.age} ans
            </Badge>
          )}
        </div>
        <Button
          size="icon"
          variant="secondary"
          data-testid={`button-call-${student.id}`}
          onClick={() => console.log('Appel:', student.name)}
        >
          <Phone className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
