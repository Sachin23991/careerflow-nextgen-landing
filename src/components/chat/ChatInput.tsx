import "./chat.css";
import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement actual voice recording
  };

  return (
    <div className="relative flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-sm transition-all focus-within:shadow-md focus-within:ring-2 focus-within:ring-primary/20">
      {/* Attachment Button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 text-muted-foreground hover:text-foreground"
        disabled={disabled}
      >
        <Paperclip className="h-5 w-5" />
      </Button>

      {/* Text Input */}
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={handleTextareaChange}
        onKeyDown={handleKeyDown}
        placeholder="Ask me anything about your career..."
        disabled={disabled}
        className="min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent px-0 py-3 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        rows={1}
      />

      {/* Voice Button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggleRecording}
        disabled={disabled}
        className={cn(
          "shrink-0 transition-colors",
          isRecording
            ? "text-destructive hover:text-destructive"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Mic className={cn("h-5 w-5", isRecording && "animate-pulse")} />
      </Button>

      {/* Send Button */}
      <Button
        type="button"
        size="icon"
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className="shrink-0 bg-primary hover:bg-primary/90"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
};
