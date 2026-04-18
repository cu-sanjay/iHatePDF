import { useState, useCallback } from "react";
import FileUpload from "@/components/FileUpload";
import FilePreview from "@/components/FilePreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Images } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateFilePreview, downloadFile } from "@/lib/fileUtils";
import { convertImagesToPdf, rotateImage } from "@/lib/imageUtils";

const ImageToPdf = () => {
  const { toast } = useToast();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [pageSize, setPageSize] = useState<"a4" | "letter" | "legal" | "custom">("a4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [quality, setQuality] = useState<number>(80);
  const [customWidth, setCustomWidth] = useState<number>(210);
  const [customHeight, setCustomHeight] = useState<number>(297);
  const [filename, setFilename] = useState<string>("images.pdf");
  const [pdfResult, setPdfResult] = useState<{ file: File; size: string } | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const handleImagesSelected = useCallback(async (files: File[]) => {
    if (files.length > 0) {
      setImageFiles(files);
      try {
        const urls = await Promise.all(files.map(f => generateFilePreview(f)));
        setImagePreviewUrls(urls);
        setShowOptions(true);
      } catch {
        toast({ variant: "destructive", title: "Preview failed" });
      }
    }
  }, [toast]);

  const handleAddMoreImages = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = async (e) => {
      const newFiles = Array.from((e.target as HTMLInputElement).files || []);
      if (newFiles.length > 0) {
        const updated = [...imageFiles, ...newFiles];
        setImageFiles(updated);
        const newUrls = await Promise.all(newFiles.map(f => generateFilePreview(f)));
        setImagePreviewUrls(prev => [...prev, ...newUrls]);
      }
    };
    input.click();
  }, [imageFiles]);

  const handleRemoveImage = useCallback((index: number) => {
    setImageFiles(p => p.filter((_, i) => i !== index));
    setImagePreviewUrls(p => p.filter((_, i) => i !== index));
  }, []);

  const handleClearImages = useCallback(() => {
    setImageFiles([]);
    setImagePreviewUrls([]);
    setShowOptions(false);
    setPdfResult(null);
  }, []);

  const handleRotateImage = useCallback(async (index: number) => {
    try {
      const rotated = await rotateImage(imageFiles[index], 90);
      const newFiles = [...imageFiles];
      newFiles[index] = rotated;
      setImageFiles(newFiles);
      const newUrl = await generateFilePreview(rotated);
      const newUrls = [...imagePreviewUrls];
      newUrls[index] = newUrl;
      setImagePreviewUrls(newUrls);
      toast({ title: "Rotated 90°" });
    } catch {
      toast({ variant: "destructive", title: "Rotation failed" });
    }
  }, [imageFiles, imagePreviewUrls, toast]);

  const handleConvertToPdf = useCallback(async () => {
    if (imageFiles.length === 0) return;
    setIsConverting(true);
    try {
      const pdfFile = await convertImagesToPdf(imageFiles, {
        pageSize, orientation, quality: quality / 100,
        customWidth: pageSize === "custom" ? customWidth : undefined,
        customHeight: pageSize === "custom" ? customHeight : undefined,
        filename: filename || "images.pdf",
      });
      setPdfResult({ file: pdfFile, size: `${(pdfFile.size / 1024 / 1024).toFixed(2)} MB` });
      toast({ title: "PDF created", description: "Your images have been combined into a PDF." });
    } catch {
      toast({ variant: "destructive", title: "Conversion failed" });
    } finally {
      setIsConverting(false);
    }
  }, [imageFiles, pageSize, orientation, quality, customWidth, customHeight, filename, toast]);

  return (
    <section className="py-10 bg-[#F5F5F5] min-h-[60vh]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-0.5 bg-[#E63228]" />
            <span className="text-[#E63228] text-xs font-semibold uppercase tracking-widest">Convert</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] font-heading">Image to PDF</h1>
          <p className="text-[#666] text-sm mt-1">Combine JPG, PNG, or WebP images into a single PDF document</p>
        </div>

        <div className="max-w-2xl bg-white border border-[#E0E0E0]">
          <div className="p-6">
            {imageFiles.length === 0 ? (
              <FileUpload
                accept="image/*"
                maxSizeInMB={50}
                multiple
                onFilesSelected={handleImagesSelected}
                title="Upload Images"
                description="Drag & drop or click to browse"
                buttonText="Select Images"
                icon={<Images size={36} />}
              />
            ) : (
              <>
                <FilePreview
                  files={imageFiles} fileType="image" previewUrls={imagePreviewUrls}
                  onRemove={handleRemoveImage} onRemoveAll={handleClearImages}
                  onRotate={handleRotateImage} onAddMore={handleAddMoreImages}
                  className="mb-5"
                />

                {showOptions && !pdfResult && (
                  <div className="border border-[#E0E0E0] p-5 mb-5 bg-[#FAFAFA]">
                    <h4 className="text-sm font-semibold text-[#0A0A0A] mb-4 uppercase tracking-wide">PDF Options</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="page-size" className="text-xs font-semibold text-[#555] uppercase tracking-wide">Page Size</Label>
                        <Select value={pageSize} onValueChange={(v: "a4" | "letter" | "legal" | "custom") => setPageSize(v)}>
                          <SelectTrigger id="page-size" className="mt-1 border-[#D0D0D0]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="a4">A4</SelectItem>
                            <SelectItem value="letter">Letter</SelectItem>
                            <SelectItem value="legal">Legal</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="orientation" className="text-xs font-semibold text-[#555] uppercase tracking-wide">Orientation</Label>
                        <Select value={orientation} onValueChange={(v: "portrait" | "landscape") => setOrientation(v)}>
                          <SelectTrigger id="orientation" className="mt-1 border-[#D0D0D0]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="portrait">Portrait</SelectItem>
                            <SelectItem value="landscape">Landscape</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {pageSize === "custom" && (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label htmlFor="custom-width" className="text-xs font-semibold text-[#555]">Width (mm)</Label>
                          <Input id="custom-width" type="number" value={customWidth} onChange={e => setCustomWidth(Number(e.target.value))} min={1} className="mt-1 border-[#D0D0D0]" />
                        </div>
                        <div>
                          <Label htmlFor="custom-height" className="text-xs font-semibold text-[#555]">Height (mm)</Label>
                          <Input id="custom-height" type="number" value={customHeight} onChange={e => setCustomHeight(Number(e.target.value))} min={1} className="mt-1 border-[#D0D0D0]" />
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <Label htmlFor="pdf-filename" className="text-xs font-semibold text-[#555] uppercase tracking-wide">Output Filename</Label>
                      <Input id="pdf-filename" placeholder="filename" value={filename.replace(/\.pdf$/, "")} onChange={e => setFilename(`${e.target.value}.pdf`)} className="mt-1 border-[#D0D0D0]" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-xs font-semibold text-[#555] uppercase tracking-wide">Image Quality</Label>
                        <span className="text-xs text-[#888] font-mono">{quality}%</span>
                      </div>
                      <Slider min={1} max={100} step={1} value={[quality]} onValueChange={v => setQuality(v[0])} />
                    </div>
                  </div>
                )}

                {pdfResult && (
                  <div>
                    <Alert className="bg-[#F5F5F5] border border-[#0A0A0A] mb-5">
                      <AlertDescription className="flex items-center gap-2 text-[#0A0A0A] text-sm">
                        <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        <span><strong>PDF created.</strong> {imageFiles.length} {imageFiles.length === 1 ? "page" : "pages"} · {pdfResult.size}</span>
                      </AlertDescription>
                    </Alert>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button onClick={() => downloadFile(pdfResult.file, pdfResult.file.name, "application/pdf")} className="bg-[#E63228] text-white hover:bg-[#c4231a] rounded-none font-semibold">
                        <Download size={15} className="mr-2" /> Download PDF
                      </Button>
                      <Button variant="outline" onClick={handleClearImages} className="border-[#D0D0D0] text-[#0A0A0A] hover:bg-[#F5F5F5] rounded-none">
                        Create Another
                      </Button>
                    </div>
                  </div>
                )}

                {showOptions && !pdfResult && (
                  <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    <Button onClick={handleConvertToPdf} disabled={imageFiles.length === 0 || isConverting} className="bg-[#E63228] text-white hover:bg-[#c4231a] rounded-none font-semibold">
                      {isConverting ? "Converting..." : "Convert to PDF"}
                    </Button>
                    <Button variant="outline" onClick={handleClearImages} className="border-[#D0D0D0] text-[#0A0A0A] hover:bg-[#F5F5F5] rounded-none">
                      Reset
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageToPdf;
