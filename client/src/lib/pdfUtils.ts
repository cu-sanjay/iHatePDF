import * as pdfjs from "pdfjs-dist";
import { PDFDocument, StandardFonts, rgb, degrees, grayscale } from "pdf-lib";
import { createFile, downloadFile } from "./fileUtils";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PdfToImageOptions {
  format?: "jpg" | "png" | "webp";
  quality?: number;
  scale?: number;
  pages?: number[] | "all";
}

/**
 * Converts a PDF file to an array of image files
 */
export const convertPdfToImages = async (
  pdfFile: File,
  options: PdfToImageOptions = {}
): Promise<File[]> => {
  const { format = "jpg", quality = 0.8, scale = 2, pages = "all" } = options;

  // Load the PDF file
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  // Determine which pages to convert
  const pagesToConvert = pages === "all" 
    ? Array.from({ length: numPages }, (_, i) => i + 1)
    : pages.filter(p => p > 0 && p <= numPages);

  if (pagesToConvert.length === 0) {
    throw new Error("No valid pages to convert");
  }

  // Convert each page
  const imageFiles: File[] = [];
  const mimeTypes = {
    jpg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };
  const mimeType = mimeTypes[format];

  for (const pageNum of pagesToConvert) {
    // Get the page
    const page = await pdf.getPage(pageNum);
    
    // Set up canvas for rendering
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    
    if (!context) {
      throw new Error("Could not create canvas context");
    }
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    // Render the page to canvas
    await page.render({
      canvasContext: context,
      viewport,
    }).promise;
    
    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), mimeType, quality);
    });
    
    // Create file from blob
    const fileName = `${pdfFile.name.replace(/\.pdf$/i, "")}_page_${pageNum}.${format}`;
    const file = new File([blob], fileName, { type: mimeType });
    
    imageFiles.push(file);
  }

  return imageFiles;
};

interface CompressPdfOptions {
  quality?: "low" | "medium" | "high";
  compressImages?: boolean;
  removeMetadata?: boolean;
}

/**
 * Compresses a PDF file
 */
export const compressPdf = async (
  pdfFile: File,
  options: CompressPdfOptions = {}
): Promise<File> => {
  const { quality = "medium", compressImages = true, removeMetadata = false } = options;
  
  // Quality settings
  const qualitySettings = {
    low: { imageQuality: 0.3, compressFactor: 0.5 },
    medium: { imageQuality: 0.5, compressFactor: 0.7 },
    high: { imageQuality: 0.7, compressFactor: 0.9 },
  };
  
  const { imageQuality } = qualitySettings[quality];
  
  // Load the PDF document
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  
  // Remove metadata if needed
  if (removeMetadata) {
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("");
    pdfDoc.setSubject("");
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer("");
    pdfDoc.setCreator("");
  }
  
  // Compress images if needed
  if (compressImages) {
    // This is a placeholder as pdf-lib doesn't directly support image compression
    // In a real implementation, you would need to extract images, compress them, and replace them
    // This would require additional libraries or a more complex approach
  }
  
  // Save the compressed PDF
  const compressedPdfBytes = await pdfDoc.save();
  
  // Create a new file
  const fileName = pdfFile.name.replace(/\.pdf$/i, "_compressed.pdf");
  return new File([compressedPdfBytes], fileName, { type: "application/pdf" });
};

/**
 * Merges multiple PDF files into a single PDF
 */
export const mergePdfFiles = async (pdfFiles: File[]): Promise<File> => {
  if (pdfFiles.length === 0) {
    throw new Error("No PDF files to merge");
  }
  
  // Create a new PDF document
  const mergedPdf = await PDFDocument.create();
  
  // Add each PDF to the new document
  for (const pdfFile of pdfFiles) {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    
    // Copy pages from the source PDF to the merged PDF
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => {
      mergedPdf.addPage(page);
    });
  }
  
  // Save the merged PDF
  const mergedPdfBytes = await mergedPdf.save();
  
  // Create a new file
  return new File([mergedPdfBytes], "merged.pdf", { type: "application/pdf" });
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
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const x = (width - textWidth * Math.cos(Math.PI / 4)) / 2;
    const y = height / 2 - (fontSize * Math.sin(Math.PI / 4)) / 2;

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.9, 0.1, 0.1),
      opacity,
      rotate: degrees(45),
    });
  }

  const pdfBytes = await pdfDoc.save();
  const outName = pdfFile.name.replace(/\.pdf$/i, "_watermarked.pdf");
  return new File([pdfBytes], outName, { type: "application/pdf" });
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
  const pdfDoc = await PDFDocument.load(arrayBuffer);

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
    const fontSize = 52;

    for (const page of pages) {
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
      const x = (width - textWidth * Math.cos(Math.PI / 4)) / 2;
      const y = height / 2 - (fontSize * Math.sin(Math.PI / 4)) / 2;

      page.drawText(watermarkText, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0.85, 0.1, 0.1),
        opacity: 0.12,
        rotate: degrees(45),
      });

      // Border overlay
      page.drawRectangle({
        x: 8,
        y: 8,
        width: width - 16,
        height: height - 16,
        borderColor: rgb(0.85, 0.1, 0.1),
        borderWidth: 2,
        opacity: 0.3,
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  const outName = pdfFile.name.replace(/\.pdf$/i, "_protected.pdf");
  return new File([pdfBytes], outName, { type: "application/pdf" });
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
  
  // Load the PDF document
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const numPages = pdfDoc.getPageCount();
  
  // Determine which pages to extract
  const pagesToExtract = pages === "all" 
    ? Array.from({ length: numPages }, (_, i) => i)
    : pages.filter(p => p > 0 && p <= numPages).map(p => p - 1);
  
  if (pagesToExtract.length === 0) {
    throw new Error("No valid pages to extract");
  }
  
  // Split into single document with selected pages
  if (outputType === "single") {
    const newPdf = await PDFDocument.create();
    
    for (const pageIndex of pagesToExtract) {
      const [page] = await newPdf.copyPages(pdfDoc, [pageIndex]);
      newPdf.addPage(page);
    }
    
    const newPdfBytes = await newPdf.save();
    const fileName = pdfFile.name.replace(/\.pdf$/i, "_extracted.pdf");
    
    return [new File([newPdfBytes], fileName, { type: "application/pdf" })];
  }
  
  // Split into multiple documents, one per page
  const outputFiles: File[] = [];
  
  for (const pageIndex of pagesToExtract) {
    const newPdf = await PDFDocument.create();
    const [page] = await newPdf.copyPages(pdfDoc, [pageIndex]);
    newPdf.addPage(page);
    
    const newPdfBytes = await newPdf.save();
    const fileName = `${pdfFile.name.replace(/\.pdf$/i, "")}_page_${pageIndex + 1}.pdf`;
    
    outputFiles.push(new File([newPdfBytes], fileName, { type: "application/pdf" }));
  }
  
  return outputFiles;
};
