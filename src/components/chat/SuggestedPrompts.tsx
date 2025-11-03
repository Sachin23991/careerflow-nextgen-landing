import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Lightbulb, 
  FileText, 
  Target, 
  TrendingUp, 
  Users, 
  BookOpen 
} from "lucide-react";

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

const prompts = [
  {
    icon: Target,
    title: "Career Path Guidance",
    prompt: "Help me explore different career paths based on my interests and skills",
    color: "text-blue-500",
  },
  {
    icon: FileText,
    title: "Resume Review",
    prompt: "Can you help me improve my resume and make it stand out?",
    color: "text-green-500",
  },
  {
    icon: Lightbulb,
    title: "Interview Prep",
    prompt: "Help me prepare for an upcoming job interview",
    color: "text-amber-500",
  },
  {
    icon: TrendingUp,
    title: "Skill Development",
    prompt: "What skills should I develop to advance in my career?",
    color: "text-purple-500",
  },
  {
    icon: Users,
    title: "Networking Tips",
    prompt: "Give me advice on building professional networks",
    color: "text-pink-500",
  },
  {
    icon: BookOpen,
    title: "Career Change",
    prompt: "I'm thinking about changing careers. Where should I start?",
    color: "text-teal-500",
  },
];

export const SuggestedPrompts = ({ onSelectPrompt }: SuggestedPromptsProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          How can I help you today?
        </h2>
        <p className="text-muted-foreground">
          Choose a topic below or ask me anything about your career
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
        {prompts.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card
              key={index}
              className="group cursor-pointer border-2 p-4 transition-all hover:border-primary hover:shadow-md active:scale-95"
              onClick={() => onSelectPrompt(item.prompt)}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/50 transition-colors group-hover:bg-accent">
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <h3 className="font-medium text-sm text-foreground">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.prompt}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
