import { SkillsForm } from '../SkillsForm';
import { useState } from 'react';
import type { SkillEntry } from '@shared/schema';

export default function SkillsFormExample() {
  const [skills, setSkills] = useState<SkillEntry[]>([
    { id: '1', name: 'React', category: 'Frontend', level: 4 },
    { id: '2', name: 'Node.js', category: 'Backend', level: 4 },
    { id: '3', name: 'TypeScript', category: 'Language', level: 5 },
  ]);

  return (
    <div className="p-6 max-w-2xl">
      <SkillsForm skills={skills} onChange={setSkills} />
    </div>
  );
}
