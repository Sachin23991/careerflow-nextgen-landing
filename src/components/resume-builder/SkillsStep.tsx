import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ResumeData, SkillEntry } from "@shared/schema";

interface SkillsStepProps {
  data: ResumeData;
  updateData: (data: Partial<ResumeData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function SkillsStep({ data, updateData, onNext, onBack }: SkillsStepProps) {
  const [skillName, setSkillName] = useState("");
  const [skillCategory, setSkillCategory] = useState("");

  const addSkill = () => {
    if (skillName.trim()) {
      const newSkill: SkillEntry = {
        id: Date.now().toString(),
        name: skillName.trim(),
        category: skillCategory.trim() || "General",
        level: 3,
      };
      updateData({ skills: [...data.skills, newSkill] });
      setSkillName("");
      setSkillCategory("");
    }
  };

  const removeSkill = (id: string) => {
    updateData({ skills: data.skills.filter(s => s.id !== id) });
  };

  const groupedSkills = data.skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, SkillEntry[]>);

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
        <h2 className="text-3xl font-bold">Skills & Expertise</h2>
        <p className="text-muted-foreground">Add your technical and soft skills</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {Object.keys(groupedSkills).length > 0 && (
          <div className="space-y-4">
            {Object.entries(groupedSkills).map(([category, skills]) => (
              <Card key={category} className="p-4">
                <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                  {category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant="secondary"
                      className="gap-2 pr-1"
                      data-testid={`badge-skill-${skill.id}`}
                    >
                      <span>{skill.name}</span>
                      <button
                        onClick={() => removeSkill(skill.id)}
                        className="hover:text-destructive rounded-sm p-0.5 hover-elevate"
                        data-testid={`button-remove-skill-${skill.id}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Add New Skill</h3>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="skill-name" className="sr-only">Skill Name</Label>
              <Input
                id="skill-name"
                placeholder="Skill name (e.g., JavaScript, Leadership)"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                data-testid="input-skill-name"
              />
            </div>
            <div className="w-40">
              <Label htmlFor="skill-category" className="sr-only">Category</Label>
              <Input
                id="skill-category"
                placeholder="Category"
                value={skillCategory}
                onChange={(e) => setSkillCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                data-testid="input-skill-category"
              />
            </div>
            <Button
              onClick={addSkill}
              disabled={!skillName.trim()}
              data-testid="button-add-skill"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Tip: Categorize skills as Technical, Soft Skills, Languages, Tools, etc.
          </p>
        </Card>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={onNext}
            data-testid="button-skip"
          >
            Skip for Now
          </Button>
          <Button
            size="lg"
            onClick={onNext}
            disabled={data.skills.length === 0}
            data-testid="button-next"
          >
            Continue to Experience
          </Button>
        </div>
      </div>
    </div>
  );
}
