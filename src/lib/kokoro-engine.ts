const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";

export type KokoroVoice = {
  id: string;
  name: string;
  language: string;
  gender: string;
};

export type ModelLoadProgress = {
  loaded: number;
  total: number;
};

type KokoroModule = typeof import("kokoro-js");
type KokoroTTSInstance = InstanceType<KokoroModule["KokoroTTS"]>;

let loadPromise: Promise<KokoroTTSInstance> | null = null;
const fileProgress = new Map<string, ModelLoadProgress>();

function aggregateProgress(): ModelLoadProgress {
  let loaded = 0;
  let total = 0;
  for (const entry of fileProgress.values()) {
    loaded += entry.loaded;
    total += entry.total;
  }
  return { loaded, total };
}

export async function loadKokoro(
  onProgress: (progress: ModelLoadProgress) => void,
): Promise<KokoroTTSInstance> {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const { KokoroTTS } = await import("kokoro-js");
    return KokoroTTS.from_pretrained(MODEL_ID, {
      dtype: "q8",
      device: "wasm",
      progress_callback: (event) => {
        if (!("file" in event)) return;
        if (event.status === "progress") {
          fileProgress.set(event.file, { loaded: event.loaded, total: event.total });
        } else if (event.status === "done") {
          const existing = fileProgress.get(event.file);
          fileProgress.set(event.file, {
            loaded: existing?.total ?? 1,
            total: existing?.total ?? 1,
          });
        }
        onProgress(aggregateProgress());
      },
    });
  })();

  try {
    return await loadPromise;
  } catch (err) {
    loadPromise = null;
    throw err;
  }
}

export function listKokoroVoices(tts: KokoroTTSInstance): KokoroVoice[] {
  return Object.entries(tts.voices).map(([id, voice]) => ({
    id,
    name: voice.name,
    language: voice.language,
    gender: voice.gender,
  }));
}

export async function synthesize(
  tts: KokoroTTSInstance,
  text: string,
  voice: string,
): Promise<Blob> {
  const voiceId = voice as keyof KokoroTTSInstance["voices"];
  const audio = await tts.generate(text, { voice: voiceId });
  return audio.toBlob();
}
