import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Edit, X } from "lucide-react";
import type { ResumeData, ProjectEntry } from "@shared/schema";

interface ProjectsStepProps {
  data: ResumeData;
  updateData: (data: Partial<ResumeData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ProjectsStep({ data, updateData, onNext, onBack }: ProjectsStepProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ProjectEntry>>({
    name: "",
    description: "",
    technologies: [],
    link: "",
  });
  const [techInput, setTechInput] = useState("");

  const handleAdd = () => {
    if (formData.name && formData.description) {
      const newEntry: ProjectEntry = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        technologies: formData.technologies || [],
        link: formData.link,
      };

      if (editing) {
        updateData({
          projects: data.projects.map(p => p.id === editing ? newEntry : p)
        });
        setEditing(null);
      } else {
        updateData({ projects: [...data.projects, newEntry] });
      }

      setFormData({
        name: "",
        description: "",
        technologies: [],
        link: "",
      });
    }
  };

  const handleEdit = (entry: ProjectEntry) => {
    setFormData(entry);
    setEditing(entry.id);
  };

  const handleDelete = (id: string) => {
    updateData({ projects: data.projects.filter(p => p.id !== id) });
  };

  const addTech = () => {
    if (techInput.trim() && !formData.technologies?.includes(techInput.trim())) {
      setFormData({
        ...formData,
        technologies: [...(formData.technologies || []), techInput.trim()]
      });
      setTechInput("");
    }
  };

  const removeTech = (tech: string) => {
    setFormData({
      ...formData,
      technologies: formData.technologies?.filter(t => t !== tech) || []
    });
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
        <h2 className="text-3xl font-bold">Projects</h2>
        <p className="text-muted-foreground">Showcase your key projects</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {data.projects.map((entry) => (
          <Card key={entry.id} className="p-4">
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold">{entry.name}</h3>
                <p className="text-sm mt-1">{entry.description}</p>
                {entry.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entry.technologies.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
                    ))}
                  </div>
                )}
                {entry.link && (
                  <p className="text-xs text-muted-foreground mt-2">Link: {entry.link}</p>
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
          <h3 className="font-semibold mb-4">{editing ? 'Edit' : 'Add'} Project</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name *</Label>
              <Input
                id="project-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="E-Commerce Platform"
                data-testid="input-project-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">Description *</Label>
              <Textarea
                id="project-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what you built and your key contributions..."
                rows={4}
                data-testid="input-project-description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-link">Project Link (Optional)</Label>
              <Input
                id="project-link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://github.com/..."
                data-testid="input-project-link"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tech">Technologies Used</Label>
              <div className="flex gap-2">
                <Input
                  id="tech"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTech()}
                  placeholder="React, Node.js, etc."
                  data-testid="input-tech"
                />
                <Button
                  onClick={addTech}
                  disabled={!techInput.trim()}
                  data-testid="button-add-tech"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.technologies && formData.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.technologies.map((tech) => (
                    <Badge key={tech} variant="secondary" className="gap-1 pr-1">
                      <span>{tech}</span>
                      <button
                        onClick={() => removeTech(tech)}
                        className="hover:text-destructive rounded-sm p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleAdd}
              disabled={!formData.name || !formData.description}
              data-testid="button-add-project"
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              {editing ? 'Update' : 'Add'} Project
            </Button>
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
            Continue to Certifications
          </Button>
        </div>
      </div>
    </div>
  );
}
