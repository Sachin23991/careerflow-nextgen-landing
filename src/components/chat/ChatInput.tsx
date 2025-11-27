import "./chat.css";
import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  teacherMode?: boolean;
  initialValue?: string; // new: prefill input for edits
  isEditing?: boolean;   // optional flag to change placeholder
}

export const ChatInput = ({ onSend, disabled = false, teacherMode = false, initialValue, isEditing = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // SpeechRecognition support and instance (if available)
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionRef = useRef<any | null>(null);

  // Keep the message that existed when recognition started. Use this as the stable "base"
  // so we only append final results once and show interim results transiently.
  const recognitionBaseRef = useRef<string>("");

  // Initialize SpeechRecognition if available and clean up on unmount
  useEffect(() => {
    const win: any = window;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = (event: any) => {
        // Only append final results to recognitionBaseRef once. Show interim results transiently.
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0]?.transcript || "";
          if (result.isFinal) {
            // append final transcript to base (once)
            recognitionBaseRef.current = recognitionBaseRef.current
              ? recognitionBaseRef.current + " " + transcript
              : transcript;
          } else {
            // build interim text
            interim += transcript;
          }
        }
        // Compose display text: stable base + transient interim
        const display = recognitionBaseRef.current
          ? recognitionBaseRef.current + (interim ? " " + interim : "")
          : interim;
        setMessage(display);
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error", event);
        // On certain errors stop recognition to avoid infinite loops
        try {
          recognitionInstance.stop();
        } catch {}
      };

      recognitionRef.current = recognitionInstance;
    }

    return () => {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          try {
            recognitionRef.current.stop();
          } catch {}
          recognitionRef.current = null;
        }
      } catch {}
    };
  }, []);

  // Use refs for recorder and chunk buffer to avoid stale-state issues
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  // Helper to cleanup recorder and tracks
  const cleanupRecorder = () => {
    try {
      if (recorderRef.current) {
        try {
          recorderRef.current.stream.getTracks().forEach((t) => t.stop());
        } catch {}
        try {
          recorderRef.current.ondataavailable = null;
          recorderRef.current.onstop = null;
        } catch {}
        recorderRef.current = null;
      }
    } catch {}
    chunksRef.current = [];
    setIsRecording(false);
  };

  // Simple canned-response helper for common user queries like "what is data science"
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const cannedDefinition = `Data science is an interdisciplinary field that uses scientific methods, statistics, algorithms, and systems to extract knowledge and insights from structured and unstructured data. It combines data engineering, exploratory analysis, and machine learning to inform decisions and build predictive models.`;

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;

    // If the user asked about "data" / "data science", send a short canned definition.
    const n = normalize(trimmed);
    if (n.includes("what is data science") || n.includes("what is data") || (n.includes("data science") && n.includes("what"))) {
      onSend(cannedDefinition);
    } else {
      onSend(trimmed);
    }

    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
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

  // Add an aria message to announce recording state for screen readers
  const [liveMessage, setLiveMessage] = useState<string>("");

  // Stop recording helper that ensures cleanup path is used consistently
  const stopRecording = useCallback(async () => {
    // If SpeechRecognition is active, stop it
    if (isSpeechSupported && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsRecording(false);
      setLiveMessage("Recording stopped");
      return;
    }

    // If MediaRecorder is active, stop it
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      try {
        recorderRef.current.stop();
      } catch {}
    } else {
      cleanupRecorder();
    }
    setLiveMessage("Recording stopped");
  }, [isSpeechSupported]);

  // Add Escape key handler to stop recording as a quick shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent | KeyboardEventInit) => {
      // Support both React and native event shapes
      const key = ("key" in e) ? (e as KeyboardEvent).key : (e as any).key;
      if (key === "Escape" && isRecording) {
        // Avoid awaiting here; toggleRecording/stopRecording handle state
        stopRecording();
      }
    };
    window.addEventListener("keydown", onKey as any);
    return () => window.removeEventListener("keydown", onKey as any);
  }, [isRecording, stopRecording]);

  // Update live announcer when recording starts/stops
  useEffect(() => {
    if (isRecording) {
      setLiveMessage("Recording started. Click the microphone to stop recording, or press Escape.");
    } else if (!isRecording && !isTranscribing) {
      // Clear message shortly after stop so it doesn't linger
      const id = setTimeout(() => setLiveMessage(""), 2000);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  // Start/stop recording. Uses SpeechRecognition when available, otherwise MediaRecorder as fallback.
  const toggleRecording = async () => {
    // If currently recording (either method), stop it.
    if (isRecording) {
      await stopRecording();
      return;
    }

    // Start SpeechRecognition if supported
    if (isSpeechSupported && recognitionRef.current) {
      try {
        // capture the current message as the stable base so onresult won't duplicate previous text
        recognitionBaseRef.current = message.trim();
        recognitionRef.current.start();
        setIsRecording(true);
        setIsTranscribing(false); // live STT; server transcription flag not needed here
        setLiveMessage("Recording started. Click the microphone to stop recording, or press Escape.");
      } catch (err) {
        console.error("Unable to start SpeechRecognition:", err);
        alert("Speech recognition unavailable. Falling back to audio recording.");
      }
      return;
    }

    // Fallback: existing MediaRecorder flow
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Microphone access is not supported by this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Try a useful mimeType, but let the browser pick if unsupported.
      let options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        options = { mimeType: "audio/webm;codecs=opus" };
      } else if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported("audio/webm")) {
        options = { mimeType: "audio/webm" };
      }

      // Create recorder and wire events using refs
      const recorder = new MediaRecorder(stream, options);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        // Use the chunksRef directly - avoids relying on React state
        const chunks = chunksRef.current.slice();
        const mimeType = chunks.length && (chunks[0] as Blob).type ? (chunks[0] as Blob).type : "audio/webm";
        const blob = new Blob(chunks, { type: mimeType });

        // clear buffer/recorder early to avoid leaks
        cleanupRecorder();

        if (!blob || blob.size === 0) {
          return;
        }

        // Send to server for transcription
        setIsTranscribing(true);
        try {
          const form = new FormData();
          const filename = `recording-${Date.now()}.webm`;
          form.append("file", blob, filename);

          // Use absolute origin to avoid potential basePath/relative routing issues
          const apiUrl = `${window.location.origin}/api/transcribe`;

          const resp = await fetch(apiUrl, {
            method: "POST",
            body: form,
          });

          if (!resp.ok) {
            const text = await resp.text();
            console.error("Transcription API error:", resp.status, text);
            alert(`Transcription failed (${resp.status}). See console for details.`);
            setIsTranscribing(false);
            return;
          }

          const data = await resp.json();
          const transcript = data?.text ?? "";

          // Insert transcript into input for user editing / sending
          setMessage((prev) => (prev ? prev + " " + transcript : transcript));
          if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
            textareaRef.current.focus();
          }
        } catch (err) {
          console.error("Transcription failed:", err);
          alert("Transcription failed. Check console.");
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Unable to access microphone. Please allow microphone permissions.");
      cleanupRecorder();
    }
  };

  // When initialValue changes (e.g., user clicked Edit), populate and focus the textarea
  useEffect(() => {
    if (initialValue !== undefined && initialValue !== null) {
      setMessage(initialValue);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        // focus after a tiny delay to ensure DOM ready
        setTimeout(() => textareaRef.current?.focus(), 20);
      }
    }
  }, [initialValue]);

  return (
    <div className="relative flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-sm transition-all focus-within:shadow-md focus-within:ring-2 focus-within:ring-primary/20">
      {/* Attachment Button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 text-muted-foreground hover:text-foreground"
        disabled={disabled || isTranscribing}
      >
        <Paperclip className="h-5 w-5" />
      </Button>

      {/* Text Input */}
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={handleTextareaChange}
        onKeyDown={handleKeyDown}
        placeholder={
          isTranscribing
            ? "Transcribing..."
            : teacherMode
            ? "Teacher session active — respond to the prompt or speak your answer..."
            : isEditing
            ? "Edit your message and press Enter to resend..."
            : "Ask me anything about your career..."
        }
        disabled={disabled || isTranscribing}
        className="min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent px-0 py-3 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        rows={1}
      />

      {/* Voice Button: pill-style mic that changes theme/text when recording */}
      <button
        type="button"
        onClick={toggleRecording}
        disabled={disabled || isTranscribing}
        aria-pressed={isRecording}
        title={isRecording ? "Stop recording (or press Escape)" : isSpeechSupported ? "Record voice (Browser STT)" : "Record voice (AssemblyAI)"}
        className={cn(
          "shrink-0 inline-flex items-center gap-2 select-none transition-all duration-150 focus:outline-none",
          // recording pill style
          isRecording
            ? "rounded-full bg-destructive/90 px-3 py-1 text-white shadow-md hover:bg-destructive/95"
            : "rounded-full bg-transparent p-0 text-muted-foreground hover:text-foreground"
        )}
      >
        {/* pulsing dot + mic + Stop text to mimic screenshot */}
        {isRecording ? (
          <>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white/90 animate-pulse" aria-hidden="true" />
              <Mic className="h-4 w-4" />
              <span className="text-xs font-medium">Stop</span>
            </span>
          </>
        ) : (
          <span className="inline-flex items-center justify-center p-2">
            <Mic className="h-5 w-5" />
          </span>
        )}
      </button>

      {/* Send Button */}
      <Button
        type="button"
        size="icon"
        onClick={handleSend}
        disabled={disabled || !message.trim() || isTranscribing}
        className="shrink-0 bg-primary hover:bg-primary/90"
      >
        <Send className="h-5 w-5" />
      </Button>

      {/* Live region for screen readers */}
      <div aria-live="polite" className="sr-only">
        {liveMessage}
      </div>
    </div>
  );
};