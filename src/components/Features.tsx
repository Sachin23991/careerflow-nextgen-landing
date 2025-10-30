import { Card, CardContent } from "@/components/ui/card";
import { Users, Briefcase, FileText, Bot, Target, Calendar, Trophy, Sparkles } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Mentor & Mentee Hub",
    description: "Connect with industry experts and guide the next generation. Build meaningful relationships that accelerate career growth.",
    gradient: "from-primary to-secondary",
  },
  {
    icon: Briefcase,
    title: "Job & Scholarship Discovery",
    description: "Access curated opportunities matching your profile. Find jobs, internships, and funding that align with your goals.",
    gradient: "from-secondary to-accent",
  },
  {
    icon: FileText,
    title: "Resume Analyzer & Builder",
    description: "Get instant ATS compatibility feedback. Build professional resumes that stand out to recruiters.",
    gradient: "from-accent to-primary",
  },
  {
    icon: Bot,
    title: "AI Career Bot",
    description: "24/7 personalized career guidance powered by AI. Get instant answers to your career questions anytime.",
    gradient: "from-primary to-accent",
  },
  {
    icon: Target,
    title: "Skill Assessment",
    description: "Discover your strengths and areas for growth. Track your progress with interactive skill evaluations.",
    gradient: "from-secondary to-primary",
  },
  {
    icon: Calendar,
    title: "Community & Events",
    description: "Join workshops, webinars, and networking events. Learn from experts and connect with peers.",
    gradient: "from-accent to-secondary",
  },
  {
    icon: Trophy,
    title: "Success Tracking",
    description: "Visualize your achievements and milestones. Celebrate progress on your career journey.",
    gradient: "from-primary to-secondary",
  },
  {
    icon: Sparkles,
    title: "Learning Resources",
    description: "Access courses, guides, and tools. Continuously develop skills for your dream career.",
    gradient: "from-secondary to-accent",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <span className="px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-semibold inline-block">
            ✨ Everything You Need
          </span>
          <h2 className="text-4xl md:text-5xl font-bold">
            Comprehensive Career
            <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Development Platform
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            All the tools and resources you need to accelerate your career growth in one powerful platform
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group hover:shadow-glow-primary transition-all duration-300 hover:-translate-y-2 bg-card/50 backdrop-blur-sm border-border/50 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 space-y-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
