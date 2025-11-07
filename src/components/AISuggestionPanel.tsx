import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, Loader2 } from "lucide-react";
import { useState } from "react";

interface Suggestion {
  id: string;
  text: string;
  category: string;
}

interface AISuggestionPanelProps {
  context: {
    role?: string;
    tone?: string;
    type: 'summary' | 'action-verbs' | 'skills';
  };
  onApply: (suggestion: string) => void;
}

export function AISuggestionPanel({ context, onApply }: AISuggestionPanelProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const generateSuggestions = () => {
    setLoading(true);
    
    setTimeout(() => {
      if (context.type === 'summary') {
        setSuggestions([
          {
            id: '1',
            category: 'Professional Summary',
            text: `Results-driven ${context.role || 'professional'} with expertise in delivering high-impact solutions and driving organizational growth through innovative approaches.`,
          },
          {
            id: '2',
            category: 'Professional Summary',
            text: `Dynamic ${context.role || 'professional'} passionate about leveraging technology to solve complex business challenges and create meaningful user experiences.`,
          },
          {
            id: '3',
            category: 'Professional Summary',
            text: `Detail-oriented ${context.role || 'professional'} committed to excellence and continuous learning, bringing analytical thinking and creative problem-solving to every project.`,
          },
        ]);
      } else if (context.type === 'action-verbs') {
        setSuggestions([
          { id: '1', category: 'Achievement Verbs', text: 'Achieved, Accomplished, Delivered, Exceeded, Improved' },
          { id: '2', category: 'Leadership Verbs', text: 'Led, Managed, Directed, Coordinated, Supervised' },
          { id: '3', category: 'Technical Verbs', text: 'Developed, Engineered, Designed, Implemented, Optimized' },
          { id: '4', category: 'Innovation Verbs', text: 'Innovated, Created, Pioneered, Launched, Initiated' },
        ]);
      } else {
        setSuggestions([
          { id: '1', category: 'Technical Skills', text: 'JavaScript, Python, React, Node.js, MongoDB' },
          { id: '2', category: 'Soft Skills', text: 'Leadership, Communication, Problem-solving, Team collaboration' },
          { id: '3', category: 'Tools', text: 'Git, Docker, AWS, Figma, Jira' },
        ]);
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Suggestions</h3>
        </div>
        <Button
          size="sm"
          onClick={generateSuggestions}
          disabled={loading}
          data-testid="button-generate-suggestions"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Generate'
          )}
        </Button>
      </div>

      {suggestions.length > 0 ? (
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="p-3 space-y-2">
              <div className="text-xs font-medium text-muted-foreground">
                {suggestion.category}
              </div>
              <p className="text-sm">{suggestion.text}</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  onApply(suggestion.text);
                  console.log('Applied suggestion:', suggestion.text);
                }}
                data-testid={`button-apply-${suggestion.id}`}
              >
                <Check className="h-4 w-4" />
                Use This
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-sm text-muted-foreground">
          Click Generate to get AI-powered suggestions tailored to your role and tone
        </div>
      )}
    </Card>
  );
}
