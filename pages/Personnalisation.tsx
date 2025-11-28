import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/PageHeader';
import GroupSelector from '@/components/GroupSelector';
import SkillManagement from '@/components/SkillManagement';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { Skill } from '@shared/schema';

export default function Personnalisation() {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);

  // Fetch skills by group
  const { data: skillsData, refetch } = useQuery({
    queryKey: ['/api/skills', selectedGroup],
    queryFn: () => selectedGroup ? fetch(`/api/skills/${selectedGroup}`).then(r => r.json()) : null,
    enabled: selectedGroup !== null,
  });

  const mockSkills: Skill[] = skillsData?.skills || [];

  return (
    <div className="min-h-screen">
      <PageHeader title="Personnalisation des Compétences" subtitle="Ajoutez, modifiez et organisez les compétences par groupe" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2" data-testid="page-title">
              Personnalisation des Compétences
            </h1>
            <p className="text-muted-foreground" data-testid="page-subtitle">
              Ajoutez, modifiez et organisez les compétences par groupe
            </p>
          </div>

          {!selectedGroup ? (
            <div>
              <h2 className="text-xl font-bold text-white mb-6 text-center" data-testid="select-group-title">
                Sélectionnez un groupe
              </h2>
              <GroupSelector 
                selectedGroup={selectedGroup} 
                onSelectGroup={setSelectedGroup}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <Button
                variant="secondary"
                onClick={() => setSelectedGroup(null)}
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux groupes
              </Button>

              <SkillManagement
                groupId={selectedGroup}
                skills={mockSkills}
                onAddSkill={(name) => {
                  // API call to add skill
                  fetch('/api/skills', {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('sessionId') || ''}`
                    },
                    body: JSON.stringify({ groupId: selectedGroup, name, order: mockSkills.length })
                  }).then(() => refetch());
                }}
                onDeleteSkill={(id) => {
                  // API call to delete skill
                  fetch(`/api/skills/${id}`, {
                    method: 'DELETE',
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('sessionId') || ''}`
                    }
                  }).then(() => refetch());
                }}
                onReorderSkills={(skills) => {
                  // API call to reorder skills
                  fetch(`/api/skills/reorder/${selectedGroup}`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('sessionId') || ''}`
                    },
                    body: JSON.stringify({ skillIds: skills.map(s => s.id) })
                  }).then(() => refetch());
                }}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
