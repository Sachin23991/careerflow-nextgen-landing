import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Trash2, Edit } from "lucide-react";
import type { ResumeData, EducationEntry } from "@shared/schema";

interface EducationStepProps {
  data: ResumeData;
  updateData: (data: Partial<ResumeData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function EducationStep({ data, updateData, onNext, onBack }: EducationStepProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<EducationEntry>>({
    degree: "",
    institution: "",
    location: "",
    startYear: "",
    endYear: "",
    current: false,
    gpa: "",
    achievements: "",
  });

  const handleAdd = () => {
    if (formData.degree && formData.institution) {
      const newEntry: EducationEntry = {
        id: Date.now().toString(),
        degree: formData.degree,
        institution: formData.institution,
        location: formData.location || "",
        startYear: formData.startYear || "",
        endYear: formData.current ? "Present" : formData.endYear || "",
        current: formData.current || false,
        gpa: formData.gpa,
        achievements: formData.achievements,
      };

      if (editing) {
        updateData({
          education: data.education.map(e => e.id === editing ? newEntry : e)
        });
        setEditing(null);
      } else {
        updateData({ education: [...data.education, newEntry] });
      }

      setFormData({
        degree: "",
        institution: "",
        location: "",
        startYear: "",
        endYear: "",
        current: false,
        gpa: "",
        achievements: "",
      });
    }
  };

  const handleEdit = (entry: EducationEntry) => {
    setFormData(entry);
    setEditing(entry.id);
  };

  const handleDelete = (id: string) => {
    updateData({ education: data.education.filter(e => e.id !== id) });
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
        <h2 className="text-3xl font-bold">Education Details</h2>
        <p className="text-muted-foreground">Add your educational qualifications</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {data.education.map((entry) => (
          <Card key={entry.id} className="p-4">
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold">{entry.degree}</h3>
                <p className="text-sm text-muted-foreground">{entry.institution}, {entry.location}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {entry.startYear} - {entry.endYear}
                </p>
                {entry.gpa && (
                  <p className="text-xs text-muted-foreground">GPA: {entry.gpa}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(entry)}
                  data-testid={`button-edit-${entry.id}`}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(entry.id)}
                  data-testid={`button-delete-${entry.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        <Card className="p-4">
          <h3 className="font-semibold mb-4">{editing ? 'Edit' : 'Add'} Education</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="degree">Degree *</Label>
              <Input
                id="degree"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                placeholder="B.Tech in Computer Science"
                data-testid="input-degree"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="institution">Institution *</Label>
              <Input
                id="institution"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                placeholder="Indian Institute of Technology"
                data-testid="input-institution"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Delhi"
                data-testid="input-location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpa">GPA/Percentage</Label>
              <Input
                id="gpa"
                value={formData.gpa}
                onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                placeholder="8.5/10 or 85%"
                data-testid="input-gpa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startYear">Start Year</Label>
              <Input
                id="startYear"
                value={formData.startYear}
                onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
                placeholder="2017"
                data-testid="input-start-year"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endYear">End Year</Label>
              <Input
                id="endYear"
                value={formData.endYear}
                onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
                placeholder="2021"
                disabled={formData.current}
                data-testid="input-end-year"
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  id="current"
                  checked={formData.current}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, current: checked as boolean, endYear: checked ? "Present" : "" })
                  }
                  data-testid="checkbox-current"
                />
                <Label htmlFor="current" className="text-sm font-normal cursor-pointer">
                  Currently studying
                </Label>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="achievements">Achievements (Optional)</Label>
              <Textarea
                id="achievements"
                value={formData.achievements}
                onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                placeholder="Dean's list, published research paper, etc."
                rows={3}
                data-testid="input-achievements"
              />
            </div>

            <div className="md:col-span-2">
              <Button
                onClick={handleAdd}
                disabled={!formData.degree || !formData.institution}
                data-testid="button-add-education"
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                {editing ? 'Update' : 'Add'} Education
              </Button>
            </div>
          </div>
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
            disabled={data.education.length === 0}
            data-testid="button-next"
          >
            Continue to Skills
          </Button>
        </div>
      </div>
    </div>
  );
}
