import { useRef, useState, useEffect, useCallback } from "react";

// --- Configuration ---
// Popular Murf Voices:
// "en-US-natalie" (Female, Professional)
// "en-US-ryan" (Male, Deep)
// "en-US-miles" (Male, Calm)
const DEFAULT_VOICE_ID = "en-US-ryan"; 

// Model selection: GEN2 is generally better quality
const MURF_MODEL = "GEN2"; 

type OnTranscript = (transcript: string) => void;

interface UseTeacherSessionReturn {
  start: (initialPrompt: string, onTranscript: OnTranscript) => Promise<void>;
  end: () => void;
  speak: (text: string) => void; // <--- ADDED: You need this to make the AI reply!
  stopSpeaking: () => void;
  listening: boolean;
  speaking: boolean;
  processing: boolean;
  transcript: string;
  volume: number; // 0-100 (Visualizer)
}

export const useTeacherSession = (apiKeys: string[]): UseTeacherSessionReturn => {
  // --- State ---
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [volume, setVolume] = useState(0);

  // --- Refs ---
  const recognitionRef = useRef<any | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const onTranscriptRef = useRef<OnTranscript | null>(null);
  
  // Audio Engine
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  // Queue & Rotation
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const synthesisQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);
  const isFetchingRef = useRef(false);
  const keyIndexRef = useRef(0); // For rotation

  // --- Helper: Key Rotation ---
  const getNextKey = () => {
    if (!apiKeys || apiKeys.length === 0) return null;
    const key = apiKeys[keyIndexRef.current % apiKeys.length];
    keyIndexRef.current += 1; // Increment for next time
    return key;
  };

  // --- Audio Context & Visualizer ---
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      
      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      gainNodeRef.current = gainNode;
    }
    // Browser policy requires user gesture to resume audio
    if (audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume();
    }
  }, []);

  // Visualizer Loop
  useEffect(() => {
    let animationFrame: number;
    const updateVolume = () => {
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVolume(Math.min(100, Math.round(avg * 2.5)));
      }
      animationFrame = requestAnimationFrame(updateVolume);
    };
    updateVolume();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // --- Murf AI Text-to-Speech Logic ---

  const base64ToArrayBuffer = (base64: string) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const fetchAudioForSentence = async (text: string) => {
    const apiKey = getNextKey();
    if (!apiKey) {
      console.warn("No API Keys provided for Murf");
      return null;
    }

    try {
      // Using generate endpoint with Base64 to avoid CORS/URL expiry issues
      const response = await fetch("https://api.murf.ai/v1/speech/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify({
          text: text,
          voiceId: DEFAULT_VOICE_ID,
          style: "Conversational",
          rate: 10, // Slight speed up for "Live" feel
          pitch: 0,
          sampleRate: 44100,
          format: "MP3",
          encodeAsBase64: true, // Crucial for client-side handling
          modelVersion: MURF_MODEL,
        }),
      });

      if (!response.ok) {
        console.warn(`Murf API Error with key index ${keyIndexRef.current - 1}`, response.status);
        // Retry logic could go here, but for now we skip to avoid hanging
        return null;
      }

      const data = await response.json();
      if (data.encodedAudio) {
        return base64ToArrayBuffer(data.encodedAudio);
      }
      return null;
    } catch (e) {
      console.error("Murf Fetch Error", e);
      return null;
    }
  };

  const playNextInQueue = async () => {
    if (!audioContextRef.current || audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setSpeaking(false);
      
      // If queue empty and no fetching, resume listening
      if (synthesisQueueRef.current.length === 0 && !isFetchingRef.current) {
        startRecognitionInternal();
      }
      return;
    }

    isPlayingRef.current = true;
    setSpeaking(true);

    const audioBuffer = audioQueueRef.current.shift()!;
    
    // Connect Source -> Analyser -> Gain -> Speakers
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    
    if (analyserRef.current && gainNodeRef.current) {
      source.connect(analyserRef.current);
      analyserRef.current.connect(gainNodeRef.current);
    }

    sourceNodeRef.current = source;
    source.start(0);

    source.onended = () => {
      sourceNodeRef.current = null;
      // Slight pause between sentences for breath
      setTimeout(() => playNextInQueue(), 150);
    };
  };

  const processTextQueue = async () => {
    if (isFetchingRef.current || synthesisQueueRef.current.length === 0) return;

    isFetchingRef.current = true;
    const text = synthesisQueueRef.current.shift()!;

    const rawBuffer = await fetchAudioForSentence(text);
    
    if (rawBuffer && audioContextRef.current) {
      try {
        const decodedBuffer = await audioContextRef.current.decodeAudioData(rawBuffer);
        audioQueueRef.current.push(decodedBuffer);

        if (!isPlayingRef.current) {
          playNextInQueue();
        }
      } catch (e) {
        console.error("Audio Decode Error", e);
      }
    }

    isFetchingRef.current = false;
    processTextQueue(); // Pipeline: fetch next while playing current
  };

  // This is the function you call to make the AI speak
  const speakText = async (text: string) => {
    stopRecognitionInternal(); // Stop listening while speaking
    setProcessing(false);

    // Split text into sentences for better streaming flow
    const sentences = text.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g) || [text];
    synthesisQueueRef.current = sentences.map((s) => s.trim()).filter(Boolean);
    
    processTextQueue();
  };

  const stopSpeaking = useCallback(() => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    audioQueueRef.current = [];
    synthesisQueueRef.current = [];
    isPlayingRef.current = false;
    setSpeaking(false);
  }, []);

  // --- Speech Recognition (Microphone) ---
  
  const startRecognitionInternal = () => {
    if (recognitionRef.current) return;
    if (typeof window === "undefined") return;

    // Connect Mic to Visualizer
    initAudioContext();
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      if (audioContextRef.current && analyserRef.current) {
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
      }
    }).catch(e => console.warn("Mic visualizer failed", e));

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = "en-US";

    recog.onresult = (event: any) => {
      if (isPlayingRef.current) return; // Don't listen while AI talks

      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

      let final = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }

      const currentText = (final + interim).trim();
      if (currentText) {
        setTranscript(currentText);
        
        // "Soft VAD": Wait 1.2s for silence before sending
        silenceTimerRef.current = setTimeout(() => {
          if (onTranscriptRef.current) {
            setProcessing(true);
            stopSpeaking();
            onTranscriptRef.current(currentText);
          }
        }, 1200);
      }
    };

    recog.start();
    recognitionRef.current = recog;
    setListening(true);
  };

  const stopRecognitionInternal = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
  };

  // --- Public Methods ---

  const start = async (initialPrompt: string, onTranscript: OnTranscript) => {
    onTranscriptRef.current = onTranscript;
    initAudioContext();
    
    if (initialPrompt) {
      await speakText(initialPrompt);
    } else {
      startRecognitionInternal();
    }
  };

  const end = () => {
    stopRecognitionInternal();
    stopSpeaking();
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  // Cleanup
  useEffect(() => {
    return () => end();
  }, []);

  return {
    start,
    end,
    speak: speakText, // EXPOSED HERE
    stopSpeaking,
    listening,
    speaking,
    processing,
    transcript,
    volume,
  };
};

export default useTeacherSession;