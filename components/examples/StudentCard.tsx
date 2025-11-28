import { useState } from 'react';
import StudentCard from '../StudentCard';

export default function StudentCardExample() {
  const [status, setStatus] = useState<'present' | 'absent'>('present');

  const mockStudent = {
    id: '1',
    name: 'Lucas Martin',
    age: 12,
  };

  return (
    <div className="p-8 space-y-6 max-w-lg">
      <div>
        <h3 className="text-white mb-4">Taille medium :</h3>
        <StudentCard student={mockStudent} />
      </div>
      
      <div>
        <h3 className="text-white mb-4">Taille small avec pointage :</h3>
        <StudentCard 
          student={mockStudent} 
          size="small"
          showStatus
          status={status}
          onStatusChange={(id, newStatus) => {
            console.log(`Statut changé pour ${id}:`, newStatus);
            setStatus(newStatus);
          }}
        />
      </div>
    </div>
  );
}
