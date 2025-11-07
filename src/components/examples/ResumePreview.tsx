import { ResumePreview } from '../ResumePreview';
import type { ResumeData, ResumeConfig } from '@shared/schema';

export default function ResumePreviewExample() {
  const mockData: ResumeData = {
    personalInfo: {
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@example.com',
      phone: '+91 98765 43210',
      location: 'Bangalore, Karnataka',
      linkedin: 'linkedin.com/in/rajeshkumar',
      github: 'github.com/rajeshkumar',
    },
    summary: 'Results-driven Software Engineer with 3+ years of experience building scalable web applications using React, Node.js, and cloud technologies. Passionate about creating intuitive user experiences and solving complex technical challenges.',
    education: [
      {
        id: '1',
        degree: 'B.Tech in Computer Science',
        institution: 'Indian Institute of Technology',
        location: 'Delhi',
        graduationYear: '2021',
      },
    ],
    experience: [
      {
        id: '1',
        title: 'Software Engineer',
        company: 'Tech Solutions Pvt Ltd',
        location: 'Bangalore',
        startDate: 'Jan 2021',
        endDate: 'Present',
        current: true,
        description: 'Developed and maintained multiple client-facing web applications using React and Node.js. Improved application performance by 40% through optimization techniques.',
      },
    ],
    skills: [
      { id: '1', name: 'React', category: 'Frontend', level: 4 },
      { id: '2', name: 'Node.js', category: 'Backend', level: 4 },
      { id: '3', name: 'JavaScript', category: 'Language', level: 5 },
      { id: '4', name: 'TypeScript', category: 'Language', level: 4 },
      { id: '5', name: 'MongoDB', category: 'Database', level: 3 },
    ],
    projects: [
      {
        id: '1',
        name: 'E-Commerce Platform',
        description: 'Built a full-stack e-commerce platform with payment integration and real-time inventory management',
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      },
    ],
    certifications: [],
  };

  const mockConfig: ResumeConfig = {
    template: 'modern',
    primaryColor: '#3b82f6',
    tone: 'professional',
    targetRole: 'Software Engineer',
    degree: 'B.Tech CSE',
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects'],
    skillVisualization: 'tags',
  };

  return (
    <div className="p-6 bg-muted">
      <div className="max-w-4xl mx-auto">
        <ResumePreview data={mockData} config={mockConfig} />
      </div>
    </div>
  );
}
