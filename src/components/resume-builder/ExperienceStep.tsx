import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Trash2, Edit } from "lucide-react";
import type { ResumeData, ExperienceEntry } from "@shared/schema";

interface ExperienceStepProps {
  data: ResumeData;
  updateData: (data: Partial<ResumeData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ExperienceStep({ data, updateData, onNext, onBack }: ExperienceStepProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ExperienceEntry>>({
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });

  const handleAdd = () => {
    if (formData.title && formData.company) {
      const newEntry: ExperienceEntry = {
        id: Date.now().toString(),
        title: formData.title,
        company: formData.company,
        location: formData.location || "",
        startDate: formData.startDate || "",
        endDate: formData.current ? "Present" : formData.endDate || "",
        current: formData.current || false,
        description: formData.description || "",
      };

      if (editing) {
        updateData({
          experience: data.experience.map(e => e.id === editing ? newEntry : e)
        });
        setEditing(null);
      } else {
        updateData({ experience: [...data.experience, newEntry] });
      }

      setFormData({
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      });
    }
  };

  const handleEdit = (entry: ExperienceEntry) => {
    setFormData(entry);
    setEditing(entry.id);
  };

  const handleDelete = (id: string) => {
    updateData({ experience: data.experience.filter(e => e.id !== id) });
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
        <h2 className="text-3xl font-bold">Work Experience</h2>
        <p className="text-muted-foreground">Add your professional experience</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {data.experience.map((entry) => (
          <Card key={entry.id} className="p-4">
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold">{entry.title}</h3>
                <p className="text-sm text-muted-foreground">{entry.company}, {entry.location}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {entry.startDate} - {entry.endDate}
                </p>
                {entry.description && (
                  <p className="text-sm mt-2">{entry.description}</p>
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
          <h3 className="font-semibold mb-4">{editing ? 'Edit' : 'Add'} Experience</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Software Engineer"
                data-testid="input-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Tech Solutions Pvt Ltd"
                data-testid="input-company"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exp-location">Location</Label>
              <Input
                id="exp-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Bangalore"
                data-testid="input-exp-location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                placeholder="Jan 2021"
                data-testid="input-start-date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                placeholder="Dec 2023"
                disabled={formData.current}
                data-testid="input-end-date"
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  id="exp-current"
                  checked={formData.current}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, current: checked as boolean, endDate: checked ? "Present" : "" })
                  }
                  data-testid="checkbox-exp-current"
                />
                <Label htmlFor="exp-current" className="text-sm font-normal cursor-pointer">
                  Currently working here
                </Label>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description & Achievements</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your key responsibilities and achievements..."
                rows={5}
                data-testid="input-description"
              />
            </div>

            <div className="md:col-span-2">
              <Button
                onClick={handleAdd}
                disabled={!formData.title || !formData.company}
                data-testid="button-add-experience"
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                {editing ? 'Update' : 'Add'} Experience
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
            data-testid="button-next"
          >
            Continue to Projects
          </Button>
        </div>
      </div>
    </div>
  );
}
