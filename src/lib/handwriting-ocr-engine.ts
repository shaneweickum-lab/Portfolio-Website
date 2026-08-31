import type { ImageToTextOutput, ImageToTextPipelineType, PretrainedModelOptions } from "@huggingface/transformers";

// The full `pipeline()` overload set (one branch per task name) is too
// complex for TypeScript to resolve at a call site -- narrowing the
// function reference to just the "image-to-text" overload first avoids
// forcing TS to evaluate the whole union.
type LoadImageToText = (
  task: "image-to-text",
  model: string,
  options: PretrainedModelOptions,
) => Promise<ImageToTextPipelineType>;

// The canonical ONNX conversion of Microsoft's TrOCR (small) fine-tuned for
// handwriting -- this exact model is @huggingface/transformers' own
// documented example for OCR via the image-to-text pipeline. Unlike
// Tesseract, it does no text detection/localization of its own: it expects
// an already-cropped line of text, not a full page.
const MODEL_ID = "Xenova/trocr-small-handwritten";

export type ModelLoadProgress = { loaded: number; total: number };

let loadPromise: Promise<ImageToTextPipelineType> | null = null;
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

export async function loadHandwritingOcr(
  onProgress: (progress: ModelLoadProgress) => void,
): Promise<ImageToTextPipelineType> {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const { pipeline } = await import("@huggingface/transformers");
    const loadImageToText = pipeline as unknown as LoadImageToText;
    return loadImageToText("image-to-text", MODEL_ID, {
      device: "wasm",
      progress_callback: (event) => {
        if (!("file" in event)) return;
        if (event.status === "progress") {
          fileProgress.set(event.file, { loaded: event.loaded, total: event.total });
        } else if (event.status === "done") {
          const existing = fileProgress.get(event.file);
          fileProgress.set(event.file, { loaded: existing?.total ?? 1, total: existing?.total ?? 1 });
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

export async function recognizeHandwriting(ocr: ImageToTextPipelineType, canvas: HTMLCanvasElement): Promise<string> {
  const output = (await ocr(canvas)) as ImageToTextOutput;
  return output[0]?.generated_text ?? "";
}
