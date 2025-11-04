import "./chat.css";
import { Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const TypingIndicator = () => {
  return (
    <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Avatar className="h-10 w-10 border-2 border-accent bg-accent shadow-sm">
        <AvatarFallback className="bg-accent">
          <Bot className="h-5 w-5 text-accent-foreground" />
        </AvatarFallback>
      </Avatar>

      <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border bg-card px-5 py-3 shadow-sm">
        <div className="flex gap-1">
          <span className="typing-dot delay-1" style={{ backgroundColor: 'var(--tw-color-primary, #3b82f6)' }}></span>
          <span className="typing-dot delay-2" style={{ backgroundColor: 'var(--tw-color-primary, #3b82f6)' }}></span>
          <span className="typing-dot delay-3" style={{ backgroundColor: 'var(--tw-color-primary, #3b82f6)' }}></span>
        </div>
        <span className="text-sm text-muted-foreground">AI is thinking...</span>
      </div>
    </div>
  );
};
