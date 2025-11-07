import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import type { SkillEntry } from "@shared/schema";

interface SkillsFormProps {
  skills: SkillEntry[];
  onChange: (skills: SkillEntry[]) => void;
}

export function SkillsForm({ skills, onChange }: SkillsFormProps) {
  const [newSkill, setNewSkill] = useState({ name: '', category: '' });

  const addSkill = () => {
    if (newSkill.name.trim()) {
      const skill: SkillEntry = {
        id: Date.now().toString(),
        name: newSkill.name,
        category: newSkill.category || 'General',
        level: 3,
      };
      onChange([...skills, skill]);
      setNewSkill({ name: '', category: '' });
    }
  };

  const removeSkill = (id: string) => {
    onChange(skills.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Skills</h3>
        <p className="text-sm text-muted-foreground">Add your technical and soft skills</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Card key={skill.id} className="px-3 py-1.5 flex items-center gap-2">
            <span className="text-sm">{skill.name}</span>
            <button
              onClick={() => removeSkill(skill.id)}
              className="text-muted-foreground hover:text-destructive"
              data-testid={`button-remove-skill-${skill.id}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Skill name (e.g., JavaScript, Leadership)"
            value={newSkill.name}
            onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
            data-testid="input-skill-name"
          />
        </div>
        <div className="w-32">
          <Input
            placeholder="Category"
            value={newSkill.category}
            onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
            data-testid="input-skill-category"
          />
        </div>
        <Button onClick={addSkill} data-testid="button-add-skill">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
