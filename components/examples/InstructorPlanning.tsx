import { useState } from 'react';
import InstructorPlanning from '../InstructorPlanning';

export default function InstructorPlanningExample() {
  const [instructors, setInstructors] = useState([
    { id: '1', name: 'Pierre Dubois', status: 'present' as const },
    { id: '2', name: 'Marie Laurent', status: 'to_confirm' as const },
    { id: '3', name: 'Thomas Bernard', status: 'absent' as const },
    { id: '4', name: 'Sophie Martin', status: 'present' as const },
  ]);

  const handleStatusChange = (id: string, status: 'present' | 'absent' | 'to_confirm') => {
    console.log(`Statut encadrant ${id} changé:`, status);
    setInstructors(prev =>
      prev.map(inst => inst.id === id ? { ...inst, status } : inst)
    );
  };

  return (
    <div className="p-8 max-w-2xl">
      <InstructorPlanning 
        instructors={instructors}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
