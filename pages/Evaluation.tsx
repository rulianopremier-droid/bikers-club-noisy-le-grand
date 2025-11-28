import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/PageHeader';
import GroupSelector from '@/components/GroupSelector';
import EvaluationView from '@/components/EvaluationView';
import SkillSlider from '@/components/SkillSlider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import PortraitAvatar from '@/components/PortraitAvatar';
import { ArrowLeft, User, Clipboard } from 'lucide-react';
import type { Student, Skill } from '@shared/schema';

export default function Evaluation() {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedMode, setSelectedMode] = useState<'student' | 'skill' | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [skillValues, setSkillValues] = useState<Record<string, number>>({});
  const [showPreviousGroups, setShowPreviousGroups] = useState<boolean>(false);

  // Fetch students
  const { data: studentsData } = useQuery({
    queryKey: ['/api/students'],
    queryFn: () => fetch('/api/students').then(r => r.json()),
    enabled: selectedGroup !== null,
  });

  // Fetch skills by group (current + previous groups if enabled)
  const { data: skillsData } = useQuery({
    queryKey: ['/api/skills', selectedGroup, showPreviousGroups],
    queryFn: async () => {
      if (!selectedGroup) return null;
      
      let allSkills: any[] = [];
      
      // Get current group skills
      const currentRes = await fetch(`/api/skills/${selectedGroup}`);
      const currentData = await currentRes.json();
      allSkills = allSkills.concat((currentData?.skills || []).map((s: any) => ({ ...s, fromGroup: selectedGroup })));
      
      // Get previous groups skills if enabled
      if (showPreviousGroups && selectedGroup > 1) {
        for (let g = 1; g < selectedGroup; g++) {
          const prevRes = await fetch(`/api/skills/${g}`);
          const prevData = await prevRes.json();
          allSkills = allSkills.concat((prevData?.skills || []).map((s: any) => ({ ...s, fromGroup: g })));
        }
      }
      
      return { skills: allSkills };
    },
    enabled: selectedGroup !== null,
  });

  const mockStudents: any[] = ((studentsData as any)?.students?.filter((s: any) => s.group === `Groupe ${selectedGroup}`) || []).map((s: any) => ({
    ...s,
    photo: s.photoUrl, // Map photoUrl to photo for consistency
    age: s.birthDate ? Math.floor((new Date().getTime() - new Date(s.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : undefined
  }));
  const mockSkills: any[] = (skillsData as any)?.skills || [];

  const currentStudent = mockStudents.find((s: any) => s.id === selectedStudent);

  return (
    <div className="min-h-screen">
      <PageHeader title="Évaluation des Élèves" subtitle="Évaluez les compétences avec des curseurs 0-100%" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2" data-testid="page-title">
              Évaluation des Élèves
            </h1>
            <p className="text-muted-foreground" data-testid="page-subtitle">
              Évaluez les compétences avec des curseurs 0-100%
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
          ) : !selectedMode ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4 justify-between flex-wrap">
                <div className="flex items-center gap-4">
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedGroup(null)}
                    data-testid="button-back-to-groups"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour aux groupes
                  </Button>
                  <h2 className="text-2xl font-bold text-white" data-testid="group-title">
                    Groupe {selectedGroup}
                  </h2>
                </div>
                {selectedGroup && selectedGroup > 1 && (
                  <Button
                    variant={showPreviousGroups ? 'default' : 'outline'}
                    onClick={() => setShowPreviousGroups(!showPreviousGroups)}
                    data-testid="toggle-previous-groups"
                  >
                    {showPreviousGroups 
                      ? `Afficher Groupe ${selectedGroup} uniquement` 
                      : `Afficher aussi Groupe${selectedGroup > 2 ? 's' : ''} ${Array.from({length: selectedGroup - 1}, (_, i) => selectedGroup - i - 1).reverse().join(', ')}`}
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 cursor-pointer hover-elevate active-elevate-2" data-testid="mode-by-student" onClick={() => setSelectedMode('student')}>
                  <div className="text-center">
                    <User className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Par Élève</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Évaluer toutes les compétences d'un élève
                    </p>
                  </div>
                  <div className="space-y-2">
                    {mockStudents.map((student) => (
                      <Button
                        key={student.id}
                        variant="secondary"
                        className="w-full flex items-center gap-2 justify-start"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMode('student');
                          setSelectedStudent(student.id);
                        }}
                        data-testid={`select-student-${student.id}`}
                      >
                        <PortraitAvatar 
                          src={student.photoUrl || undefined}
                          fallback={student.name}
                          alt={student.name}
                          className="w-6 h-6"
                        />
                        <span className="flex-1">{student.name}</span>
                      </Button>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 cursor-pointer hover-elevate active-elevate-2" data-testid="mode-by-skill" onClick={() => setSelectedMode('skill')}>
                  <div className="text-center">
                    <Clipboard className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Par Compétence</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Évaluer tous les élèves sur une compétence
                    </p>
                  </div>
                  <div className="space-y-2">
                    {mockSkills && mockSkills.length > 0 ? (
                      mockSkills.map((skill) => (
                        <Button
                          key={`${skill.id}-${skill.fromGroup}`}
                          variant="secondary"
                          className="w-full text-left justify-start flex-col items-start h-auto py-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMode('skill');
                            setSelectedSkill(skill.id);
                          }}
                          data-testid={`select-skill-${skill.id}`}
                        >
                          <span>{skill.name}</span>
                          {showPreviousGroups && skill.fromGroup !== selectedGroup && (
                            <span className="text-xs text-muted-foreground">(Groupe {skill.fromGroup})</span>
                          )}
                        </Button>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">Aucune compétence définie</p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          ) : selectedMode === 'student' && selectedStudent && currentStudent ? (
            <div className="space-y-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedMode(null);
                  setSelectedStudent(null);
                }}
                data-testid="button-back-to-mode"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la sélection
              </Button>

              <EvaluationView
                student={currentStudent}
                skills={mockSkills}
                onSkillChange={(skillId, value) => {
                  console.log(`Compétence ${skillId} pour ${currentStudent.name}:`, value);
                }}
              />
            </div>
          ) : selectedMode === 'skill' && selectedSkill ? (
            <div className="space-y-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedMode(null);
                  setSelectedSkill(null);
                }}
                data-testid="button-back-to-mode"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la sélection
              </Button>

              <Card className="p-6">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Évaluation - {mockSkills.find(s => s.id === selectedSkill)?.name}
                </h3>
                <div className="space-y-4">
                  {mockStudents && mockStudents.length > 0 ? (
                    mockStudents.map((student) => (
                      <div key={student.id} className="flex items-center gap-3">
                        <PortraitAvatar 
                          src={student.photoUrl || undefined}
                          fallback={student.name}
                          alt={student.name}
                          className="w-10 h-10 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white mb-1">{student.name}</p>
                          <SkillSlider
                            key={student.id}
                            skillName=""
                            value={skillValues[student.id] || 0}
                            onChange={(value) => {
                              setSkillValues(prev => ({ ...prev, [student.id]: value }));
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">Aucun élève dans ce groupe</p>
                  )}
                </div>
              </Card>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
