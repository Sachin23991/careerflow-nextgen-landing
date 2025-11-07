import { useState } from "react";
import { useResume } from "@/lib/resume-context";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StreamSelection } from "@/components/resume-builder/StreamSelection";
import { DegreeSelection } from "@/components/resume-builder/DegreeSelection";
import { JobRoleSelection } from "@/components/resume-builder/JobRoleSelection";
import { ToneSelection } from "@/components/resume-builder/ToneSelection";
import { PersonalInfoStep } from "@/components/resume-builder/PersonalInfoStep";
import { ProfileSummaryStep } from "@/components/resume-builder/ProfileSummaryStep";
import { EducationStep } from "@/components/resume-builder/EducationStep";
import { SkillsStep } from "@/components/resume-builder/SkillsStep";
import { ExperienceStep } from "@/components/resume-builder/ExperienceStep";
import { ProjectsStep } from "@/components/resume-builder/ProjectsStep";
import { CertificationsStep } from "@/components/resume-builder/CertificationsStep";
import { TemplateSelectionStep } from "@/components/resume-builder/TemplateSelectionStep";
import { FinalPreviewStep } from "@/components/resume-builder/FinalPreviewStep";

export default function ResumeBuilder() {
  const { resumeData, updateResumeData } = useResume();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { component: StreamSelection, name: "Stream" },
    { component: DegreeSelection, name: "Degree" },
    { component: JobRoleSelection, name: "Job Role" },
    { component: ToneSelection, name: "Tone" },
    { component: PersonalInfoStep, name: "Personal Info" },
    { component: ProfileSummaryStep, name: "Summary" },
    { component: EducationStep, name: "Education" },
    { component: SkillsStep, name: "Skills" },
    { component: ExperienceStep, name: "Experience" },
    { component: ProjectsStep, name: "Projects" },
    { component: CertificationsStep, name: "Certifications" },
    { component: TemplateSelectionStep, name: "Template" },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const progress = ((currentStep + 1) / (steps.length + 1)) * 100;

  const CurrentStepComponent = currentStep < steps.length 
    ? steps[currentStep].component 
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
              R
            </div>
            <div>
              <span className="font-semibold">Resume Builder</span>
              <p className="text-xs text-muted-foreground">
                Step {currentStep + 1} of {steps.length + 1}: {currentStep < steps.length ? steps[currentStep].name : "Preview"}
              </p>
            </div>
          </div>
          
          <ThemeToggle />
        </div>
        
        <Progress value={progress} className="h-1" />
      </header>

      <main className="flex-1 container max-w-6xl px-4 py-8">
        {CurrentStepComponent ? (
          <CurrentStepComponent
            data={resumeData}
            updateData={updateResumeData}
            onNext={handleNext}
            onBack={handleBack}
          />
        ) : (
          <FinalPreviewStep
            data={resumeData}
            onBack={handleBack}
            onEdit={(step) => setCurrentStep(step)}
          />
        )}
      </main>
    </div>
  );
}
