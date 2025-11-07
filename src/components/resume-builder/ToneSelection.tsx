import { Card } from "@/components/ui/card";
import { Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ResumeData } from "@shared/schema";
import { writingTones } from "@/data/resumeData";

interface ToneSelectionProps {
  data: ResumeData;
  updateData: (data: Partial<ResumeData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ToneSelection({ data, updateData, onNext, onBack }: ToneSelectionProps) {
  const handleToneSelect = (toneId: typeof writingTones[number]['id']) => {
    updateData({ writingTone: toneId });
    setTimeout(() => onNext(), 300);
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
        <h2 className="text-3xl font-bold">Choose Your Writing Tone</h2>
        <p className="text-muted-foreground">
          This will influence how your resume content is generated
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {writingTones.map((tone, index) => (
          <Card
            key={tone.id}
            className={`p-5 cursor-pointer transition-all hover-elevate ${
              data.writingTone === tone.id
                ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                : 'hover:border-primary/50'
            }`}
            onClick={() => handleToneSelect(tone.id)}
            data-testid={`card-tone-${tone.id}`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="text-3xl">{tone.icon}</div>
                {data.writingTone === tone.id && (
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{tone.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {tone.description}
                </p>
              </div>
              <div className={`p-3 rounded-md text-xs italic border ${tone.color}`}>
                "{tone.example}"
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
