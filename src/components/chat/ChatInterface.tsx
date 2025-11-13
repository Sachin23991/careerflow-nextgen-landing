// src/components/chat/ChatInterface.tsx (Updated)

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { SuggestedPrompts } from "@/components/chat/SuggestedPrompts";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import styles from "../../pages/CareerAssistant.module.css";
import { streamBotResponse } from "../../services/counselorService";

// --- Firebase & Auth Imports ---
import { User } from 'firebase/auth';
import { db } from '../../firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  setDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

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

// --- Interface for new props ---
interface ChatInterfaceProps {
  user: User;
  sessionId: string | null;
  onNewSessionStarted: (id: string | null) => void;
  // Props passed down from parent
  animationEnabled: boolean;
  speedSetting: 'fast' | 'normal' | 'slow';
}

export const ChatInterface = ({ 
  user, 
  sessionId, 
  onNewSessionStarted,
  animationEnabled, // Use prop
  speedSetting,     // Use prop
}: ChatInterfaceProps) => {
  
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- All state and effects for animation, speed, and theme are REMOVED ---
  // --- They are now managed by the parent CareerAssistant.tsx ---

  // Calculate wordDelayMs from prop
  const wordDelayMs = speedSetting === "fast" ? 20 : speedSetting === "normal" ? 30 : 50;
  
  // --- (Keep your helper functions: scrollToBottom, stripAsterisks) ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const stripAsterisks = (text: string) => {
    if (!text) return text;
    return text.replace(/\*\*/g, "");
  };
  
  // --- (Keep the 'load messages' effect) ---
  useEffect(() => {
    if (!sessionId) {
      setMessages(initialMessages);
      return;
    }
    const messagesRef = collection(db, 'users', user.uid, 'sessions', sessionId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          role: data.role,
          content: data.content,
          timestamp: (data.timestamp as Timestamp).toDate(), 
        };
      });
      
      // --- THIS IS THE FIX ---
      // Original code: setMessages(loadedMessages.length > 0 ? loadedMessages : initialMessages);
      // Corrected code:
      // If a session is selected (sessionId is not null), we show its messages,
      // even if it's an empty array. This is the correct state.
      setMessages(loadedMessages); 

    });
    return () => unsubscribe(); 
  }, [sessionId, user.uid]); 

  // --- (Keep the 'scroll' effect) ---
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // --- (Keep the 'handleSendMessage' logic - it is unchanged) ---
  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    
    // --- Local state update ---
    // If we are on a new chat (initialMessages), replace them with the user message.
    // Otherwise, add to the existing messages.
    setMessages((prev) => 
      prev.length === 1 && prev[0].id === "1"
        ? [userMessage] 
        : [...prev, userMessage]
    );
    setIsTyping(true);
    let activeSessionId = sessionId;

    try {
      if (activeSessionId === null) {
        const sessionRef = doc(collection(db, 'users', user.uid, 'sessions'));
        await setDoc(sessionRef, {
          title: content.substring(0, 40) + (content.length > 40 ? '...' : ''),
          createdAt: serverTimestamp(),
        });
        activeSessionId = sessionRef.id; 
        onNewSessionStarted(activeSessionId); 
      }

      const messagesRef = collection(db, 'users', user.uid, 'sessions', activeSessionId, 'messages');
      // Save the user message to Firestore
      await addDoc(messagesRef, {
        role: 'user',
        content: content,
        timestamp: serverTimestamp(),
      });

      const assistantMessageId = (Date.now() + 1).toString();
      let fullBotContent = ''; 
      let isFirstChunk = true;

      const onChunkReceived = (rawChunk: string) => {
        const chunk = stripAsterisks(rawChunk);
        fullBotContent += chunk; 

        if (isFirstChunk) {
          const assistantMessage: Message = {
            id: assistantMessageId,
            role: "assistant",
            content: chunk,
            timestamp: new Date(),
          };
          // Add the new assistant message shell to local state
          setMessages((prev) => [...prev, assistantMessage]);
          isFirstChunk = false;
        } else {
          // Update the streaming assistant message in local state
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
        setMessages((prev) => [...prev, errorMessage]);
        setIsTyping(false);
      };

      const onStreamEnd = async () => {
        setIsTyping(false);
        if (activeSessionId && fullBotContent) {
          try {
            // Save the full assistant message to Firestore
            const messagesRef = collection(db, 'users', user.uid, 'sessions', activeSessionId, 'messages');
            await addDoc(messagesRef, {
              role: 'assistant',
              content: fullBotContent,
              timestamp: serverTimestamp(),
            });
          } catch (saveError) {
            console.error("Failed to save assistant message:", saveError);
          }
        }
      };

      // Start the bot response stream
      await streamBotResponse(content, activeSessionId, onChunkReceived, onError, onStreamEnd);

    } catch (error) {
      console.error("Failed to send message or create session:", error);
      const setupErrorMessage: Message = {
        id: (Date.now() + 3).toString(),
        role: "assistant",
        content: "Sorry, I couldn't connect or save your message.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, setupErrorMessage]);
      setIsTyping(false);
    }
  };

  return (
    // The wrapper no longer needs h-screen, as it's inside a flex container
    <div className={`${styles.chatWrapper} flex flex-col h-full`}>
      
      {/* --- HEADER IS REMOVED ENTIRELY --- */}
      
      {/* The 'messagesArea' and 'footer' remain */}
      <div className={`${styles.messagesArea} flex-1 overflow-y-auto`}>
        <div className="container mx-auto max-w-4xl px-6 py-8">
          
          {/* Show suggested prompts ONLY if it's the initial message */}
          {messages.length === 1 && messages[0].id === "1" && !isTyping && (
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
                // Pass the props down
                animationEnabled={animationEnabled}
                wordDelayMs={wordDelayMs}
              />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className={`${styles.footer} border-t bg-card/50 backdrop-blur-sm`}>
        <div className="container mx-auto max-w-4xl px-6 py-6">
          <ChatInput onSend={handleSendMessage} disabled={isTyping} />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Sancara can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
};