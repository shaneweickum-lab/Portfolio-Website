import { useCallback, useEffect, useRef, useState } from "react";
import { listKokoroVoices, loadKokoro, synthesize, type KokoroVoice } from "@/lib/kokoro-engine";

export type KokoroModelState = "not-loaded" | "loading" | "warming-up" | "ready" | "error";
export type KokoroPlaybackStatus = "idle" | "buffering" | "playing" | "paused" | "finished" | "error";

const KOKORO_VOICE_STORAGE_KEY = "narrate:kokoro-voice";
const DEFAULT_VOICE = "af_heart";
const INITIAL_MS_PER_CHAR = 70;
const MIN_ESTIMATE_MS = 400;
const BUFFER_TICK_MS = 100;
const SYNTHESIS_TIMEOUT_MS = 45_000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

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
  const [bufferProgress, setBufferProgress] = useState(0);

  const ttsRef = useRef<TTSInstance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clipCache = useRef<Map<number, string>>(new Map());
  const currentIndexRef = useRef(0);
  const statusRef = useRef<KokoroPlaybackStatus>("idle");
  const voiceIdRef = useRef(voiceId);
  const playFromRef = useRef<(index: number) => void>(() => {});
  const msPerCharRef = useRef(INITIAL_MS_PER_CHAR);
  const bufferTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      if (bufferTimerRef.current) clearInterval(bufferTimerRef.current);
    };
  }, []);

  const enable = useCallback(() => {
    if (modelState === "loading" || modelState === "warming-up" || modelState === "ready") return;
    setModelState("loading");
    setErrorMessage(null);
    loadKokoro((progress) => {
      if (progress.total > 0) setModelProgress(progress.loaded / progress.total);
    })
      .then(async (tts) => {
        ttsRef.current = tts;
        setVoices(listKokoroVoices(tts));
        // The first generate() call for a voice also fetches that voice's
        // style data separately from the model itself — do this now, while
        // the UI is already showing a "getting ready" state, instead of
        // silently on the first paragraph the user tries to play.
        setModelState("warming-up");
        await withTimeout(
          synthesize(tts, "Ready.", voiceIdRef.current),
          SYNTHESIS_TIMEOUT_MS,
          "Setting up the voice timed out.",
        );
        setModelState("ready");
      })
      .catch(() => {
        setModelState("error");
        setErrorMessage(
          ttsRef.current
            ? "The voice model downloaded, but setting up the voice is taking too long on this device. Web Speech is still available."
            : "Couldn't load the better-voice model. Web Speech is still available.",
        );
      });
  }, [modelState]);

  const synthesizeUrl = useCallback(async (index: number): Promise<string> => {
    const tts = ttsRef.current;
    if (!tts) throw new Error("model not ready");
    const blob = await withTimeout(
      synthesize(tts, paragraphs[index], voiceIdRef.current),
      SYNTHESIS_TIMEOUT_MS,
      "Speech generation is taking far longer than expected — this device may be too slow for the better voice model. Try Device voice instead.",
    );
    return URL.createObjectURL(blob);
  }, [paragraphs]);

  const synthesizeUrlTracked = useCallback(async (index: number): Promise<string> => {
    const text = paragraphs[index];
    const estimateMs = Math.max(MIN_ESTIMATE_MS, text.length * msPerCharRef.current);
    const start = performance.now();
    setBufferProgress(0);
    bufferTimerRef.current = setInterval(() => {
      setBufferProgress(Math.min(0.95, (performance.now() - start) / estimateMs));
    }, BUFFER_TICK_MS);

    try {
      const url = await synthesizeUrl(index);
      const actualMs = performance.now() - start;
      if (text.length > 20) {
        msPerCharRef.current = msPerCharRef.current * 0.6 + (actualMs / text.length) * 0.4;
      }
      setBufferProgress(1);
      return url;
    } finally {
      if (bufferTimerRef.current) clearInterval(bufferTimerRef.current);
    }
  }, [paragraphs, synthesizeUrl]);

  const getClip = useCallback(async (index: number, trackProgress = false): Promise<string | null> => {
    if (!ttsRef.current || index < 0 || index >= paragraphs.length) return null;
    const cached = clipCache.current.get(index);
    if (cached) return cached;
    const url = trackProgress ? await synthesizeUrlTracked(index) : await synthesizeUrl(index);
    clipCache.current.set(index, url);
    return url;
  }, [paragraphs.length, synthesizeUrl, synthesizeUrlTracked]);

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
      setBufferProgress(0);

      getClip(index, true)
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
        .catch((err) => {
          setErrorMessage(
            err instanceof Error ? err.message : "Couldn't generate speech for that paragraph.",
          );
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
    bufferProgress,
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
