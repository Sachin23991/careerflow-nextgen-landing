import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import type { ResumeTemplate } from "@shared/schema";

interface TemplateSelectorProps {
  selected: ResumeTemplate;
  onSelect: (template: ResumeTemplate) => void;
}

const templates: { id: ResumeTemplate; name: string; description: string }[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional chronological format with clean lines",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Two-column layout with sidebar for skills",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Clean design with ample whitespace",
  },
  {
    id: "visual",
    name: "Visual/Infographic",
    description: "Timeline and skill bars for visual impact",
  },
  {
    id: "ats",
    name: "ATS-Friendly",
    description: "Simple format optimized for applicant tracking systems",
  },
];

export function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Choose Template</h3>
        <p className="text-sm text-muted-foreground">Select a layout that fits your style</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`p-4 cursor-pointer transition-all hover-elevate ${
              selected === template.id ? "border-primary ring-2 ring-primary/20" : ""
            }`}
            onClick={() => onSelect(template.id)}
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
                {selected === template.id && (
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
    </div>
  );
}
