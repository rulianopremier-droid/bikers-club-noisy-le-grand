import { Card } from '@/components/ui/card';
import groupe1Url from '@assets/icon_groupe_1_avec_cercle_1763999912892.png';
import groupe2Url from '@assets/icon_groupe_2_avec_cercle_1763999912841.png';
import groupe3Url from '@assets/icon_groupe_3_avec_cercle_1763999912860.png';
import groupe4Url from '@assets/icon_groupe_4_avec_cercle_1763999912873.png';

interface GroupSelectorProps {
  selectedGroup: number | null;
  onSelectGroup: (group: number) => void;
}

const groups = [
  { id: 1, label: 'Groupe 1', image: groupe1Url, color: '#00FF00' },
  { id: 2, label: 'Groupe 2', image: groupe2Url, color: '#FFFF00' },
  { id: 3, label: 'Groupe 3', image: groupe3Url, color: '#FFA500' },
  { id: 4, label: 'Groupe 4', image: groupe4Url, color: '#FF0000' },
];

export default function GroupSelector({ selectedGroup, onSelectGroup }: GroupSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {groups.map((group) => (
        <Card
          key={group.id}
          className={`p-6 cursor-pointer transition-all hover-elevate active-elevate-2 ${
            selectedGroup === group.id ? 'ring-4 ring-primary' : ''
          }`}
          onClick={() => onSelectGroup(group.id)}
          data-testid={`group-selector-${group.id}`}
        >
          <div className="flex flex-col items-center gap-4">
            <img 
              src={group.image} 
              alt={group.label} 
              className="w-24 h-24 object-contain"
              data-testid={`group-image-${group.id}`}
            />
            <h3 className="text-xl font-bold text-white" data-testid={`group-label-${group.id}`}>
              {group.label}
            </h3>
          </div>
        </Card>
      ))}
    </div>
  );
}
