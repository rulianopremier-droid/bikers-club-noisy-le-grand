import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface Skill {
  id: string;
  name: string;
}

interface SkillManagementProps {
  groupId: number;
  skills: Skill[];
  onAddSkill?: (name: string) => void;
  onDeleteSkill?: (id: string) => void;
  onReorderSkills?: (skills: Skill[]) => void;
}

export default function SkillManagement({ 
  groupId, 
  skills: initialSkills,
  onAddSkill,
  onDeleteSkill,
  onReorderSkills
}: SkillManagementProps) {
  const [newSkillName, setNewSkillName] = useState('');
  const [skills, setSkills] = useState(initialSkills);

  const handleAdd = () => {
    if (newSkillName.trim()) {
      const newSkill = {
        id: Date.now().toString(),
        name: newSkillName.trim(),
      };
      const updatedSkills = [...skills, newSkill];
      setSkills(updatedSkills);
      onAddSkill?.(newSkillName.trim());
      onReorderSkills?.(updatedSkills);
      console.log('Compétence ajoutée:', newSkillName);
      setNewSkillName('');
    }
  };

  const handleDelete = (id: string) => {
    const updatedSkills = skills.filter(s => s.id !== id);
    setSkills(updatedSkills);
    onDeleteSkill?.(id);
    onReorderSkills?.(updatedSkills);
    console.log('Compétence supprimée:', id);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updatedSkills = [...skills];
    [updatedSkills[index - 1], updatedSkills[index]] = [updatedSkills[index], updatedSkills[index - 1]];
    setSkills(updatedSkills);
    onReorderSkills?.(updatedSkills);
  };

  const handleMoveDown = (index: number) => {
    if (index === skills.length - 1) return;
    const updatedSkills = [...skills];
    [updatedSkills[index], updatedSkills[index + 1]] = [updatedSkills[index + 1], updatedSkills[index]];
    setSkills(updatedSkills);
    onReorderSkills?.(updatedSkills);
  };

  return (
    <Card className="p-6" data-testid={`skill-management-group-${groupId}`}>
      <h2 className="text-2xl font-bold text-white mb-6" data-testid="management-title">
        Compétences - Groupe {groupId}
      </h2>
      
      <div className="flex gap-3 mb-6">
        <Input
          type="text"
          placeholder="Nom de la compétence..."
          value={newSkillName}
          onChange={(e) => setNewSkillName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1 bg-card text-white border-primary"
          data-testid="input-new-skill"
        />
        <Button
          onClick={handleAdd}
          variant="default"
          data-testid="button-add-skill"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </div>

      <div className="space-y-2">
        {skills.length === 0 ? (
          <p className="text-muted-foreground text-center py-8" data-testid="no-skills-message">
            Aucune compétence. Ajoutez-en une ci-dessus.
          </p>
        ) : (
          skills.map((skill, index) => (
            <div
              key={skill.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-card/40 backdrop-blur-sm border border-primary/30 group"
              data-testid={`skill-item-${skill.id}`}
            >
              <GripVertical className="w-5 h-5 text-muted-foreground cursor-move flex-shrink-0 mt-1" />
              <Badge variant="secondary" className="flex-1 whitespace-normal break-words max-h-fit min-h-[2.25rem] flex items-center justify-center px-3 py-2" data-testid={`skill-name-${skill.id}`}>
                {skill.name}
              </Badge>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  data-testid={`button-move-up-${skill.id}`}
                  className="h-8 w-8"
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === skills.length - 1}
                  data-testid={`button-move-down-${skill.id}`}
                  className="h-8 w-8"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => handleDelete(skill.id)}
                  data-testid={`button-delete-skill-${skill.id}`}
                  className="h-8 w-8"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
