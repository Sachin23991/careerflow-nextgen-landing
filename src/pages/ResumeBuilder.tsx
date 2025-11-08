import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./resumeBuilder.page.css";
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
  const navigate = useNavigate();
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

  // auto-advance for selection-style steps (0:Stream,1:Degree,2:JobRole,3:Tone,11:Template)
  const autoAdvanceSteps = new Set<number>([0, 1, 2, 3, 11]);

  // wrapper that delegates to resume context update and auto-advances on selection steps
  const updateDataAndMaybeAdvance = (patch: any) => {
    // forward update to context
    updateResumeData(patch);

    // if current step is a selection step, advance immediately (small delay for UX)
    if (autoAdvanceSteps.has(currentStep)) {
      // small timeout to let child updates settle — adjust if needed
      setTimeout(() => {
        setCurrentStep((s) => Math.min(s + 1, steps.length));
        window.scrollTo(0, 0);
      }, 120);
    }
  };

  return (
    <div className="min-h-screen flex flex-col resumeBuilderRoot">
      <header className="resumeHeader border-b sticky top-0 z-50">
        <div className="container px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* clickable logo + title -> go to Resume Builder home */}
            <button
              onClick={() => navigate('/resume-builder')}
              aria-label="Resume Builder Home"
              className="flex items-center gap-3 focus:outline-none"
            >
              <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain logoImg" />
              <div>
                <span className="font-semibold">Resume Builder</span>
                <p className="text-xs text-muted-foreground">
                  Step {currentStep + 1} of {steps.length + 1}: {currentStep < steps.length ? steps[currentStep].name : "Preview"}
                </p>
              </div>
            </button>

            {/* right side: conditional Dashboard (only on final) + ThemeToggle */}
            <div className="ml-auto flex items-center gap-3">
              {currentStep === steps.length && (
                <button
                  onClick={() => navigate('/dashboard')}
                  aria-label="Go to dashboard"
                  className="flex items-center gap-2 px-3 py-1 rounded-md bg-transparent hover:bg-accent/10 focus:outline-none"
                >
                  <img src="/logo.png" alt="Dashboard" className="h-4 w-4 object-contain logoImg" />
                  <span className="hidden sm:inline text-sm">Dashboard</span>
                </button>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
        
        <Progress value={progress} className="h-1" />
      </header>

      <main className="flex-1 container max-w-6xl px-4 py-8">
        {CurrentStepComponent ? (
          <CurrentStepComponent
            data={resumeData}
            updateData={updateDataAndMaybeAdvance}
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
