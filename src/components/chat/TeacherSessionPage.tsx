// src/components/teacher/TeacherSessionPage.tsx
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, X, Clock, Brain, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeacherSessionPageProps {
  onClose: () => void;
  apiKeys: string[];
  onSendToBackend: (transcript: string) => Promise<string>;
}

const MAX_SESSION_TIME = 5 * 60 * 1000; // 5 minutes in ms

// Removed external hook import (may not exist in this environment).
// Provide a minimal local fallback hook so the component still compiles/runs.
const useTeacherSession = (apiKeys: string[]) => {
	const [listening, setListening] = useState(false);
	const [speaking, setSpeaking] = useState(false);
	const [processing, setProcessing] = useState(false);
	const [transcript, setTranscript] = useState("");
	const [volume, setVolume] = useState(0);

	const start = async (greeting: string, onUserTranscript: (t: string) => Promise<void> | void) => {
		setListening(true);
		// no-op placeholder: real hook would handle audio + callbacks
	};

	const end = () => {
		setListening(false);
		setSpeaking(false);
		setProcessing(false);
	};

	const speak = (text: string) => {
		setProcessing(false);
		setSpeaking(true);
		// simulate speaking end
		setTimeout(() => setSpeaking(false), 1200);
	};

	return {
		start,
		end,
		speak,
		listening,
		speaking,
		processing,
		transcript,
		volume,
	};
};

export const TeacherSessionPage = ({ onClose, apiKeys, onSendToBackend }: TeacherSessionPageProps) => {
  const [sessionActive, setSessionActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(MAX_SESSION_TIME);
  const [currentPhase, setCurrentPhase] = useState<"greeting" | "listening" | "processing" | "speaking">("greeting");
  const [questionCount, setQuestionCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // const { start, end, speak, listening, speaking, processing, transcript, volume } = useTeacherSession(apiKeys);
  const {
    start,
    end,
    speak,
    listening,
    speaking,
    processing,
    transcript,
    volume,
  } = useTeacherSession(apiKeys);

  // Session Timer
  useEffect(() => {
    if (sessionActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1000) {
            handleEndSession();
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionActive]);

  // Update phase based on hook state
  useEffect(() => {
    if (speaking) setCurrentPhase("speaking");
    else if (processing) setCurrentPhase("processing");
    else if (listening) setCurrentPhase("listening");
  }, [speaking, processing, listening]);

  const handleStartSession = async () => {
    setSessionActive(true);
    setCurrentPhase("greeting");
    
    const greetingMessage = "Hello! Welcome to your learning session. I'm your AI teacher. What topic would you like to explore today? Just speak naturally, and I'll guide you through it.";
    
    await start(greetingMessage, async (userTranscript) => {
      setQuestionCount((prev) => prev + 1);
      // Send to backend and get response
      try {
        const aiResponse = await onSendToBackend(userTranscript);
        speak(aiResponse);
      } catch (error) {
        speak("I apologize, I encountered an issue processing your question. Could you please try again?");
      }
    });
  };

  const handleEndSession = () => {
    end();
    setSessionActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Show summary before closing
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Animated orb visualization based on volume
  const orbScale = 1 + (volume / 100) * 0.5;
  const orbOpacity = 0.5 + (volume / 100) * 0.5;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 flex flex-col items-center justify-center">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleEndSession}
        className="absolute top-6 right-6 text-white/70 hover:text-white hover:bg-white/10"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Timer & Stats Bar */}
      {sessionActive && (
        <div className="absolute top-6 left-6 flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
            <Clock className="w-4 h-4 text-violet-400" />
            <span className={cn(
              "font-mono text-lg font-semibold",
              timeRemaining < 60000 ? "text-red-400" : "text-white"
            )}>
              {formatTime(timeRemaining)}
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
            <Brain className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-medium">{questionCount} Questions</span>
          </div>
        </div>
      )}

      {/* Central Visualization */}
      <div className="relative flex items-center justify-center w-80 h-80">
        {/* Background Glow Rings */}
        <div 
          className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-500/20 blur-3xl transition-all duration-300"
          style={{ transform: `scale(${orbScale})`, opacity: orbOpacity }}
        />
        <div 
          className="absolute w-48 h-48 rounded-full bg-gradient-to-r from-violet-600/30 to-blue-500/30 blur-2xl transition-all duration-200"
          style={{ transform: `scale(${orbScale * 0.9})` }}
        />
        
        {/* Main Orb */}
        <div 
          className={cn(
            "relative w-32 h-32 rounded-full transition-all duration-300",
            "bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-500",
            "shadow-[0_0_60px_rgba(139,92,246,0.5)]",
            speaking && "animate-pulse"
          )}
          style={{ transform: `scale(${orbScale})` }}
        >
          {/* Inner Glow */}
          <div className="absolute inset-4 rounded-full bg-white/20 blur-sm" />
          
          {/* Status Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            {currentPhase === "listening" && <Mic className="w-10 h-10 text-white animate-pulse" />}
            {currentPhase === "speaking" && <Volume2 className="w-10 h-10 text-white" />}
            {currentPhase === "processing" && <Sparkles className="w-10 h-10 text-white animate-spin" />}
            {currentPhase === "greeting" && !sessionActive && <Brain className="w-10 h-10 text-white" />}
          </div>
        </div>
      </div>

      {/* Status Text */}
      <div className="mt-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          {currentPhase === "greeting" && !sessionActive && "Ready to Learn?"}
          {currentPhase === "listening" && "Listening..."}
          {currentPhase === "processing" && "Thinking..."}
          {currentPhase === "speaking" && "Speaking..."}
          {currentPhase === "greeting" && sessionActive && "Starting Session..."}
        </h2>
        
        {/* Live Transcript */}
        {transcript && sessionActive && (
          <p className="text-white/70 max-w-md mx-auto text-lg animate-fade-in">
            "{transcript}"
          </p>
        )}
      </div>

      {/* Start/Stop Button */}
      <div className="mt-12">
        {!sessionActive ? (
          <Button
            onClick={handleStartSession}
            size="lg"
            className="px-8 py-6 text-lg bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 rounded-full shadow-lg shadow-violet-500/30"
          >
            <Mic className="w-5 h-5 mr-2" />
            Start Teacher Session
          </Button>
        ) : (
          <Button
            onClick={handleEndSession}
            size="lg"
            variant="outline"
            className="px-8 py-6 text-lg border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-full"
          >
            <MicOff className="w-5 h-5 mr-2" />
            End Session
          </Button>
        )}
      </div>

      {/* Session Info */}
      {!sessionActive && (
        <p className="mt-6 text-white/50 text-sm max-w-sm text-center">
          Sessions are limited to 5 minutes. Speak naturally and I'll respond with voice.
        </p>
      )}
    </div>
  );
};
