// CareerAssistant.tsx

import { useState, useRef, useEffect, SyntheticEvent } from "react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { SuggestedPrompts } from "@/components/chat/SuggestedPrompts";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card"; // Required for the Welcome screen
import { RotateCcw, ArrowRight } from "lucide-react"; // Required for the Welcome screen
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
  const navigateToDashboard = () => {
    // client-side navigation without next/router
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard";
    }
  };
    
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // logo state + fallbacks for public/logo (tries .png, .svg, .webp, then /logo)
  const [logoSrc, setLogoSrc] = useState<string>("/logo.png");
  const logoFallbacks = ["/logo.png", "/logo.svg", "/logo.webp", "/logo"];
  const logoTryIndex = useRef(0);
  const handleLogoError = (e: SyntheticEvent<HTMLImageElement>) => {
    logoTryIndex.current += 1;
    if (logoTryIndex.current < logoFallbacks.length) {
      setLogoSrc(logoFallbacks[logoTryIndex.current]);
    } else {
      // hide the broken image after all attempts
      (e.target as HTMLImageElement).style.display = "none";
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // scroll to bottom whenever messages change or typing state changes
    scrollToBottom();
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
        <div className={`${styles.welcomeWrapper} flex items-center justify-center p-6`}>
            <Card className={`${styles.card} max-w-2xl w-full p-8 shadow-lg`}>
                <div className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className={`${styles.logoBox} flex items-center justify-center rounded-2xl shadow-lg`}>
                            <img
                              src={logoSrc}
                              alt="Career Flow logo"
                              className="h-10 w-10 object-contain"
                              onError={handleLogoError}
                            />
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
                            className={`${styles.startButton} gap-2`}
                            // inline style to ensure the Button component's internal classes don't override our light sky-blue
                            style={{
                              backgroundColor: '#7dd3fc',
                              color: '#ffffff',
                              boxShadow: '0 12px 30px rgba(125,211,252,0.12)',
                            }}
                        >
                            Start Chat with Sancara AI
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </div>

                    <p className="text-sm text-muted-foreground pt-4">
                        Powered by advanced AI technology
                    </p>
                    <div className="pt-2">
                      <Button variant="ghost" size="sm" onClick={navigateToDashboard} className="text-sm">
                        ← Back to Dashboard
                      </Button>
                    </div>
                 </div>
             </Card>
         </div>
       );
  }
 
  // 2. CHAT INTERFACE (Original CareerAssistant.tsx logic)
  return (
    <div className={`${styles.chatWrapper} flex h-screen flex-col`}>
      {/* Header */}
      <header className={`${styles.header} border-b bg-card/50 backdrop-blur-sm`}>
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`${styles.headerLogo} flex items-center justify-center`}
              style={{ background: "transparent" }}
            >
              {/* larger, responsive logo for header */}
              <img
                src={logoSrc}
                alt="CareerFlow logo"
                onError={handleLogoError}
                className="h-10 w-10 md:h-12 md:w-12 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Sancara AI</h1>
              <p className="text-sm text-muted-foreground">AI-powered career guidance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={navigateToDashboard} className="gap-2">
              Dashboard
            </Button>
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
        </div>
      </header>

      {/* Messages Area */}
      <div className={`${styles.messagesArea} flex-1 overflow-y-auto`}>
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
      <div className={`${styles.footer} border-t bg-card/50 backdrop-blur-sm`}>
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