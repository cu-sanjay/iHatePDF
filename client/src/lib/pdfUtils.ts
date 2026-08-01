import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { loadPdfDocument, renderPdfPageToCanvas } from "./pdfjs";

export { parsePageRange, loadPdfDocument, renderPdfPageToCanvas, renderPdfThumbnail } from "./pdfjs";

/** pdf-lib returns Uint8Array; normalise it into a Blob-safe ArrayBuffer */
const toBlobPart = (bytes: Uint8Array): ArrayBuffer => {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
};

const makePdfFile = (bytes: Uint8Array, name: string): File =>
  new File([toBlobPart(bytes)], name, { type: "application/pdf" });

export const getPdfPageCount = async (pdfFile: File): Promise<number> => {
  const doc = await PDFDocument.load(await pdfFile.arrayBuffer(), { ignoreEncryption: true });
  return doc.getPageCount();
};

interface PdfToImageOptions {
  format?: "jpg" | "png" | "webp";
  quality?: number;
  scale?: number;
  pages?: number[] | "all";
  onProgress?: (done: number, total: number) => void;
}

/**
 * Converts a PDF file to an array of image files
 */
export const convertPdfToImages = async (
  pdfFile: File,
  options: PdfToImageOptions = {}
): Promise<File[]> => {
  const { format = "jpg", quality = 0.8, scale = 2, pages = "all", onProgress } = options;

  const pdf = await loadPdfDocument(pdfFile);
  const numPages = pdf.numPages;

  const pagesToConvert =
    pages === "all"
      ? Array.from({ length: numPages }, (_, i) => i + 1)
      : pages.filter((p) => p > 0 && p <= numPages);

  if (pagesToConvert.length === 0) {
    throw new Error("No valid pages to convert");
  }

  const mimeTypes = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" } as const;
  const mimeType = mimeTypes[format];
  const imageFiles: File[] = [];

  for (let i = 0; i < pagesToConvert.length; i++) {
    const pageNum = pagesToConvert[i];
    const canvas = await renderPdfPageToCanvas(pdf, pageNum, scale);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Could not encode image"))),
        mimeType,
        format === "png" ? undefined : quality
      );
    });

    const fileName = `${pdfFile.name.replace(/\.pdf$/i, "")}_page_${pageNum}.${format}`;
    imageFiles.push(new File([blob], fileName, { type: mimeType }));
    onProgress?.(i + 1, pagesToConvert.length);
  }

  await pdf.destroy();
  return imageFiles;
};

interface CompressPdfOptions {
  quality?: "low" | "medium" | "high";
  removeMetadata?: boolean;
  targetSizeKB?: number;
  onProgress?: (done: number, total: number) => void;
}

/**
 * Compresses a PDF by re-rasterising each page at a reduced resolution/quality.
 * Falls back to a plain re-save when that would make the file bigger
 * (e.g. text-only documents that are already small).
 */
export const compressPdf = async (
  pdfFile: File,
  options: CompressPdfOptions = {}
): Promise<File> => {
  const { quality = "medium", removeMetadata = true, targetSizeKB, onProgress } = options;

  const presets = {
    low: { scale: 1.8, imageQuality: 0.84 },
    medium: { scale: 1.35, imageQuality: 0.65 },
    high: { scale: 0.95, imageQuality: 0.44 },
  } as const;
  const preset = presets[quality];
  const targetRatio = targetSizeKB && targetSizeKB > 0
    ? Math.min(1, (targetSizeKB * 1024) / pdfFile.size)
    : 1;
  const scale = Math.max(0.65, preset.scale * Math.max(0.72, Math.sqrt(targetRatio)));
  const imageQuality = Math.max(0.25, preset.imageQuality * Math.max(0.55, targetRatio));

  const outName = pdfFile.name.replace(/\.pdf$/i, "") + "_compressed.pdf";

  // Baseline: structural re-save (strips unused objects, optionally metadata)
  const baseDoc = await PDFDocument.load(await pdfFile.arrayBuffer(), { ignoreEncryption: true });
  if (removeMetadata) {
    baseDoc.setTitle("");
    baseDoc.setAuthor("");
    baseDoc.setSubject("");
    baseDoc.setKeywords([]);
    baseDoc.setProducer("iHatePDF");
    baseDoc.setCreator("iHatePDF");
  }
  const baseBytes = await baseDoc.save({ useObjectStreams: true });

  try {
    const pdf = await loadPdfDocument(pdfFile);
    const outDoc = await PDFDocument.create();

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const canvas = await renderPdfPageToCanvas(pdf, pageNum, scale);

      // Flatten onto white so JPEG transparency does not turn black
      const flat = document.createElement("canvas");
      flat.width = canvas.width;
      flat.height = canvas.height;
      const fctx = flat.getContext("2d")!;
      fctx.fillStyle = "#ffffff";
      fctx.fillRect(0, 0, flat.width, flat.height);
      fctx.drawImage(canvas, 0, 0);

      const dataUrl = flat.toDataURL("image/jpeg", imageQuality);
      const jpg = await outDoc.embedJpg(dataUrl);

      const srcPage = await pdf.getPage(pageNum);
      const [, , w, h] = srcPage.view;
      const rotation = ((srcPage.rotate % 360) + 360) % 360;
      const pageWidth = rotation === 90 || rotation === 270 ? h : w;
      const pageHeight = rotation === 90 || rotation === 270 ? w : h;

      const page = outDoc.addPage([pageWidth, pageHeight]);
      page.drawImage(jpg, { x: 0, y: 0, width: pageWidth, height: pageHeight });
      onProgress?.(pageNum, pdf.numPages);
    }

    outDoc.setProducer("iHatePDF");
    outDoc.setCreator("iHatePDF");
    const rasterBytes = await outDoc.save({ useObjectStreams: true });
    await pdf.destroy();

    const best =
      rasterBytes.byteLength < baseBytes.byteLength && rasterBytes.byteLength < pdfFile.size
        ? rasterBytes
        : baseBytes;
    return makePdfFile(best, outName);
  } catch {
    return makePdfFile(baseBytes, outName);
  }
};

/**
 * Merges multiple PDF files into a single PDF
 */
export const mergePdfFiles = async (pdfFiles: File[]): Promise<File> => {
  if (pdfFiles.length === 0) {
    throw new Error("No PDF files to merge");
  }

  const mergedPdf = await PDFDocument.create();

  for (const pdfFile of pdfFiles) {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedPdfBytes = await mergedPdf.save();
  return makePdfFile(mergedPdfBytes, "merged.pdf");
};

interface WatermarkOptions {
  text: string;
  opacity?: number;
  fontSize?: number;
}

/**
 * Adds a diagonal text watermark to every page of a PDF
 */
export const addWatermark = async (
  pdfFile: File,
  options: WatermarkOptions
): Promise<File> => {
  const { text, opacity = 0.15, fontSize = 48 } = options;

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    // Shrink the watermark if it would overflow the page diagonal
    let size = fontSize;
    while (font.widthOfTextAtSize(text, size) > Math.hypot(width, height) * 0.85 && size > 8) {
      size -= 2;
    }
    const textWidth = font.widthOfTextAtSize(text, size);
    const x = width / 2 - (textWidth / 2) * Math.cos(Math.PI / 4) + (size / 2) * Math.sin(Math.PI / 4);
    const y = height / 2 - (textWidth / 2) * Math.sin(Math.PI / 4) - (size / 2) * Math.cos(Math.PI / 4);

    page.drawText(text, {
      x,
      y,
      size,
      font,
      color: rgb(0.9, 0.1, 0.1),
      opacity,
      rotate: degrees(45),
    });
  }

  const pdfBytes = await pdfDoc.save();
  return makePdfFile(pdfBytes, pdfFile.name.replace(/\.pdf$/i, "") + "_watermarked.pdf");
};

interface ProtectOptions {
  watermarkText?: string;
  removeMetadata?: boolean;
}

/**
 * Adds visual protection (overlay + metadata strip) to a PDF
 */
export const protectPdf = async (
  pdfFile: File,
  options: ProtectOptions = {}
): Promise<File> => {
  const { watermarkText, removeMetadata = true } = options;

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  if (removeMetadata) {
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("");
    pdfDoc.setSubject("");
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer("iHatePDF");
    pdfDoc.setCreator("iHatePDF");
  }

  if (watermarkText) {
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();

    for (const page of pages) {
      const { width, height } = page.getSize();
      let fontSize = 52;
      while (font.widthOfTextAtSize(watermarkText, fontSize) > Math.hypot(width, height) * 0.85 && fontSize > 8) {
        fontSize -= 2;
      }
      const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
      const x = width / 2 - (textWidth / 2) * Math.cos(Math.PI / 4) + (fontSize / 2) * Math.sin(Math.PI / 4);
      const y = height / 2 - (textWidth / 2) * Math.sin(Math.PI / 4) - (fontSize / 2) * Math.cos(Math.PI / 4);

      page.drawText(watermarkText, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0.85, 0.1, 0.1),
        opacity: 0.12,
        rotate: degrees(45),
      });

      page.drawRectangle({
        x: 8,
        y: 8,
        width: width - 16,
        height: height - 16,
        borderColor: rgb(0.85, 0.1, 0.1),
        borderWidth: 2,
        opacity: 0,
        borderOpacity: 0.3,
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  return makePdfFile(pdfBytes, pdfFile.name.replace(/\.pdf$/i, "") + "_protected.pdf");
};

interface SplitPdfOptions {
  pages?: number[] | "all";
  outputType?: "single" | "multiple";
}

/**
 * Splits a PDF file into multiple PDFs based on specified pages
 */
export const splitPdf = async (
  pdfFile: File,
  options: SplitPdfOptions = {}
): Promise<File[]> => {
  const { pages = "all", outputType = "multiple" } = options;

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const numPages = pdfDoc.getPageCount();

  const pagesToExtract =
    pages === "all"
      ? Array.from({ length: numPages }, (_, i) => i)
      : pages.filter((p) => p > 0 && p <= numPages).map((p) => p - 1);

  if (pagesToExtract.length === 0) {
    throw new Error("No valid pages to extract");
  }

  const baseName = pdfFile.name.replace(/\.pdf$/i, "");

  if (outputType === "single") {
    const newPdf = await PDFDocument.create();
    const copied = await newPdf.copyPages(pdfDoc, pagesToExtract);
    copied.forEach((page) => newPdf.addPage(page));
    const newPdfBytes = await newPdf.save();
    return [makePdfFile(newPdfBytes, `${baseName}_extracted.pdf`)];
  }

  const outputFiles: File[] = [];
  for (const pageIndex of pagesToExtract) {
    const newPdf = await PDFDocument.create();
    const [page] = await newPdf.copyPages(pdfDoc, [pageIndex]);
    newPdf.addPage(page);
    const newPdfBytes = await newPdf.save();
    outputFiles.push(makePdfFile(newPdfBytes, `${baseName}_page_${pageIndex + 1}.pdf`));
  }

  return outputFiles;
};

export interface SignaturePlacement {
  pageNumber: number; // 1-based
  /** all values are ratios (0-1) of the rendered page box */
  xRatio: number;
  yRatio: number;
  widthRatio: number;
  heightRatio: number;
  dataUrl: string; // PNG data URL
}

/**
 * Stamps one or more signature images onto a PDF.
 */
export const signPdf = async (
  pdfFile: File,
  placements: SignaturePlacement[]
): Promise<File> => {
  if (placements.length === 0) throw new Error("No signatures placed");

  const pdfDoc = await PDFDocument.load(await pdfFile.arrayBuffer(), { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  for (const placement of placements) {
    const page = pages[placement.pageNumber - 1];
    if (!page) continue;
    const { width, height } = page.getSize();
    const png = await pdfDoc.embedPng(placement.dataUrl);
    const drawWidth = placement.widthRatio * width;
    const drawHeight = placement.heightRatio * height;
    page.drawImage(png, {
      x: placement.xRatio * width,
      y: height - placement.yRatio * height - drawHeight,
      width: drawWidth,
      height: drawHeight,
    });
  }

  const bytes = await pdfDoc.save();
  return makePdfFile(bytes, pdfFile.name.replace(/\.pdf$/i, "") + "_signed.pdf");
};
