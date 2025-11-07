import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft } from "lucide-react";
import type { ResumeData, ResumeTemplate } from "@shared/schema";
import { ColorPicker } from "../ColorPicker";

interface TemplateSelectionStepProps {
  data: ResumeData;
  updateData: (data: Partial<ResumeData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const templates: { id: ResumeTemplate; name: string; description: string }[] = [
  { id: "classic", name: "Classic", description: "Traditional chronological format with clean lines" },
  { id: "modern", name: "Modern", description: "Two-column layout with sidebar for skills" },
  { id: "minimalist", name: "Minimalist", description: "Clean design with ample whitespace" },
  { id: "visual", name: "Visual/Infographic", description: "Timeline and skill bars for visual impact" },
  { id: "ats", name: "ATS-Friendly", description: "Simple format optimized for applicant tracking systems" },
];

export function TemplateSelectionStep({ data, updateData, onNext, onBack }: TemplateSelectionStepProps) {
  const [primaryColor, setPrimaryColor] = useState(data.primaryColor || "#3b82f6");

  const handleColorChange = (color: string) => {
    setPrimaryColor(color);
    updateData({ primaryColor: color });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
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
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Choose Your Template</h2>
        <p className="text-muted-foreground">Select a layout that fits your style</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`p-4 cursor-pointer transition-all hover-elevate ${
                data.templateId === template.id
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => updateData({ templateId: template.id })}
              data-testid={`card-template-${template.id}`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-semibold">{template.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>
                  </div>
                  {data.templateId === template.id && (
                    <div className="flex-shrink-0">
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="h-32 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                  {template.name} Preview
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <ColorPicker color={primaryColor} onChange={handleColorChange} />
        </Card>

        <div className="flex justify-end pt-4">
          <Button
            size="lg"
            onClick={onNext}
            disabled={!data.templateId}
            data-testid="button-next"
          >
            Preview & Export
          </Button>
        </div>
      </div>
    </div>
  );
}
