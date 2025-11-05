// CareerAssistant.tsx

import { useState, useRef, useEffect, SyntheticEvent } from "react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { SuggestedPrompts } from "@/components/chat/SuggestedPrompts";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RotateCcw, ArrowRight } from "lucide-react";
import styles from "./CareerAssistant.module.css";
// *** NEW ***: Import your service
// !!! NOTE: Aapko yeh path apne project structure ke hisaab se fix karna hoga !!!
import { streamBotResponse } from "../services/counselorService";

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
    content:
      "Hello! I'm your Career Assistant, powered by AI. I can help you with career planning, resume advice, job search strategies, interview preparation, and much more. How can I assist you today?",
    timestamp: new Date(),
  },
];

const CareerAssistant = () => {
  const [view, setView] = useState<"welcome" | "chat">("welcome");
  
  // *** NEW ***: Add a state for the session ID
  const [sessionId] = useState(
    () => `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  );

  const navigateToDashboard = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard";
    }
  };

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [logoSrc, setLogoSrc] = useState<string>("/logo.png");
  const logoFallbacks = ["/logo.png", "/logo.svg", "/logo.webp", "/logo"];
  const logoTryIndex = useRef(0);
  const handleLogoError = (e: SyntheticEvent<HTMLImageElement>) => {
    logoTryIndex.current += 1;
    if (logoTryIndex.current < logoFallbacks.length) {
      setLogoSrc(logoFallbacks[logoTryIndex.current]);
    } else {
      (e.target as HTMLImageElement).style.display = "none";
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // --- NEW: state for detected links in latest assistant message ---
  // type LinkItem = { url: string; title: string };
  // const [linkItems, setLinkItems] = useState<LinkItem[]>([]);

  // --- NEW: helper: strip bold markers (**) from incoming text ---
  const stripAsterisks = (text: string) => {
    if (!text) return text;
    return text.replace(/\*\*/g, "");
  };

  // --- NEW: helper: find URLs in text ---
  const findUrls = (text: string) => {
    if (!text) return [];
    // simple URL regex (http/https)
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    const matches = text.match(urlRegex);
    return matches ? Array.from(new Set(matches)) : [];
  };

  // *** UPDATED: handleSendMessage function ***
  const handleSendMessage = async (content: string) => {
    setView("chat");

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // ID for the new assistant message we're about to stream
    const assistantMessageId = (Date.now() + 1).toString();
    let isFirstChunk = true; // To track the first chunk

    const onChunkReceived = (rawChunk: string) => {
      // --- NEW: sanitize chunk right away (remove ** markers) ---
      const chunk = stripAsterisks(rawChunk);

      if (isFirstChunk) {
        // This is the first chunk, create the new message
        const assistantMessage: Message = {
          id: assistantMessageId,
          role: "assistant",
          content: chunk,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        isFirstChunk = false;
      } else {
        // This is a subsequent chunk, append to the existing message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: msg.content + chunk }
              : msg
          )
        );
      }
    };

    const onError = (error: Error) => {
      console.error("Streaming error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: `Sorry, I ran into a problem: ${error.message}. Please try again.`,
        timestamp: new Date(),
      };
      // Add error message to chat and stop typing indicator
      setMessages((prev) => [...prev, errorMessage]);
      setIsTyping(false); 
    };

    const onStreamEnd = () => {
      setIsTyping(false);
    };

    // Call your streaming service
    try {
      await streamBotResponse(
        content,       // userInput
        sessionId,     // sessionId
        onChunkReceived, // onChunkReceived
        onError,       // onError
        onStreamEnd    // onStreamEnd
      );
    } catch (error) {
      // This catches errors in the setup of streamBotResponse itself
      console.error("Failed to start stream:", error);
      const setupErrorMessage: Message = {
        id: (Date.now() + 3).toString(),
        role: "assistant",
        content: "Sorry, I couldn't connect to the AI service.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, setupErrorMessage]);
      setIsTyping(false);
    }
  };

  // --- ADDED: restore handleClearConversation so the "New Chat" button works ---
  const handleClearConversation = () => {
    setMessages(initialMessages);
    setView("chat");
  };

  // 1. WELCOME SCREEN (No changes here)
  if (view === "welcome") {
    return (
      <div
        className={`${styles.welcomeWrapper} flex items-center justify-center p-6`}
      >
        <Card className={`${styles.card} max-w-2xl w-full p-8 shadow-lg`}>
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div
                className={`${styles.logoBox} flex items-center justify-center rounded-2xl shadow-lg`}
              >
                <img
                  src={logoSrc}
                  alt="Career Flow logo"
                  className="h-10 w-10 object-contain"
                  onError={handleLogoError}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-foreground">
                Career Flow
              </h1>
              <p className="text-xl text-muted-foreground">
                Your Career Companion
              </p>
            </div>

            <p className="text-base text-muted-foreground max-w-md mx-auto">
              Get AI-powered guidance for your career journey. From resume
              building to interview prep, I'm here to help you achieve your
              professional goals.
            </p>

            <div className="pt-4">
              <Button
                size="lg"
                onClick={() => setView("chat")}
                className={`${styles.startButton} gap-2`}
                style={{
                  backgroundColor: "#7dd3fc",
                  color: "#ffffff",
                  boxShadow: "0 12px 30px rgba(125,211,252,0.12)",
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
              <Button
                variant="ghost"
                size="sm"
                onClick={navigateToDashboard}
                className="text-sm"
              >
                ← Back to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // 2. CHAT INTERFACE (No changes here in structure, but we add link UI above input)
  return (
    <div className={`${styles.chatWrapper} flex h-screen flex-col`}>
      {/* Header */}
      <header
        className={`${styles.header} border-b bg-card/50 backdrop-blur-sm`}
      >
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`${styles.headerLogo} flex items-center justify-center`}
              style={{ background: "transparent" }}
            >
              <img
                src={logoSrc}
                alt="CareerFlow logo"
                onError={handleLogoError}
                className="h-10 w-10 md:h-12 md:w-12 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Sancara AI
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-powered career guidance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateToDashboard}
              className="gap-2"
            >
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
            Career Assistant can make mistakes. Consider checking important
            information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CareerAssistant;