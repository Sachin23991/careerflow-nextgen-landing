import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type ResumeTemplate = "classic" | "modern" | "minimalist" | "visual" | "ats";
export type ResumeTone = "professional" | "student" | "creative" | "friendly" | "bold" | "confident" | "humble";
export type EducationalStream = "science" | "commerce" | "arts" | "medical" | "engineering" | "law" | "management";

export interface ResumeData {
  stream: EducationalStream | "";
  subStream: string;
  degree: string;
  specialization: string;
  targetJobRole: string;
  writingTone: ResumeTone | "";
  templateId: ResumeTemplate;
  primaryColor: string;
  
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  profilePicture: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  
  summary: string;
  
  education: EducationEntry[];
  skills: SkillEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  certifications: CertificationEntry[];
  languages?: LanguageEntry[];
  customSections?: CustomSection[];
}

export interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startYear: string;
  endYear: string;
  current: boolean;
  gpa?: string;
  achievements?: string;
}

export interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements?: string[];
}

export interface SkillEntry {
  id: string;
  name: string;
  category: string;
  level?: number;
}

export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  startDate?: string;
  endDate?: string;
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  link?: string;
}

export interface LanguageEntry {
  id: string;
  language: string;
  proficiency: string;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
}
