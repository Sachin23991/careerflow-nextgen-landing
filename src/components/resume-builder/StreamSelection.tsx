import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ResumeData } from "@shared/schema";
import { educationalStreams } from "@/data/resumeData";

interface StreamSelectionProps {
  data: ResumeData;
  updateData: (data: Partial<ResumeData>) => void;
  onNext: () => void;
}

export function StreamSelection({ data, updateData, onNext }: StreamSelectionProps) {
  const handleStreamSelect = (streamId: typeof educationalStreams[number]['id']) => {
    updateData({ 
      stream: streamId,
      subStream: "",
      degree: "",
      specialization: ""
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Choose Your Educational Stream</h2>
        <p className="text-muted-foreground">Select the field that best matches your education</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {educationalStreams.map((stream, index) => (
          <Card
            key={stream.id}
            className={`p-6 cursor-pointer transition-all hover-elevate ${
              data.stream === stream.id
                ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                : 'hover:border-primary/50'
            }`}
            onClick={() => handleStreamSelect(stream.id)}
            data-testid={`card-stream-${stream.id}`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="text-4xl">{stream.icon}</div>
                {data.stream === stream.id && (
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{stream.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {stream.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {data.stream && (
        <div className="flex justify-end pt-4">
          <Button 
            size="lg" 
            onClick={onNext}
            data-testid="button-next-stream"
          >
            Continue to Degree Selection
          </Button>
        </div>
      )}
    </div>
  );
}
