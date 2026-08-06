import { useCallback, useEffect, useRef, useState } from "react";
import { listKokoroVoices, loadKokoro, synthesize, type KokoroVoice } from "@/lib/kokoro-engine";

export type KokoroModelState = "not-loaded" | "loading" | "ready" | "error";
export type KokoroPlaybackStatus = "idle" | "buffering" | "playing" | "paused" | "finished" | "error";

const KOKORO_VOICE_STORAGE_KEY = "narrate:kokoro-voice";
const DEFAULT_VOICE = "af_heart";

type TTSInstance = Awaited<ReturnType<typeof loadKokoro>>;

export function useKokoroReader(paragraphs: string[]) {
  const [modelState, setModelState] = useState<KokoroModelState>("not-loaded");
  const [modelProgress, setModelProgress] = useState(0);
  const [status, setStatus] = useState<KokoroPlaybackStatus>("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [voices, setVoices] = useState<KokoroVoice[]>([]);
  const [voiceId, setVoiceId] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_VOICE;
    return localStorage.getItem(KOKORO_VOICE_STORAGE_KEY) ?? DEFAULT_VOICE;
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ttsRef = useRef<TTSInstance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clipCache = useRef<Map<number, string>>(new Map());
  const currentIndexRef = useRef(0);
  const statusRef = useRef<KokoroPlaybackStatus>("idle");
  const voiceIdRef = useRef(voiceId);
  const playFromRef = useRef<(index: number) => void>(() => {});

  useEffect(() => {
    currentIndexRef.current = currentIndex;
    statusRef.current = status;
  }, [currentIndex, status]);

  useEffect(() => {
    voiceIdRef.current = voiceId;
    clipCache.current.forEach((url) => URL.revokeObjectURL(url));
    clipCache.current.clear();
  }, [voiceId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    audioRef.current = new Audio();
    const cache = clipCache.current;
    return () => {
      audioRef.current?.pause();
      cache.forEach((url) => URL.revokeObjectURL(url));
      cache.clear();
    };
  }, []);

  const enable = useCallback(() => {
    if (modelState === "loading" || modelState === "ready") return;
    setModelState("loading");
    setErrorMessage(null);
    loadKokoro((progress) => {
      if (progress.total > 0) setModelProgress(progress.loaded / progress.total);
    })
      .then((tts) => {
        ttsRef.current = tts;
        setVoices(listKokoroVoices(tts));
        setModelState("ready");
      })
      .catch(() => {
        setModelState("error");
        setErrorMessage("Couldn't load the better-voice model. Web Speech is still available.");
      });
  }, [modelState]);

  const getClip = useCallback(async (index: number): Promise<string | null> => {
    const tts = ttsRef.current;
    if (!tts || index < 0 || index >= paragraphs.length) return null;
    const cached = clipCache.current.get(index);
    if (cached) return cached;
    const blob = await synthesize(tts, paragraphs[index], voiceIdRef.current);
    const url = URL.createObjectURL(blob);
    clipCache.current.set(index, url);
    return url;
  }, [paragraphs]);

  const playFrom = useCallback(
    (index: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (index >= paragraphs.length) {
        setStatus("finished");
        return;
      }

      setCurrentIndex(index);
      setStatus("buffering");

      getClip(index)
        .then((url) => {
          if (!url || statusRef.current !== "buffering" || currentIndexRef.current !== index) return;
          audio.src = url;
          audio.onended = () => {
            if (statusRef.current !== "playing") return;
            const next = index + 1;
            setCurrentIndex(next);
            playFromRef.current(next);
          };
          audio.onerror = () => {
            setErrorMessage("Couldn't play that paragraph's audio.");
            setStatus("error");
          };
          setStatus("playing");
          audio.play().catch(() => {
            setErrorMessage("Couldn't play that paragraph's audio.");
            setStatus("error");
          });
          getClip(index + 1).catch(() => {});
        })
        .catch(() => {
          setErrorMessage("Couldn't generate speech for that paragraph.");
          setStatus("error");
        });
    },
    [paragraphs.length, getClip],
  );

  useEffect(() => {
    playFromRef.current = playFrom;
  }, [playFrom]);

  const play = useCallback(() => {
    if (status === "paused") {
      audioRef.current?.play();
      setStatus("playing");
      return;
    }
    playFrom(status === "finished" || status === "error" ? 0 : currentIndexRef.current);
  }, [status, playFrom]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setStatus("paused");
  }, []);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    setCurrentIndex(0);
    setStatus("idle");
  }, []);

  const skipTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, paragraphs.length - 1));
      if (statusRef.current === "playing" || statusRef.current === "paused" || statusRef.current === "buffering") {
        playFrom(clamped);
      } else {
        setCurrentIndex(clamped);
      }
    },
    [paragraphs.length, playFrom],
  );

  const selectVoice = useCallback((id: string) => {
    setVoiceId(id);
    localStorage.setItem(KOKORO_VOICE_STORAGE_KEY, id);
  }, []);

  return {
    modelState,
    modelProgress,
    status,
    currentIndex,
    voices,
    voiceId,
    errorMessage,
    progress: paragraphs.length ? currentIndex / paragraphs.length : 0,
    enable,
    play,
    pause,
    stop,
    skipNext: () => skipTo(currentIndexRef.current + 1),
    skipPrev: () => skipTo(currentIndexRef.current - 1),
    selectVoice,
  };
}
