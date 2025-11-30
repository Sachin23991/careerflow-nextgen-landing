// src/components/chat/ChatInput.tsx
import "./chat.css";
import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Paperclip, ArrowUp, Square, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  teacherMode?: boolean;
  initialValue?: string;
  isEditing?: boolean;
}

export const ChatInput = ({
  onSend,
  disabled = false,
  teacherMode = false,
  initialValue,
  isEditing = false
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Speech Logic Refs
  const recognitionRef = useRef<any>(null);
  const recognitionBaseRef = useRef<string>("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // 1. SPEECH RECOGNITION SETUP (Browser Native)
  useEffect(() => {
    const win: any = window;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      // Properly extract transcript from SpeechRecognitionResult -> SpeechRecognitionAlternative
      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const alt = result && result[0] ? result[0] : null;
          const transcript = alt?.transcript || "";
          if (result.isFinal) {
            recognitionBaseRef.current = recognitionBaseRef.current
              ? recognitionBaseRef.current + " " + transcript
              : transcript;
          } else {
            interim += transcript;
          }
        }
        const display = recognitionBaseRef.current
          ? recognitionBaseRef.current + (interim ? " " + interim : "")
          : interim;
        setMessage(display);
        autoResize();
      };

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => {
        // keep UI state accurate; if we didn't explicitly stop, try to restart
        setIsRecording(false);
      };

      recognition.onerror = () => stopRecording();
      // Note: we intentionally do not auto-restart here to avoid loops; toggleRecording handles restarts.

      recognitionRef.current = recognition;
    }

    return () => stopRecording();
  }, []);

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    autoResize();
  };

  const handleSend = () => {
    const text = message.trim();
    if (!text || disabled || isTranscribing) return;
    onSend(text);
    setMessage("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {}
    if (recorderRef.current) try { recorderRef.current.stop(); } catch {}
    setIsRecording(false);
  }, []);

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    // Try SpeechRecognition first
    if (recognitionRef.current) {
      recognitionBaseRef.current = message.trim();
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error("Speech start failed", e);
      }
      return;
    }

    // Fallback: MediaRecorder
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Microphone not supported.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        setIsTranscribing(true);
        setTimeout(() => setIsTranscribing(false), 1000);
      };
      recorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
      alert("Mic access denied.");
    }
  };

  const clearMessage = () => {
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  };

  useEffect(() => {
    if (initialValue !== undefined) {
      setMessage(initialValue);
      setTimeout(() => {
        autoResize();
        textareaRef.current?.focus();
      }, 50);
    }
  }, [initialValue]);

  const hasContent = message.trim().length > 0;

  // --- RENDER: PREMIUM FLOATING INPUT ---
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Edit Mode Indicator */}
      {isEditing && (
        <div className="flex items-center gap-2 mb-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-sm text-amber-700 dark:text-amber-400">
          <Sparkles className="w-4 h-4" />
          <span>Editing your message</span>
          <button onClick={clearMessage} className="ml-auto hover:text-amber-900 dark:hover:text-amber-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Input Container */}
      <div 
        className={cn(
          "relative flex items-end gap-2 p-2 rounded-2xl transition-all duration-300",
          "bg-white dark:bg-slate-900",
          "border-2",
          isFocused 
            ? "border-violet-500/50 shadow-lg shadow-violet-500/10" 
            : "border-slate-200 dark:border-slate-700 shadow-md",
          isRecording && "border-red-500/50 shadow-lg shadow-red-500/10"
        )}
      >
        {/* Attachment Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0"
          disabled={disabled}
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        {/* Text Area */}
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={
            isRecording 
              ? "Listening..." 
              : teacherMode 
                ? "Speak or type your question..." 
                : "Ask me anything about your career..."
          }
          disabled={disabled || isTranscribing}
          className={cn(
            "flex-1 min-h-[44px] max-h-[200px] py-3 px-2 resize-none",
            "bg-transparent border-0 shadow-none focus-visible:ring-0",
            "text-base placeholder:text-slate-400 dark:placeholder:text-slate-500",
            "scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600"
          )}
          rows={1}
        />

        {/* Clear Button (when has content) */}
        {hasContent && !isRecording && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearMessage}
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}

        {/* Voice Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleRecording}
          disabled={disabled || isTranscribing}
          className={cn(
            "h-10 w-10 rounded-xl flex-shrink-0 transition-all duration-200",
            isRecording 
              ? "bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/50 animate-pulse" 
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </Button>

        {/* Send Button */}
        <Button
          type="button"
          onClick={handleSend}
          disabled={!hasContent || disabled || isTranscribing}
          className={cn(
            "h-10 rounded-xl flex-shrink-0 transition-all duration-300",
            hasContent 
              ? "w-10 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-lg shadow-violet-500/25" 
              : "w-10 bg-slate-100 dark:bg-slate-800 text-slate-400"
          )}
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center justify-center gap-2 mt-3 text-sm text-red-500">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          Recording... Click mic to stop
        </div>
      )}

      {/* Transcribing Indicator */}
      {isTranscribing && (
        <div className="flex items-center justify-center gap-2 mt-3 text-sm text-violet-500">
          <Sparkles className="w-4 h-4 animate-spin" />
          Transcribing...
        </div>
      )}
    </div>
  );
};

export default ChatInput;
