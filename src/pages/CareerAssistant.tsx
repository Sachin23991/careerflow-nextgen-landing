// src/pages/CareerAssistant.tsx (Refactored + Welcome Screen)

import { useState, useEffect, useRef, SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

// --- Component Imports ---
import { MainHeader } from "../components/chat/MainHeader";
import { HistorySidebar } from "../components/chat/HistorySidebar";
import { ChatInterface } from "../components/chat/ChatInterface";

// --- UI Imports for Welcome Screen ---
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

import styles from "./CareerAssistant.module.css";

const CareerAssistant = () => {
  const navigate = useNavigate();

  // --- View State (RESTORED) ---
  // Controls showing the welcome screen or the main chat app
  const [view, setView] = useState<"welcome" | "chat">("welcome");

  // --- Auth State ---
  const [user, setUser] = useState<User | null>(null);

  // --- Session State ---
  const [sessionId, setSessionId] = useState<string | null>(null);

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
  // This is needed by both the Welcome screen and MainHeader
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
        // Redirect to login if user is not authenticated
        // Keep the welcome screen logic separate from auth redirect
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
    // Note: This does NOT return to the welcome screen, just starts a new chat.
    // This is intentional, as the welcome screen is an entry-point.
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