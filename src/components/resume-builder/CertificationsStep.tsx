import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, Edit } from "lucide-react";
import type { ResumeData, CertificationEntry } from "@shared/schema";

interface CertificationsStepProps {
  data: ResumeData;
  updateData: (data: Partial<ResumeData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function CertificationsStep({ data, updateData, onNext, onBack }: CertificationsStepProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CertificationEntry>>({
    name: "",
    issuer: "",
    date: "",
    link: "",
  });

  const handleAdd = () => {
    if (formData.name && formData.issuer) {
      const newEntry: CertificationEntry = {
        id: Date.now().toString(),
        name: formData.name,
        issuer: formData.issuer,
        date: formData.date || "",
        link: formData.link,
      };

      if (editing) {
        updateData({
          certifications: data.certifications.map(c => c.id === editing ? newEntry : c)
        });
        setEditing(null);
      } else {
        updateData({ certifications: [...data.certifications, newEntry] });
      }

      setFormData({
        name: "",
        issuer: "",
        date: "",
        link: "",
      });
    }
  };

  const handleEdit = (entry: CertificationEntry) => {
    setFormData(entry);
    setEditing(entry.id);
  };

  const handleDelete = (id: string) => {
    updateData({ certifications: data.certifications.filter(c => c.id !== id) });
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
        <h2 className="text-3xl font-bold">Certifications</h2>
        <p className="text-muted-foreground">Add your professional certifications</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {data.certifications.map((entry) => (
          <Card key={entry.id} className="p-4">
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold">{entry.name}</h3>
                <p className="text-sm text-muted-foreground">{entry.issuer}</p>
                {entry.date && (
                  <p className="text-xs text-muted-foreground mt-1">Issued: {entry.date}</p>
                )}
                {entry.link && (
                  <p className="text-xs text-muted-foreground">Credential: {entry.link}</p>
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
          <h3 className="font-semibold mb-4">{editing ? 'Edit' : 'Add'} Certification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cert-name">Certification Name *</Label>
              <Input
                id="cert-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="AWS Certified Solutions Architect"
                data-testid="input-cert-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issuer">Issuing Organization *</Label>
              <Input
                id="issuer"
                value={formData.issuer}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                placeholder="Amazon Web Services"
                data-testid="input-issuer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cert-date">Issue Date</Label>
              <Input
                id="cert-date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                placeholder="Jan 2023"
                data-testid="input-cert-date"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cert-link">Credential URL (Optional)</Label>
              <Input
                id="cert-link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://..."
                data-testid="input-cert-link"
              />
            </div>

            <div className="md:col-span-2">
              <Button
                onClick={handleAdd}
                disabled={!formData.name || !formData.issuer}
                data-testid="button-add-certification"
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                {editing ? 'Update' : 'Add'} Certification
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
            Continue to Template Selection
          </Button>
        </div>
      </div>
    </div>
  );
}
