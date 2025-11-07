import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import type { ResumeData } from "@shared/schema";

interface ProfileSummaryStepProps {
  data: ResumeData;
  updateData: (data: Partial<ResumeData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ProfileSummaryStep({ data, updateData, onNext, onBack }: ProfileSummaryStepProps) {
  const [generating, setGenerating] = useState(false);

  const generateSummary = () => {
    setGenerating(true);
    
    setTimeout(() => {
      const summaries: Record<string, string> = {
        professional: `Results-driven ${data.targetJobRole || 'professional'} with a ${data.degree} in ${data.specialization}. Proven expertise in delivering high-impact solutions and driving organizational growth through innovative approaches. Committed to excellence and continuous improvement.`,
        student: `Motivated ${data.degree} graduate specializing in ${data.specialization}, eager to apply academic knowledge and fresh perspectives as a ${data.targetJobRole || 'professional'}. Quick learner with strong analytical skills and a passion for making meaningful contributions.`,
        creative: `Innovative ${data.targetJobRole || 'professional'} with a ${data.degree} background in ${data.specialization}. Creative problem-solver who transforms ideas into reality through unique approaches and out-of-the-box thinking. Passionate about creating impactful solutions.`,
        confident: `Accomplished ${data.targetJobRole || 'professional'} holding a ${data.degree} degree with specialization in ${data.specialization}. Proven track record of exceeding expectations and delivering exceptional results across challenging projects. Ready to take on new challenges.`,
        friendly: `Team-oriented ${data.targetJobRole || 'professional'} with ${data.degree} in ${data.specialization}. Collaborative team player who thrives in dynamic environments and brings positive energy to every project. Dedicated to building strong professional relationships.`,
        bold: `Dynamic ${data.targetJobRole || 'professional'} with robust ${data.degree} education in ${data.specialization}. Consistently exceeds targets and drives transformative change through strategic thinking and decisive action. Ready to make an immediate impact.`,
        humble: `Dedicated ${data.targetJobRole || 'professional'} with ${data.degree} in ${data.specialization}. Committed to continuous learning and growth, bringing strong work ethic and genuine passion for contributing to team success.`,
      };

      const tone = data.writingTone || 'professional';
      const generatedSummary = summaries[tone] || summaries.professional;
      
      updateData({ summary: generatedSummary });
      setGenerating(false);
    }, 1500);
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
        <h2 className="text-3xl font-bold">Professional Summary</h2>
        <p className="text-muted-foreground">
          Write a compelling summary highlighting your strengths
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <p className="text-sm font-medium">AI-Powered Summary Generator</p>
              <p className="text-sm text-muted-foreground">
                Generate a professional summary based on your role ({data.targetJobRole}), 
                degree ({data.degree} - {data.specialization}), and selected tone ({data.writingTone}).
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={generateSummary}
                disabled={generating}
                data-testid="button-generate-summary"
                className="gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Summary
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        <div className="space-y-2">
          <Label htmlFor="summary">Professional Summary</Label>
          <Textarea
            id="summary"
            value={data.summary}
            onChange={(e) => updateData({ summary: e.target.value })}
            placeholder="Write a brief professional summary highlighting your key strengths, experience, and what makes you a great fit for your target role..."
            rows={8}
            data-testid="input-summary"
          />
          <p className="text-xs text-muted-foreground">
            Tip: Keep it concise (3-4 sentences) and focus on your unique value proposition
          </p>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            size="lg"
            onClick={onNext}
            disabled={!data.summary.trim()}
            data-testid="button-next"
          >
            Continue to Education
          </Button>
        </div>
      </div>
    </div>
  );
}
