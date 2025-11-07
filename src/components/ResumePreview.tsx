import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Linkedin, Github, Globe, User } from "lucide-react";
import type { ResumeData, ResumeConfig } from "@shared/schema";

interface ResumePreviewProps {
  data: ResumeData;
  config: ResumeConfig;
}

export function ResumePreview({ data, config }: ResumePreviewProps) {
  const accentColor = config.primaryColor;

  if (config.template === 'modern') {
    return (
      <div className="bg-white dark:bg-card text-foreground p-8 min-h-[1056px] shadow-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 space-y-6 p-4 rounded-md" style={{ backgroundColor: `${accentColor}10` }}>
            {data.personalInfo.photo && (
              <div className="flex justify-center">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={data.personalInfo.photo} />
                  <AvatarFallback><User className="h-16 w-16" /></AvatarFallback>
                </Avatar>
              </div>
            )}
            
            <div className="space-y-3 text-sm">
              {data.personalInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" style={{ color: accentColor }} />
                  <span className="text-xs break-all">{data.personalInfo.email}</span>
                </div>
              )}
              {data.personalInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" style={{ color: accentColor }} />
                  <span className="text-xs">{data.personalInfo.phone}</span>
                </div>
              )}
              {data.personalInfo.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" style={{ color: accentColor }} />
                  <span className="text-xs">{data.personalInfo.location}</span>
                </div>
              )}
              {data.personalInfo.linkedin && (
                <div className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4" style={{ color: accentColor }} />
                  <span className="text-xs break-all">{data.personalInfo.linkedin}</span>
                </div>
              )}
              {data.personalInfo.github && (
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4" style={{ color: accentColor }} />
                  <span className="text-xs break-all">{data.personalInfo.github}</span>
                </div>
              )}
            </div>

            {data.skills.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: accentColor }}>
                  Skills
                </h3>
                <div className="flex flex-wrap gap-1">
                  {data.skills.map((skill) => (
                    <Badge key={skill.id} variant="secondary" className="text-xs">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{data.personalInfo.name || 'Your Name'}</h1>
              {config.targetRole && (
                <p className="text-lg text-muted-foreground mt-1">{config.targetRole}</p>
              )}
            </div>

            {data.summary && (
              <div className="space-y-2">
                <h2 className="text-lg font-bold uppercase tracking-wide pb-1 border-b-2" style={{ borderColor: accentColor }}>
                  Professional Summary
                </h2>
                <p className="text-sm leading-relaxed">{data.summary}</p>
              </div>
            )}

            {data.experience.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold uppercase tracking-wide pb-1 border-b-2" style={{ borderColor: accentColor }}>
                  Experience
                </h2>
                {data.experience.map((exp) => (
                  <div key={exp.id} className="space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold">{exp.title}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{exp.company}, {exp.location}</p>
                    <p className="text-sm">{exp.description}</p>
                  </div>
                ))}
              </div>
            )}

            {data.education.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold uppercase tracking-wide pb-1 border-b-2" style={{ borderColor: accentColor }}>
                  Education
                </h2>
                {data.education.map((edu) => (
                  <div key={edu.id} className="space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold">{edu.degree}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{edu.graduationYear}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{edu.institution}, {edu.location}</p>
                  </div>
                ))}
              </div>
            )}

            {data.projects.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold uppercase tracking-wide pb-1 border-b-2" style={{ borderColor: accentColor }}>
                  Projects
                </h2>
                {data.projects.map((project) => (
                  <div key={project.id} className="space-y-1">
                    <h3 className="font-semibold">{project.name}</h3>
                    <p className="text-sm">{project.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {project.technologies.map((tech, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-card text-foreground p-8 min-h-[1056px] shadow-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="text-center space-y-2 pb-4 border-b-2" style={{ borderColor: accentColor }}>
        <h1 className="text-3xl font-bold">{data.personalInfo.name || 'Your Name'}</h1>
        {config.targetRole && <p className="text-lg text-muted-foreground">{config.targetRole}</p>}
        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {data.summary && (
          <div className="space-y-2">
            <h2 className="text-lg font-bold" style={{ color: accentColor }}>SUMMARY</h2>
            <p className="text-sm leading-relaxed">{data.summary}</p>
          </div>
        )}

        {data.experience.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold" style={{ color: accentColor }}>EXPERIENCE</h2>
            {data.experience.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex justify-between">
                  <h3 className="font-semibold">{exp.title}</h3>
                  <span className="text-sm text-muted-foreground">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <p className="text-sm text-muted-foreground">{exp.company}, {exp.location}</p>
                <p className="text-sm">{exp.description}</p>
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold" style={{ color: accentColor }}>EDUCATION</h2>
            {data.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between">
                  <h3 className="font-semibold">{edu.degree}</h3>
                  <span className="text-sm text-muted-foreground">{edu.graduationYear}</span>
                </div>
                <p className="text-sm text-muted-foreground">{edu.institution}, {edu.location}</p>
              </div>
            ))}
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-lg font-bold" style={{ color: accentColor }}>SKILLS</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill) => (
                <Badge key={skill.id} variant="secondary">{skill.name}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
