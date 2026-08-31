import { createWorker, PSM, type Worker } from "tesseract.js";

// Restricting recognition to exactly the characters math-solver.ts knows
// how to parse means Tesseract spends its confidence budget choosing
// among the right shapes, instead of also considering every letter of
// the alphabet for a page that will never contain one.
const CHAR_WHITELIST = "0123456789+-*/=().x^×÷";

export type OcrLoadProgress = { status: string; progress: number };

let loadPromise: Promise<Worker> | null = null;

export async function loadMathOcr(onProgress: (progress: OcrLoadProgress) => void): Promise<Worker> {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const worker = await createWorker("eng", undefined, {
      logger: (message) => onProgress({ status: message.status, progress: message.progress }),
    });
    await worker.setParameters({
      tessedit_char_whitelist: CHAR_WHITELIST,
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
    });
    return worker;
  })();

  try {
    return await loadPromise;
  } catch (err) {
    loadPromise = null;
    throw err;
  }
}

export async function recognizeMathText(worker: Worker, canvas: HTMLCanvasElement): Promise<string> {
  const { data } = await worker.recognize(canvas);
  return data.text;
}
