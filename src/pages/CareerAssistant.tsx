// CareerAssistant.tsx

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { SuggestedPrompts } from "@/components/chat/SuggestedPrompts";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card"; // Required for the Welcome screen
import { MessageSquare, RotateCcw, Sparkles, ArrowRight } from "lucide-react"; // Required for the Welcome screen
import styles from "./CareerAssistant.module.css"; // NEW: local CSS module

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your Career Assistant, powered by AI. I can help you with career planning, resume advice, job search strategies, interview preparation, and much more. How can I assist you today?",
      timestamp: new Date(),
    },
];

const CareerAssistant = () => {
  // NEW: State to switch between the Welcome/Intro View and the actual Chat View
  const [view, setView] = useState<'welcome' | 'chat'>('welcome'); 
    
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string) => {
    // If the user sends a message (e.g., by selecting a prompt), 
    // we ensure the view is set to 'chat'
    setView('chat'); 

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response (your existing logic)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I understand you're asking about: "${content}". This is a placeholder response. In the full implementation, this will be powered by AI to provide intelligent career guidance tailored to your needs.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleClearConversation = () => {
    setMessages(initialMessages);
    // Keep the view as 'chat' so the header and UI remain, 
    // but the SuggestedPrompts will show up because messages.length === 1
    setView('chat'); 
  };

  // 1. WELCOME SCREEN (Derived from Index.tsx content)
  if (view === 'welcome') {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-accent/20 p-6">
            <Card className="max-w-2xl w-full p-8 shadow-lg">
                <div className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                            <MessageSquare className="h-10 w-10 text-primary-foreground" />
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <h1 className="text-4xl font-bold text-foreground">Career Flow</h1>
                        <p className="text-xl text-muted-foreground">Your Career Companion</p>
                    </div>

                    <p className="text-base text-muted-foreground max-w-md mx-auto">
                        Get AI-powered guidance for your career journey. From resume building to interview prep, 
                        I'm here to help you achieve your professional goals.
                    </p>

                    <div className="pt-4">
                        {/* KEY CHANGE: Button to switch the view to 'chat' */}
                        <Button 
                            size="lg" 
                            onClick={() => setView('chat')} 
                            className="gap-2 bg-primary hover:bg-primary/90"
                        >
                            Start Chat with Career Assistant
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </div>

                    <p className="text-sm text-muted-foreground pt-4">
                        Powered by advanced AI technology
                    </p>
                </div>
            </Card>
        </div>
      );
  }

  // 2. CHAT INTERFACE (Original CareerAssistant.tsx logic)
  return (
    <div className="flex h-screen flex-col bg-gradient-to-b from-background to-accent/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Career Assistant</h1>
              <p className="text-sm text-muted-foreground">AI-powered career guidance</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearConversation}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            New Chat
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl px-6 py-8">
          {messages.length === 1 && (
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <SuggestedPrompts onSelectPrompt={handleSendMessage} />
            </div>
          )}

          <div className="space-y-6">
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLatest={index === messages.length - 1}
              />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl px-6 py-6">
          <ChatInput onSend={handleSendMessage} disabled={isTyping} />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Career Assistant can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CareerAssistant;