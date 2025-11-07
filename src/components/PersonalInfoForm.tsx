import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, User } from "lucide-react";
import type { ResumeData } from "@shared/schema";

interface PersonalInfoFormProps {
  data: ResumeData['personalInfo'];
  onChange: (data: Partial<ResumeData['personalInfo']>) => void;
}

export function PersonalInfoForm({ data, onChange }: PersonalInfoFormProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Personal Information</h3>
        <p className="text-sm text-muted-foreground">Add your contact details</p>
      </div>

      <div className="flex items-center gap-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={data.photo} />
          <AvatarFallback className="text-2xl">
            <User className="h-12 w-12" />
          </AvatarFallback>
        </Avatar>
        
        <div>
          <Label htmlFor="photo-upload" className="cursor-pointer">
            <Button variant="outline" size="sm" asChild data-testid="button-upload-photo">
              <span className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Photo
              </span>
            </Button>
          </Label>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Optional, recommended for modern templates
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="John Doe"
            data-testid="input-name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="john@example.com"
            data-testid="input-email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+91 98765 43210"
            data-testid="input-phone"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={data.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="Mumbai, Maharashtra"
            data-testid="input-location"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            value={data.linkedin || ''}
            onChange={(e) => onChange({ linkedin: e.target.value })}
            placeholder="linkedin.com/in/johndoe"
            data-testid="input-linkedin"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="github">GitHub</Label>
          <Input
            id="github"
            value={data.github || ''}
            onChange={(e) => onChange({ github: e.target.value })}
            placeholder="github.com/johndoe"
            data-testid="input-github"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="portfolio">Portfolio/Website</Label>
          <Input
            id="portfolio"
            value={data.portfolio || ''}
            onChange={(e) => onChange({ portfolio: e.target.value })}
            placeholder="johndoe.com"
            data-testid="input-portfolio"
          />
        </div>
      </div>
    </div>
  );
}
