import { useNavigate } from "react-router-dom";
import { HeroSection } from "@/components/HeroSection";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sparkles, Download, Palette } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* left logo: replaces the "R" box */}
            <button
              onClick={() => navigate('/')}
              aria-label="Go to home"
              className="h-8 w-8 rounded-md bg-transparent flex items-center justify-center focus:outline-none"
            >
              {/* use public/logo.png */}
              <img src="/logo.png" alt="Resume Builder logo" className="h-8 w-8 object-contain bg-transparent" />
            </button>

            <span className="font-semibold text-lg">Resume Builder</span>
          </div>

          {/* right controls: Dashboard button + ThemeToggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              aria-label="Return to dashboard"
              className="flex items-center gap-2 px-3 py-1 rounded-md bg-transparent hover:bg-accent/10 focus:outline-none"
            >
              {/* small logo/icon from public folder */}
              <img src="/logo.png" alt="Dashboard" className="h-4 w-4 object-contain bg-transparent" />
              <span className="hidden sm:inline text-sm">Dashboard</span>
            </button>

            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <HeroSection onGetStarted={() => navigate('/resume-builder/builder')} />
      
      <section className="container px-4 py-16">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">Why Choose Our Resume Builder?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tailored for the Indian job market with intelligent features
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4">
            <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">AI-Powered Suggestions</h3>
            <p className="text-muted-foreground">
              Get intelligent content recommendations based on your role, degree, and desired tone
            </p>
          </Card>
          
          <Card className="p-6 space-y-4">
            <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Multiple Templates</h3>
            <p className="text-muted-foreground">
              Choose from Classic, Modern, Minimalist, Visual, and ATS-friendly formats
            </p>
          </Card>
          
          <Card className="p-6 space-y-4">
            <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Fully Customizable</h3>
            <p className="text-muted-foreground">
              Customize colors, fonts, sections, and layout to match your personal brand
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
