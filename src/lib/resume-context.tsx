import { createContext, useContext, useState, ReactNode } from 'react';
// changed: use relative path to local schema file
import type { ResumeData } from '../shared/schema';

interface ResumeContextType {
  resumeData: ResumeData;
  updateResumeData: (data: Partial<ResumeData>) => void;
  resetResumeData: () => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const initialResumeData: ResumeData = {
  stream: "",
  subStream: "",
  degree: "",
  specialization: "",
  targetJobRole: "",
  writingTone: "",
  templateId: "modern",
  primaryColor: "#3b82f6",
  
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  location: "",
  profilePicture: "",
  linkedin: "",
  github: "",
  portfolio: "",
  
  summary: "",
  
  education: [],
  skills: [],
  experience: [],
  projects: [],
  certifications: [],
  languages: [],
  customSections: [],
};

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);

  const updateResumeData = (data: Partial<ResumeData>) => {
    setResumeData(prev => ({ ...prev, ...data }));
  };

  const resetResumeData = () => {
    setResumeData(initialResumeData);
  };

  return (
    <ResumeContext.Provider
      value={{
        resumeData,
        updateResumeData,
        resetResumeData,
      }}
    >
      {children}
    </ ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within ResumeProvider');
  }
  return context;
}
