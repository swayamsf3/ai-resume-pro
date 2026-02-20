import { createWorker } from "tesseract.js";

export async function extractTextWithOCR(file: File): Promise<string> {
  const worker = await createWorker("eng");
  try {
    const { data } = await worker.recognize(file);
    return data.text;
  } finally {
    await worker.terminate();
  }
}
