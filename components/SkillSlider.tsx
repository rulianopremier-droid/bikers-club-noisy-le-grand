import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Lock, Unlock } from 'lucide-react';
import { useState } from 'react';

interface SkillSliderProps {
  skillName: string;
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
}

export default function SkillSlider({ 
  skillName, 
  value: initialValue = 0, 
  onChange,
  readOnly = false 
}: SkillSliderProps) {
  const [value, setValue] = useState(initialValue);
  const [isLocked, setIsLocked] = useState(true);

  const getColor = (percentage: number) => {
    if (percentage >= 75) return 'hsl(140, 70%, 50%)';
    if (percentage >= 50) return 'hsl(60, 100%, 50%)';
    if (percentage >= 25) return 'hsl(30, 100%, 50%)';
    return 'hsl(0, 100%, 50%)';
  };

  const handleChange = (newValue: number[]) => {
    if (isLocked) return;
    const val = newValue[0];
    setValue(val);
    onChange?.(val);
    console.log(`${skillName}: ${val}%`);
  };

  const toggleLock = () => {
    setIsLocked(!isLocked);
    console.log(`${skillName} ${isLocked ? 'déverrouillé' : 'verrouillé'}`);
  };

  return (
    <div className="space-y-2" data-testid={`skill-slider-${skillName.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex justify-between items-center gap-2">
        <label className="text-sm font-medium text-white flex-1" data-testid="skill-name">
          {skillName}
        </label>
        <Button
          size="icon"
          variant={isLocked ? 'secondary' : 'default'}
          onClick={toggleLock}
          className="min-h-8 w-8 h-8"
          data-testid="button-toggle-lock"
          title={isLocked ? 'Déverrouiller pour modifier' : 'Verrouiller'}
        >
          {isLocked ? (
            <Lock className="w-3 h-3" />
          ) : (
            <Unlock className="w-3 h-3" />
          )}
        </Button>
        <span 
          className="text-sm font-bold px-2 py-1 rounded"
          style={{ 
            backgroundColor: getColor(value),
            color: '#000'
          }}
          data-testid="skill-percentage"
        >
          {value}%
        </span>
      </div>
      <div className="relative">
        <Slider
          value={[value]}
          onValueChange={handleChange}
          max={100}
          step={5}
          disabled={readOnly || isLocked}
          className={isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}
          data-testid="skill-slider-input"
          style={{
            // @ts-ignore
            '--slider-color': getColor(value),
          }}
        />
        <style>
          {`
            [data-testid="skill-slider-input"] [role="slider"] {
              background-color: ${getColor(value)};
              border-color: ${getColor(value)};
            }
            [data-testid="skill-slider-input"] [data-orientation="horizontal"] {
              background-color: ${getColor(value)};
            }
          `}
        </style>
      </div>
    </div>
  );
}
