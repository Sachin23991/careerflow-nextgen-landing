import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Edit } from "lucide-react";
import type { ResumeData } from "@shared/schema";
import { ResumePreviewNew } from "./ResumePreviewNew";

interface FinalPreviewStepProps {
  data: ResumeData;
  onBack: () => void;
  onEdit: (step: number) => void;
}

export function FinalPreviewStep({ data, onBack, onEdit }: FinalPreviewStepProps) {
  const handleExport = () => {
    console.log('Exporting resume as PDF...');
    alert('PDF export functionality will be implemented in the full version!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          data-testid="button-back"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(0)}
            data-testid="button-edit-resume"
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Resume
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            data-testid="button-export-pdf"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Your Resume is Ready!</h2>
        <p className="text-muted-foreground">
          Review your resume and export it as PDF
        </p>
      </div>

      <div className="max-w-4xl mx-auto bg-muted p-8 rounded-md">
        <div className="bg-white dark:bg-card shadow-lg rounded-md overflow-hidden">
          <ResumePreviewNew data={data} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => onEdit(0)}
          data-testid="button-start-over"
        >
          Start Over
        </Button>
        <Button
          size="lg"
          onClick={handleExport}
          data-testid="button-export"
          className="gap-2"
        >
          <Download className="h-5 w-5" />
          Download Resume
        </Button>
      </div>
    </div>
  );
}
