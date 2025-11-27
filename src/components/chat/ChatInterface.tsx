// src/components/chat/ChatInterface.tsx (Updated)

import { useState, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { useTeacherSession } from "@/components/chat/useTeacherSession"; // new hook
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

  // ...existing state...
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);

  // New: editing state for user-message edit flow
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingInitialText, setEditingInitialText] = useState<string>("");

  // teacher mode UI flags are now derived from hook
  const [teacherMode, setTeacherMode] = useState<boolean>(false);

  // use the new hook - pass the expected argument (array of user ids)
  const teacher = useTeacherSession([user.uid]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial teacher prompt (spoken starter) used when teacherMode starts
  const initialTeacherPrompt = `Hello, how can I help you today?`;

  // Hidden system prompt: strict spoken interaction rules.
  // This is not shown to the user / not stored in Firestore; it's only passed to the LLM as context
  // so the assistant responds in a voice-optimized, teacher-student spoken style.
  const teacherSystemPrompt = `You are a voice-based teaching assistant. This session operates entirely through spoken interaction.

Speaking Session Rules:
1. Start the session by speaking: "Hello, how can I help you today?"
2. All responses must be optimized for speech output: short, clear sentences; natural spoken language; no long paragraphs; avoid bullets.
3. Maintain a friendly teacher–student tone: ask clarifying questions, explain step-by-step, encourage verbal responses.
4. Wait for the user's next spoken input before continuing.
5. Do not output text meant only for reading; produce speech-suitable content only.
6. Keep the conversation continuous and context-aware until the user ends the session.
7. If the user switches to text, continue responding in speaking style unless they request otherwise.`;
 
  // ---------- Text-to-Speech helpers (teacher mode) ----------
  const stopSpeaking = () => {
    try {
      if (typeof window !== "undefined" && (window as any).speechSynthesis) {
        (window as any).speechSynthesis.cancel();
      }
    } catch (e) {
      console.warn("stopSpeaking failed", e);
    }
  };
  
  const speakText = async (text: string) => {
    if (!text || typeof window === "undefined") return;
    stopSpeaking();
    try {
      const synth = (window as any).speechSynthesis;
      // Chunk into short sentences to keep speech natural and avoid long monologues.
      const sentences = String(text)
        .replace(/\n+/g, " ")
        .match(/[^.!?]+[.!?]?/g)?.map(s => s.trim()) || [text];

      for (const s of sentences) {
        if (!s) continue;
        const u = new SpeechSynthesisUtterance(s);
        // optionally set voice/lang here, fallback to defaults
        u.lang = "en-US";
        synth.speak(u);
        // wait for this utterance to finish before continuing
        await new Promise<void>((res) => {
          u.onend = () => res();
          u.onerror = () => res();
        });
        // short pause between sentences
        await new Promise((r) => setTimeout(r, 120));
      }
    } catch (e) {
      console.warn("speakText failed", e);
    }
  };
  // ------------------------------------------------------------

  // Start a teacher mode session: create session if needed, add initial assistant greeting, speak it, then start listening
  const startTeacherSession = async () => {
    let activeSessionId = sessionId;
    try {
      // stop any prior activity managed by hook
      teacher.end();

      // create session if none
      if (!activeSessionId) {
        const sessionRef = doc(collection(db, 'users', user.uid, 'sessions'));
        await setDoc(sessionRef, {
          title: "Teacher session",
          createdAt: serverTimestamp(),
        });
        activeSessionId = sessionRef.id;
        onNewSessionStarted(activeSessionId);
      }

      // add initial assistant (teacher) message to firestore
      const messagesRef = collection(db, 'users', user.uid, 'sessions', activeSessionId, 'messages');
      await addDoc(messagesRef, {
        role: 'assistant',
        content: initialTeacherPrompt,
        timestamp: serverTimestamp(),
      });

      // reflect locally immediately
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: initialTeacherPrompt,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setTeacherMode(true);

      // Start the speaking + recognition flow in the hook; onTranscript forwards to handleSendMessage
      // Note: handleSendMessage already handles streaming + saving. We pass it as callback for recognized user speech.
      teacher.start(initialTeacherPrompt, handleSendMessage);
    } catch (err) {
      console.error("Failed to start teacher session:", err);
    }
  };

  // End teacher mode: stop speech and recognition, hide overlay
  const endTeacherSession = () => {
    teacher.end();
    setTeacherMode(false);
  };

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

  // Cancel speech/recognition on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Edit handler invoked by ChatMessage when Edit is clicked
  const handleEditMessage = (msg: Message) => {
    setEditingMessageId(msg.id);
    setEditingInitialText(msg.content || "");
    // scroll + focus handled by ChatInput effect when initialValue changes
    scrollToBottom();
  };

  // Update handleSendMessage to clear edit state after sending (always)
  const handleSendMessage = async (content: string) => {
    // stop any currently speaking before handling new user input
    stopSpeaking();
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
        // resume listening if teacher mode
        if (teacherMode) {
          // supply an empty string (teacher.start expects a string) instead of undefined
          setTimeout(() => teacher.start('', handleSendMessage), 300);
        }
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
          // Teacher mode: speak reply, then resume listening
          if (teacherMode) {
            await speakText(fullBotContent);
            // After speaking, start listening again for user's next utterance
            if (teacherMode) {
              // supply an empty string (teacher.start expects a string) instead of undefined
              setTimeout(() => teacher.start('', handleSendMessage), 250);
            }
          }
        }
      };

      // If teacherMode is active, prepend the hidden teacherSystemPrompt so the assistant replies in voice/teacher style.
      const streamInput = teacherMode
        ? `${teacherSystemPrompt}\n\nStudent: ${content}`
        : content;

      // Start the bot response stream using the streamInput (teacherSystemPrompt is NOT saved/displayed)
      await streamBotResponse(streamInput, activeSessionId, onChunkReceived, onError, onStreamEnd);

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
      if (teacherMode) {
        // replace non-existent startRecognition with start and supply empty string
        setTimeout(() => teacher.start('', handleSendMessage), 300);
      }
    } finally {
      // Clear editing state after attempting to send (successful or error)
      setEditingMessageId(null);
      setEditingInitialText("");
    }
  };

  // UI rendering
  return (
    <div className={`${styles.chatWrapper} flex flex-col h-full`}>
      {/* messages area */}
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
                onEdit={handleEditMessage} // pass edit callback
              />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Footer area: when teacherMode active we hide typed input and show overlay */}
      <div className={`${styles.footer} border-t bg-card/50 backdrop-blur-sm relative`}>
        <div className="container mx-auto max-w-4xl px-6 py-6">
          {!teacherMode ? (
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  if (!teacherMode) startTeacherSession();
                  else endTeacherSession();
                }}
                aria-pressed={teacherMode}
                className={cn(
                  "rounded-md px-3 py-1 text-sm font-medium transition",
                  teacherMode ? "bg-destructive/90 text-white" : "bg-transparent border"
                )}
              >
                {teacherMode ? "Teacher mode: ON" : "Start Teacher Mode"}
              </button>

              <div className="flex-1">
                {/* Pass initialValue/isEditing for edit flow */}
                <ChatInput
                  onSend={handleSendMessage}
                  disabled={isTyping}
                  teacherMode={false}
                  initialValue={editingInitialText}
                  isEditing={!!editingMessageId}
                />
              </div>
            </div>
          ) : (
            // Teacher mode overlay: use teacher.listening / teacher.speaking
            <div className="relative h-40 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* glowing radial light */}
                <div className={cn(
                  "rounded-full transition-all",
                  teacher.listening ? "animate-pulse-slow" : teacher.speaking ? "animate-pulse-fast" : "opacity-50"
                )} style={{
                  width: 210,
                  height: 210,
                  boxShadow: teacher.listening ? "0 0 40px rgba(255,69,58,0.45)" : teacher.speaking ? "0 0 32px rgba(59,130,246,0.35)" : "0 0 16px rgba(0,0,0,0.06)",
                  borderRadius: "9999px",
                }} />
              </div>

              <div className="z-10 flex flex-col items-center gap-3">
                {/* ...logo + status... */}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      // manually restart listening if not speaking
                      if (!teacher.speaking) {
                        // use empty string for the required first parameter
                        teacher.start('', handleSendMessage);
                      }
                    }}
                    className="rounded-md px-3 py-1 border text-sm"
                  >
                    Restart Listening
                  </button>

                  {/* New: Stop incoming assistant speech immediately */}
                  {teacher.speaking && (
                    <button
                      onClick={() => {
                        try { teacher.stopSpeaking(); } catch { /* ignore */ }
                      }}
                      className="rounded-md px-3 py-1 border text-sm"
                    >
                      Stop Speaking
                    </button>
                  )}

                  <button
                    onClick={() => endTeacherSession()}
                    className="rounded-md px-3 py-1 bg-destructive/90 text-white"
                  >
                    Quit Teacher Mode
                  </button>
                </div>
              </div>
            </div>
          )}

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Sancara can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
};