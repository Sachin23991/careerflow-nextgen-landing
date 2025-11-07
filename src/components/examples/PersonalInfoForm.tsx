import { PersonalInfoForm } from '../PersonalInfoForm';
import { useState } from 'react';
import type { ResumeData } from '@shared/schema';

export default function PersonalInfoFormExample() {
  const [data, setData] = useState<ResumeData['personalInfo']>({
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 98765 43210',
    location: 'Bangalore, Karnataka',
    linkedin: 'linkedin.com/in/priyasharma',
    github: 'github.com/priyasharma',
  });

  return (
    <div className="p-6 max-w-3xl">
      <PersonalInfoForm 
        data={data} 
        onChange={(updates) => setData({ ...data, ...updates })} 
      />
    </div>
  );
}
