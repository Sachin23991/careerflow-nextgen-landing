// src/pages/CareerAssistant.tsx (Refactored + Welcome Screen + PDF Download)

import { useState, useEffect, useRef, SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

// --- Import new PDF generator ---
import { generateConversationPdf } from "../lib/pdfGenerator";

// --- Import Firebase services ---
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';

// --- Component Imports ---
import { MainHeader } from "../components/chat/MainHeader";
import { HistorySidebar } from "../components/chat/HistorySidebar";
import { ChatInterface } from "../components/chat/ChatInterface";

// --- UI Imports for Welcome Screen ---
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

import styles from "./CareerAssistant.module.css";

// --- Define Message type (can be shared) ---
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const CareerAssistant = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<"welcome" | "chat">("welcome");
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // --- Add state for PDF generation ---
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // --- Lifted State (Shared) ---
  const [animationEnabled, setAnimationEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const raw = localStorage.getItem("cf_animation_enabled");
      return raw === null ? true : raw === "1";
    } catch {
      return true;
    }
  });

  const [speedSetting, setSpeedSetting] = useState<"fast" | "normal" | "slow">(() => {
    if (typeof window === "undefined") return "fast";
    try {
      const raw = localStorage.getItem("cf_speed") || "fast";
      return raw as "fast" | "normal" | "slow";
    } catch {
      return "fast";
    }
  });

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem("cf_theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // --- Logo Logic (RESTORED for Welcome Screen) ---
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


  // --- Effects ---

  // Auth effect
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        navigate("/"); 
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // LocalStorage effects for saving settings
  useEffect(() => {
    try {
      localStorage.setItem("cf_animation_enabled", animationEnabled ? "1" : "0");
      localStorage.setItem("cf_speed", speedSetting);
    } catch {}
  }, [animationEnabled, speedSetting]);

  // Theme effect
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem("cf_theme", theme);
    } catch {}
  }, [theme]);


  // --- Helper Functions ---

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const handleSelectSession = (id: string | null) => {
    setSessionId(id);
  };

  const handleNewSessionStarted = (id: string | null) => {
    setSessionId(id);
  };

  const handleHomeClick = () => {
    setSessionId(null);
  };

  // --- NEW: PDF Download Handler ---
  const handleDownloadPdf = async () => {
    if (!user || !sessionId) {
      alert("Please select a conversation to download.");
      return;
    }

    setIsDownloadingPdf(true);
    try {
      // 1. Fetch Session Title
      const sessionRef = doc(db, 'users', user.uid, 'sessions', sessionId);
      const sessionDoc = await getDoc(sessionRef);
      const sessionTitle = sessionDoc.data()?.title || "Chat Conversation";

      // 2. Fetch all messages for that session
      const messagesRef = collection(db, 'users', user.uid, 'sessions', sessionId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));
      const snapshot = await getDocs(q);

      const messages: Message[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          role: data.role,
          content: data.content,
          timestamp: (data.timestamp as Timestamp).toDate(),
        };
      });
      
      if (messages.length === 0) {
          alert("This conversation is empty.");
          setIsDownloadingPdf(false); // Reset state
          return;
      }

      // 3. Generate and download PDF
      await generateConversationPdf(sessionTitle, messages);

    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("An error occurred while generating the PDF. Please check the console.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };


  // --- Render Logic ---

  if (!user) {
    // Still show loading while auth is resolving
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading user session...</p>
      </div>
    );
  }

  // --- Welcome Screen Render (RESTORED) ---
  if (view === "welcome") {
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
              Get AI-powered guidance for your career journey. From resume building to interview prep, I'm here to help you achieve your professional goals.
            </p>

            <div className="pt-4">
              <Button
                size="lg"
                onClick={() => setView("chat")} // This button now switches the view
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

            <p className="text-sm text-muted-foreground pt-4">Powered by advanced AI technology</p>
            <div className="pt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/dashboard")} // Use navigate hook
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

  // --- Main App Layout Render (now in an 'else' block) ---
  return (
    <div className={`${styles.chatWrapper} flex h-screen w-full flex-col bg-background`}>
      <MainHeader
        theme={theme}
        toggleTheme={toggleTheme}
        animationEnabled={animationEnabled}
        setAnimationEnabled={setAnimationEnabled}
        speedSetting={speedSetting}
        setSpeedSetting={setSpeedSetting}
        onHomeClick={handleHomeClick}
        // --- Pass PDF props down ---
        onDownloadPdf={handleDownloadPdf}
        isDownloadingPdf={isDownloadingPdf}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="h-full hidden md:flex">
          <HistorySidebar
            user={user}
            currentSessionId={sessionId}
            onSelectSession={handleSelectSession}
          />
        </div>

        <main className="flex-1 overflow-y-auto h-full">
          <ChatInterface
            user={user}
            sessionId={sessionId}
            onNewSessionStarted={handleNewSessionStarted}
            animationEnabled={animationEnabled}
            speedSetting={speedSetting}
          />
        </main>
      </div>
    </div>
  );
};

export default CareerAssistant;