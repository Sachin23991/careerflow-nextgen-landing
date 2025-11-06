import "./chat.css";
import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
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

  // Start/stop recording. Uses recorderRef and chunksRef for reliability.
  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        try {
          recorderRef.current.stop();
        } catch {}
      } else {
        cleanupRecorder();
      }
      return;
    }

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
        placeholder={isTranscribing ? "Transcribing..." : "Ask me anything about your career..."}
        disabled={disabled || isTranscribing}
        className="min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent px-0 py-3 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        rows={1}
      />

      {/* Voice Button */}
      <Button
        type="button"
        variant={isRecording ? "destructive" : "ghost"}
        size="icon"
        onClick={toggleRecording}
        disabled={disabled || isTranscribing}
        className={cn(
          "shrink-0 transition-colors",
          isRecording ? "text-destructive hover:text-destructive" : "text-muted-foreground hover:text-foreground"
        )}
        title={isRecording ? "Stop recording" : "Record voice (AssemblyAI)"}
      >
        <Mic className={cn("h-5 w-5", isRecording && "animate-pulse")} />
      </Button>

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
    </div>
  );
};