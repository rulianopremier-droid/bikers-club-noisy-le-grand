import SkillManagement from '../SkillManagement';

export default function SkillManagementExample() {
  const mockSkills = [
    { id: '1', name: 'Équilibre' },
    { id: '2', name: 'Freinage' },
    { id: '3', name: 'Virage serré' },
    { id: '4', name: 'Saut de trottoir' },
  ];

  return (
    <div className="p-8 max-w-2xl">
      <SkillManagement 
        groupId={1}
        skills={mockSkills}
        onAddSkill={(name) => console.log('Compétence ajoutée:', name)}
        onDeleteSkill={(id) => console.log('Compétence supprimée:', id)}
      />
    </div>
  );
}
