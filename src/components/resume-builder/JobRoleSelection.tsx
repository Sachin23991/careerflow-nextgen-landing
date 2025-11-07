import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Check, ArrowLeft, Plus } from "lucide-react";
import type { ResumeData } from "@shared/schema";
import { jobRolesByStream } from "@/data/resumeData";

interface JobRoleSelectionProps {
  data: ResumeData;
  updateData: (data: Partial<ResumeData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function JobRoleSelection({ data, updateData, onNext, onBack }: JobRoleSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [customRole, setCustomRole] = useState("");
  
  const jobRoles = jobRolesByStream[data.stream] || [];
  const filteredRoles = jobRoles.filter(role =>
    role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleSelect = (role: string) => {
    updateData({ targetJobRole: role });
    setTimeout(() => onNext(), 300);
  };

  const handleCustomRole = () => {
    if (customRole.trim()) {
      handleRoleSelect(customRole.trim());
    }
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
        <h2 className="text-3xl font-bold">What's Your Target Job Role?</h2>
        <p className="text-muted-foreground">
          Select the position you're applying for
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <Label htmlFor="role-search" className="sr-only">Search job roles</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="role-search"
            placeholder="Search for a job role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-role-search"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
        {filteredRoles.map((role, index) => (
          <Card
            key={role}
            className={`p-3 cursor-pointer transition-all hover-elevate ${
              data.targetJobRole === role
                ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                : 'hover:border-primary/50'
            }`}
            onClick={() => handleRoleSelect(role)}
            data-testid={`card-role-${role.replace(/\s+/g, '-').toLowerCase()}`}
            style={{ animationDelay: `${index * 0.03}s` }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-sm">{role}</span>
              {data.targetJobRole === role && (
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredRoles.length === 0 && searchTerm && (
        <div className="text-center py-8 text-muted-foreground">
          No roles found matching "{searchTerm}"
        </div>
      )}

      <Card className="p-4 bg-muted/50">
        <div className="space-y-3">
          <Label htmlFor="custom-role">Don't see your role? Add a custom one</Label>
          <div className="flex gap-2">
            <Input
              id="custom-role"
              placeholder="Enter your job role..."
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCustomRole()}
              data-testid="input-custom-role"
            />
            <Button
              onClick={handleCustomRole}
              disabled={!customRole.trim()}
              data-testid="button-add-custom-role"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
