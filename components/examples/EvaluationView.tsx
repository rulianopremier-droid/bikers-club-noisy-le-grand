import EvaluationView from '../EvaluationView';

export default function EvaluationViewExample() {
  const mockStudent = {
    id: '1',
    name: 'Lucas Martin',
    age: 12,
    phone: '0612345678',
  };

  const mockSkills = [
    { id: '1', name: 'Équilibre', value: 85 },
    { id: '2', name: 'Freinage', value: 70 },
    { id: '3', name: 'Virage serré', value: 55 },
    { id: '4', name: 'Saut de trottoir', value: 40 },
    { id: '5', name: 'Contrôle vitesse', value: 75 },
  ];

  return (
    <div className="p-8 max-w-2xl">
      <EvaluationView
        student={mockStudent}
        skills={mockSkills}
        onSkillChange={(skillId, value) => {
          console.log(`Compétence ${skillId} mise à jour:`, value);
        }}
      />
    </div>
  );
}
