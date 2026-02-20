import * as pdfjsLib from "pdfjs-dist";
import { createWorker } from "tesseract.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

async function renderPageToBlob(page: any, scale = 2): Promise<Blob> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d")!;

  await page.render({ canvasContext: ctx, viewport }).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas toBlob failed"));
    }, "image/png");
  });
}

export async function extractTextWithOCR(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  }).promise;

  console.log(`[OCR] Rendering ${pdf.numPages} pages to images for OCR`);

  const worker = await createWorker("eng");
  const pageTexts: string[] = [];

  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const blob = await renderPageToBlob(page);
      const { data } = await worker.recognize(blob);
      console.log(`[OCR] Page ${i}: ${data.text.length} chars`);
      pageTexts.push(data.text);
    }
  } finally {
    await worker.terminate();
  }

  const fullText = pageTexts.join("\n");
  console.log(`[OCR] Total extracted: ${fullText.length} chars. Preview: ${fullText.substring(0, 200)}`);
  return fullText;
}
