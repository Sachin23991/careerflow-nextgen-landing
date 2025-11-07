import { TemplateSelector } from '../TemplateSelector';
import { useState } from 'react';
import type { ResumeTemplate } from '@shared/schema';

export default function TemplateSelectorExample() {
  const [selected, setSelected] = useState<ResumeTemplate>('modern');
  
  return (
    <div className="p-6">
      <TemplateSelector selected={selected} onSelect={setSelected} />
    </div>
  );
}
