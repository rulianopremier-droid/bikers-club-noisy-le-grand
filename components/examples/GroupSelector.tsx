import { useState } from 'react';
import GroupSelector from '../GroupSelector';

export default function GroupSelectorExample() {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  
  return (
    <div className="p-8">
      <GroupSelector 
        selectedGroup={selectedGroup} 
        onSelectGroup={(group) => {
          console.log('Groupe sélectionné:', group);
          setSelectedGroup(group);
        }}
      />
    </div>
  );
}
