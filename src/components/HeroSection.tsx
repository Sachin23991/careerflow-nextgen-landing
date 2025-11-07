import { Button } from "@/components/ui/button";
import { Sparkles, FileText, Palette } from "lucide-react";
import heroImage from "/resumepicture.png";

export function HeroSection({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
      
      <div className="container relative z-10 px-4 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              AI-Powered Resume Builder
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Create Your Perfect Resume in{" "}
              <span className="text-primary">Minutes</span>
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Build professional, ATS-friendly resumes tailored for the Indian job market. 
              Get AI-powered suggestions for impactful content, choose from multiple templates, 
              and customize every detail.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                onClick={onGetStarted}
                data-testid="button-get-started"
                className="gap-2"
              >
                <FileText className="h-5 w-5" />
                Start Building
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                data-testid="button-view-templates"
                className="gap-2"
              >
                <Palette className="h-5 w-5" />
                View Templates
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Multiple Templates
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                AI Suggestions
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                ATS Optimized
              </div>
            </div>
          </div>
          
          <div className="hidden lg:block">
            <img 
              src={heroImage} 
              alt="Professional creating resume" 
              className="w-full h-auto rounded-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
