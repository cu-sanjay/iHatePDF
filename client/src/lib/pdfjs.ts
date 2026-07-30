import * as pdfjs from "pdfjs-dist";
// Bundled worker (CDN copies of pdf.worker.js do not exist for v5 — it is .mjs)
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export { pdfjs };

/**
 * Loads a PDF with pdf.js. Always copies the buffer because pdf.js
 * transfers (detaches) the ArrayBuffer it is given.
 */
export const loadPdfDocument = async (source: File | ArrayBuffer | Uint8Array) => {
  let bytes: Uint8Array;
  if (source instanceof File) {
    bytes = new Uint8Array(await source.arrayBuffer());
  } else if (source instanceof Uint8Array) {
    bytes = new Uint8Array(source);
  } else {
    bytes = new Uint8Array(source.slice(0));
  }
  return pdfjs.getDocument({ data: bytes }).promise;
};

/**
 * Renders a single page (1-based) into a canvas and returns it.
 */
export const renderPdfPageToCanvas = async (
  pdf: Awaited<ReturnType<typeof loadPdfDocument>>,
  pageNumber: number,
  scale = 1.5
): Promise<HTMLCanvasElement> => {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not create canvas context");
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  await page.render({ canvas, canvasContext: context, viewport } as any).promise;
  return canvas;
};

/**
 * Renders the first page of a PDF to a data URL (used for thumbnails).
 */
export const renderPdfThumbnail = async (file: File, scale = 1): Promise<string> => {
  const pdf = await loadPdfDocument(file);
  const canvas = await renderPdfPageToCanvas(pdf, 1, scale);
  return canvas.toDataURL("image/jpeg", 0.8);
};

/**
 * Parses "1,3,5-8" into a sorted, de-duplicated list of page numbers.
 */
export const parsePageRange = (input: string, maxPage: number): number[] => {
  const pages = new Set<number>();
  for (const part of input.split(",")) {
    const token = part.trim();
    if (!token) continue;
    const rangeMatch = token.match(/^(\d+)\s*[-–]\s*(\d+)$/);
    if (rangeMatch) {
      let start = parseInt(rangeMatch[1], 10);
      let end = parseInt(rangeMatch[2], 10);
      if (start > end) [start, end] = [end, start];
      for (let i = start; i <= end; i++) {
        if (i >= 1 && i <= maxPage) pages.add(i);
      }
    } else if (/^\d+$/.test(token)) {
      const page = parseInt(token, 10);
      if (page >= 1 && page <= maxPage) pages.add(page);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
};
