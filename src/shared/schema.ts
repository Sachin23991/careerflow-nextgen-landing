export interface EducationEntry {
  id?: string;
  institution?: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  description?: string;
}

export interface ExperienceEntry {
  id?: string;
  company?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  description?: string;
}

export interface Project {
  id?: string;
  title?: string;
  link?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  technologies?: string[];
}

export interface Certification {
  id?: string;
  name?: string;
  issuer?: string;
  date?: string;
  link?: string;
}

export interface Language {
  name?: string;
  proficiency?: string;
}

export interface CustomSection {
  id?: string;
  title?: string;
  items?: { id?: string; content?: string }[];
}

export type Skill = string;

export interface ResumeData {
  stream: string;
  subStream: string;
  degree: string;
  specialization: string;
  targetJobRole: string;
  writingTone: string;
  templateId: string;
  primaryColor: string;

  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  profilePicture: string;
  linkedin: string;
  github: string;
  portfolio: string;

  summary: string;

  education: EducationEntry[];
  skills: Skill[];
  experience: ExperienceEntry[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  customSections: CustomSection[];
}
