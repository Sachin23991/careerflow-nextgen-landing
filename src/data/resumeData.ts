import type { EducationalStream } from '@shared/schema';

export const educationalStreams = [
  {
    id: 'science' as const,
    name: 'Science & Technology',
    description: 'Engineering, Computer Science, Pure Sciences',
    icon: '🔬',
    subStreams: ['Engineering', 'Computer Science', 'Pure Sciences', 'Applied Sciences']
  },
  {
    id: 'commerce' as const,
    name: 'Commerce & Finance',
    description: 'Accounting, Finance, Business Administration',
    icon: '💼',
    subStreams: ['Accounting', 'Finance', 'Business', 'Economics']
  },
  {
    id: 'arts' as const,
    name: 'Arts & Humanities',
    description: 'Literature, History, Psychology, Sociology',
    icon: '🎨',
    subStreams: ['Literature', 'History', 'Psychology', 'Languages', 'Philosophy']
  },
  {
    id: 'medical' as const,
    name: 'Medical & Healthcare',
    description: 'Medicine, Nursing, Pharmacy, Allied Health',
    icon: '⚕️',
    subStreams: ['Medicine', 'Nursing', 'Pharmacy', 'Physiotherapy', 'Dentistry']
  },
  {
    id: 'engineering' as const,
    name: 'Engineering & Architecture',
    description: 'Civil, Mechanical, Electrical, Architecture',
    icon: '⚙️',
    subStreams: ['Civil', 'Mechanical', 'Electrical', 'Architecture', 'Chemical']
  },
  {
    id: 'law' as const,
    name: 'Law & Legal Studies',
    description: 'Corporate Law, Criminal Law, Constitutional Law',
    icon: '⚖️',
    subStreams: ['Corporate Law', 'Criminal Law', 'Civil Law', 'Constitutional Law']
  },
  {
    id: 'management' as const,
    name: 'Management & Business',
    description: 'MBA, Hotel Management, Retail Management',
    icon: '📊',
    subStreams: ['MBA', 'Hotel Management', 'Retail', 'Marketing', 'HR']
  }
];

export const degreesByStream: Record<EducationalStream | string, Array<{ name: string; specializations: string[] }>> = {
  science: [
    { name: 'B.Tech/B.E.', specializations: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Chemical'] },
    { name: 'B.Sc', specializations: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'Statistics', 'Environmental Science'] },
    { name: 'M.Tech/M.E.', specializations: ['Computer Science', 'Data Science', 'Machine Learning', 'VLSI', 'Embedded Systems', 'Structural Engineering'] },
    { name: 'M.Sc', specializations: ['Physics', 'Chemistry', 'Mathematics', 'Biotechnology', 'Microbiology', 'Bioinformatics'] },
    { name: 'BCA', specializations: ['General', 'Cloud Computing', 'Data Science'] },
    { name: 'MCA', specializations: ['General', 'Artificial Intelligence', 'Cyber Security'] }
  ],
  commerce: [
    { name: 'B.Com', specializations: ['General', 'Accounting & Finance', 'Banking & Insurance', 'Taxation', 'E-Commerce'] },
    { name: 'BBA', specializations: ['Finance', 'Marketing', 'Human Resources', 'International Business', 'Entrepreneurship'] },
    { name: 'M.Com', specializations: ['Accounting', 'Finance', 'Taxation', 'Business Economics'] },
    { name: 'MBA', specializations: ['Finance', 'Marketing', 'HR', 'Operations', 'IT', 'International Business', 'Analytics'] },
    { name: 'CA', specializations: ['Chartered Accountancy'] },
    { name: 'CS', specializations: ['Company Secretary'] }
  ],
  arts: [
    { name: 'BA', specializations: ['English', 'Hindi', 'History', 'Psychology', 'Sociology', 'Political Science', 'Economics', 'Philosophy'] },
    { name: 'MA', specializations: ['English Literature', 'History', 'Psychology', 'Sociology', 'Political Science', 'Economics'] },
    { name: 'B.Ed', specializations: ['General', 'Special Education'] },
    { name: 'M.Ed', specializations: ['Educational Administration', 'Curriculum Development'] },
    { name: 'BFA', specializations: ['Painting', 'Sculpture', 'Applied Arts', 'Photography'] },
    { name: 'MFA', specializations: ['Visual Arts', 'Performing Arts', 'Creative Writing'] }
  ],
  medical: [
    { name: 'MBBS', specializations: ['General Medicine'] },
    { name: 'MD', specializations: ['General Medicine', 'Pediatrics', 'Dermatology', 'Psychiatry', 'Radiology', 'Anesthesiology'] },
    { name: 'MS', specializations: ['General Surgery', 'Orthopedics', 'Ophthalmology', 'ENT', 'Obstetrics & Gynecology'] },
    { name: 'BDS', specializations: ['General Dentistry'] },
    { name: 'MDS', specializations: ['Orthodontics', 'Oral Surgery', 'Periodontics', 'Prosthodontics'] },
    { name: 'B.Pharm', specializations: ['General', 'Clinical Pharmacy'] },
    { name: 'M.Pharm', specializations: ['Pharmacology', 'Pharmaceutics', 'Pharmaceutical Chemistry'] },
    { name: 'BPT', specializations: ['Physiotherapy'] },
    { name: 'BSc Nursing', specializations: ['General Nursing', 'Critical Care'] }
  ],
  engineering: [
    { name: 'B.Tech Civil', specializations: ['Structural Engineering', 'Transportation', 'Environmental', 'Geotechnical'] },
    { name: 'B.Tech Mechanical', specializations: ['Thermal', 'Design', 'Manufacturing', 'Automotive'] },
    { name: 'B.Arch', specializations: ['Architecture', 'Urban Planning', 'Landscape Architecture'] },
    { name: 'M.Tech', specializations: ['Structural Engineering', 'Construction Management', 'Transportation Engineering'] }
  ],
  law: [
    { name: 'BA LLB', specializations: ['General'] },
    { name: 'BBA LLB', specializations: ['General'] },
    { name: 'LLB', specializations: ['General'] },
    { name: 'LLM', specializations: ['Corporate Law', 'Criminal Law', 'Constitutional Law', 'Intellectual Property', 'International Law', 'Tax Law'] }
  ],
  management: [
    { name: 'BHM', specializations: ['Hotel Management', 'Hospitality'] },
    { name: 'BBA', specializations: ['General Management', 'Tourism', 'Event Management'] },
    { name: 'MBA', specializations: ['Hospitality Management', 'Tourism Management', 'Event Management', 'Retail Management'] },
    { name: 'PGDM', specializations: ['Finance', 'Marketing', 'Operations', 'HR'] }
  ]
};

export const jobRolesByStream: Record<EducationalStream | string, string[]> = {
  science: [
    'Software Engineer', 'Data Scientist', 'Machine Learning Engineer', 'Full Stack Developer',
    'DevOps Engineer', 'Cloud Architect', 'Research Scientist', 'Data Analyst',
    'Systems Engineer', 'Network Engineer', 'Cybersecurity Analyst', 'QA Engineer',
    'Product Manager', 'Technical Lead', 'Solution Architect'
  ],
  commerce: [
    'Accountant', 'Financial Analyst', 'Investment Banker', 'Tax Consultant',
    'Auditor', 'Business Analyst', 'Management Consultant', 'Marketing Manager',
    'Sales Manager', 'HR Manager', 'Operations Manager', 'Financial Controller',
    'Business Development Manager', 'Product Manager', 'Strategy Consultant'
  ],
  arts: [
    'Content Writer', 'Teacher', 'Lecturer', 'Journalist', 'Editor',
    'Social Worker', 'Counselor', 'Psychologist', 'HR Specialist',
    'Research Analyst', 'Public Relations Officer', 'Marketing Executive',
    'Digital Marketing Specialist', 'UX Writer', 'Curriculum Developer'
  ],
  medical: [
    'Doctor', 'Surgeon', 'Physician', 'Dentist', 'Pharmacist',
    'Medical Officer', 'Clinical Research Coordinator', 'Medical Writer',
    'Healthcare Administrator', 'Physiotherapist', 'Nurse', 'Lab Technician',
    'Radiologist', 'Pathologist', 'Anesthesiologist', 'Medical Consultant'
  ],
  engineering: [
    'Civil Engineer', 'Structural Engineer', 'Architect', 'Project Manager',
    'Site Engineer', 'Quantity Surveyor', 'Construction Manager', 'Urban Planner',
    'MEP Engineer', 'CAD Designer', 'Building Inspector', 'Safety Officer'
  ],
  law: [
    'Lawyer', 'Legal Advisor', 'Corporate Lawyer', 'Litigation Lawyer',
    'Legal Consultant', 'Company Secretary', 'Compliance Officer', 'Legal Analyst',
    'Paralegal', 'Judge', 'Public Prosecutor', 'Legal Research Associate'
  ],
  management: [
    'Hotel Manager', 'Restaurant Manager', 'Event Manager', 'Front Office Manager',
    'Food & Beverage Manager', 'Operations Manager', 'Business Development Manager',
    'Marketing Manager', 'Sales Manager', 'Customer Success Manager'
  ]
};

export const writingTones = [
  {
    id: 'professional' as const,
    name: 'Professional',
    description: 'Formal, business-oriented language',
    icon: '💼',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    example: 'Results-driven professional with extensive experience...'
  },
  {
    id: 'student' as const,
    name: 'Student/Fresher',
    description: 'Enthusiastic and eager to learn',
    icon: '🎓',
    color: 'bg-green-50 border-green-200 text-green-700',
    example: 'Motivated recent graduate eager to apply knowledge...'
  },
  {
    id: 'creative' as const,
    name: 'Creative',
    description: 'Unique and expressive style',
    icon: '🎨',
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    example: 'Innovative thinker who transforms ideas into reality...'
  },
  {
    id: 'confident' as const,
    name: 'Confident',
    description: 'Bold and assertive approach',
    icon: '💪',
    color: 'bg-orange-50 border-orange-200 text-orange-700',
    example: 'Accomplished leader with proven track record...'
  },
  {
    id: 'friendly' as const,
    name: 'Friendly',
    description: 'Warm and approachable tone',
    icon: '😊',
    color: 'bg-pink-50 border-pink-200 text-pink-700',
    example: 'Team-oriented professional who loves collaborating...'
  },
  {
    id: 'bold' as const,
    name: 'Bold',
    description: 'Strong and impactful statements',
    icon: '🔥',
    color: 'bg-red-50 border-red-200 text-red-700',
    example: 'Dynamic achiever who consistently exceeds targets...'
  }
];
