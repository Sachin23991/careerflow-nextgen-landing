import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, User, ArrowLeft } from "lucide-react";
import type { ResumeData } from "@shared/schema";

interface PersonalInfoStepProps {
  data: ResumeData;
  updateData: (data: Partial<ResumeData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PersonalInfoStep({ data, updateData, onNext, onBack }: PersonalInfoStepProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateData({ profilePicture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const canProceed = data.firstName && data.lastName && data.email && data.phone && data.location;

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
        <h2 className="text-3xl font-bold">Personal Information</h2>
        <p className="text-muted-foreground">Tell us about yourself</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={data.profilePicture} />
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
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={data.firstName}
              onChange={(e) => updateData({ firstName: e.target.value })}
              placeholder="John"
              data-testid="input-first-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={data.lastName}
              onChange={(e) => updateData({ lastName: e.target.value })}
              placeholder="Doe"
              data-testid="input-last-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => updateData({ email: e.target.value })}
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
              onChange={(e) => updateData({ phone: e.target.value })}
              placeholder="+91 98765 43210"
              data-testid="input-phone"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={data.location}
              onChange={(e) => updateData({ location: e.target.value })}
              placeholder="Mumbai, Maharashtra"
              data-testid="input-location"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              value={data.linkedin || ''}
              onChange={(e) => updateData({ linkedin: e.target.value })}
              placeholder="linkedin.com/in/johndoe"
              data-testid="input-linkedin"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="github">GitHub</Label>
            <Input
              id="github"
              value={data.github || ''}
              onChange={(e) => updateData({ github: e.target.value })}
              placeholder="github.com/johndoe"
              data-testid="input-github"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="portfolio">Portfolio/Website</Label>
            <Input
              id="portfolio"
              value={data.portfolio || ''}
              onChange={(e) => updateData({ portfolio: e.target.value })}
              placeholder="johndoe.com"
              data-testid="input-portfolio"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            size="lg"
            onClick={onNext}
            disabled={!canProceed}
            data-testid="button-next"
          >
            Continue to Summary
          </Button>
        </div>
      </div>
    </div>
  );
}
