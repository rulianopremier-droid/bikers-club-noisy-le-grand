import SkillSlider from '../SkillSlider';

export default function SkillSliderExample() {
  return (
    <div className="p-8 space-y-6 max-w-md">
      <SkillSlider skillName="Équilibre" value={85} />
      <SkillSlider skillName="Freinage" value={60} />
      <SkillSlider skillName="Virage" value={40} />
      <SkillSlider skillName="Démarrage" value={20} />
    </div>
  );
}
