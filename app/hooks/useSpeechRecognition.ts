"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/* ── Web Speech API type augmentation ── */

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

/* ── Hook ── */

export type SpeechStatus = "idle" | "listening" | "error";

interface UseSpeechRecognitionReturn {
  /** Whether the browser supports speech recognition */
  isSupported: boolean;
  /** Current status: idle, listening, or error */
  status: SpeechStatus;
  /** The transcript accumulated so far (interim + final) */
  transcript: string;
  /** Interim (not yet final) transcript for visual feedback */
  interimTranscript: string;
  /** Start listening */
  startListening: () => void;
  /** Stop listening */
  stopListening: () => void;
  /** Toggle listening on/off */
  toggleListening: () => void;
  /** Clear the transcript */
  clearTranscript: () => void;
  /** Last error message, if any */
  errorMessage: string | null;
}

/**
 * Hook for Web Speech API speech recognition.
 * Supports Serbian (sr) language with continuous mode.
 */
export function useSpeechRecognition(
  lang = "sr",
  onTranscript?: (text: string) => void,
): UseSpeechRecognitionReturn {
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isStoppingRef = useRef(false);
  const finalTranscriptRef = useRef("");

  // Feature detection — must run client-side
  const [isSupported, setIsSupported] = useState(false);
  useEffect(() => {
    setIsSupported(
      typeof window !== "undefined" &&
      !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    );
  }, []);

  const createRecognition = useCallback((): SpeechRecognitionInstance | null => {
    if (typeof window === "undefined") return null;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    const recognition = new SR();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    return recognition;
  }, [lang]);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    // Stop any existing instance
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
    }

    const recognition = createRecognition();
    if (!recognition) return;

    finalTranscriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");
    setErrorMessage(null);
    isStoppingRef.current = false;

    recognition.onstart = () => {
      setStatus("listening");
    };

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let finalText = "";
      let interimText = "";

      for (let i = 0; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      finalTranscriptRef.current = finalText;
      setTranscript(finalText + interimText);
      setInterimTranscript(interimText);
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      // "aborted" and "no-speech" are normal, not real errors
      if (e.error === "aborted" || e.error === "no-speech") {
        setStatus("idle");
        return;
      }

      const messages: Record<string, string> = {
        "not-allowed": "Mikrofon nije dozvoljen. Proveri dozvole u browseru.",
        "network": "Greška u mreži. Proveri internet konekciju.",
        "audio-capture": "Mikrofon nije pronađen.",
        "service-not-allowed": "Servis za prepoznavanje govora nije dostupan.",
      };

      setErrorMessage(messages[e.error] || `Greška: ${e.error}`);
      setStatus("error");
    };

    recognition.onend = () => {
      if (!isStoppingRef.current && status === "listening") {
        // Auto-restart if not manually stopped (handles Chrome's ~60s limit)
        try {
          recognition.start();
          return;
        } catch { /* fall through to idle */ }
      }
      setStatus("idle");
      // Call the callback with final transcript
      const final = finalTranscriptRef.current.trim();
      if (final && onTranscript) {
        onTranscript(final);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setErrorMessage("Ne mogu pokrenuti mikrofon.");
      setStatus("error");
    }
  }, [isSupported, createRecognition, onTranscript, status]);

  const stopListening = useCallback(() => {
    isStoppingRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch { /* ignore */ }
    }
    setStatus("idle");
    setInterimTranscript("");

    // Fire callback immediately with accumulated transcript
    const final = finalTranscriptRef.current.trim();
    if (final && onTranscript) {
      onTranscript(final);
    }
  }, [onTranscript]);

  const toggleListening = useCallback(() => {
    if (status === "listening") {
      stopListening();
    } else {
      startListening();
    }
  }, [status, startListening, stopListening]);

  const clearTranscript = useCallback(() => {
    finalTranscriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        isStoppingRef.current = true;
        try { recognitionRef.current.abort(); } catch { /* ignore */ }
      }
    };
  }, []);

  return {
    isSupported,
    status,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
    errorMessage,
  };
}
