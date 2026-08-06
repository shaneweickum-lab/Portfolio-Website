import { useCallback, useEffect, useRef, useState } from "react";

export type ReaderStatus =
  | "idle"
  | "playing"
  | "paused"
  | "finished"
  | "unsupported"
  | "error";

const VOICE_STORAGE_KEY = "narrate:voice-uri";
const VOICE_LOAD_GRACE_MS = 2000;

export function useSpeechReader(paragraphs: string[]) {
  const [status, setStatus] = useState<ReaderStatus>(
    typeof window !== "undefined" && "speechSynthesis" in window ? "idle" : "unsupported",
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState<string | null>(null);
  const [voicesUnavailable, setVoicesUnavailable] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentIndexRef = useRef(0);
  const statusRef = useRef<ReaderStatus>(status);
  const speakFromRef = useRef<(index: number) => void>(() => {});

  useEffect(() => {
    currentIndexRef.current = currentIndex;
    statusRef.current = status;
  }, [currentIndex, status]);

  useEffect(() => {
    if (status === "unsupported") return;

    function loadVoices() {
      const available = window.speechSynthesis.getVoices();
      if (available.length === 0) return;
      setVoices(available);
      setVoicesUnavailable(false);
      setVoiceURI((current) => {
        if (current) return current;
        const stored = localStorage.getItem(VOICE_STORAGE_KEY);
        const match = available.find((v) => v.voiceURI === stored);
        return (match ?? available.find((v) => v.default) ?? available[0]).voiceURI;
      });
    }

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    const graceTimer = setTimeout(() => {
      if (window.speechSynthesis.getVoices().length === 0) setVoicesUnavailable(true);
    }, VOICE_LOAD_GRACE_MS);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      clearTimeout(graceTimer);
    };
  }, [status]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakFrom = useCallback(
    (index: number) => {
      window.speechSynthesis.cancel();

      if (index >= paragraphs.length) {
        setStatus("finished");
        return;
      }

      const utterance = new SpeechSynthesisUtterance(paragraphs[index]);
      const voice = voices.find((v) => v.voiceURI === voiceURI);
      if (voice) utterance.voice = voice;

      utterance.onstart = () => setErrorMessage(null);
      utterance.onend = () => {
        if (statusRef.current !== "playing") return;
        const next = index + 1;
        setCurrentIndex(next);
        speakFromRef.current(next);
      };
      utterance.onerror = (event) => {
        if (event.error === "canceled" || event.error === "interrupted") return;
        setErrorMessage(
          "This device couldn't produce speech audio (no text-to-speech voices found).",
        );
        setStatus("error");
      };

      setCurrentIndex(index);
      setStatus("playing");
      window.speechSynthesis.speak(utterance);
    },
    [paragraphs, voices, voiceURI],
  );

  useEffect(() => {
    speakFromRef.current = speakFrom;
  }, [speakFrom]);

  const play = useCallback(() => {
    if (status === "paused") {
      window.speechSynthesis.resume();
      setStatus("playing");
      return;
    }
    speakFrom(status === "finished" || status === "error" ? 0 : currentIndexRef.current);
  }, [status, speakFrom]);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
    setStatus("paused");
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setCurrentIndex(0);
    setStatus("idle");
  }, []);

  const skipTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, paragraphs.length - 1));
      if (statusRef.current === "playing" || statusRef.current === "paused") {
        speakFrom(clamped);
      } else {
        setCurrentIndex(clamped);
      }
    },
    [paragraphs.length, speakFrom],
  );

  const selectVoice = useCallback((uri: string) => {
    setVoiceURI(uri);
    localStorage.setItem(VOICE_STORAGE_KEY, uri);
  }, []);

  return {
    status,
    currentIndex,
    voices,
    voiceURI,
    voicesUnavailable,
    errorMessage,
    progress: paragraphs.length ? currentIndex / paragraphs.length : 0,
    play,
    pause,
    stop,
    skipNext: () => skipTo(currentIndexRef.current + 1),
    skipPrev: () => skipTo(currentIndexRef.current - 1),
    selectVoice,
  };
}
