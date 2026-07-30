import { useState, useCallback } from "react";
import FileUpload from "@/components/FileUpload";
import FilePreview from "@/components/FilePreview";
import { FileDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { generateFilePreview, downloadFile, formatFileSize } from "@/lib/fileUtils";
import { compressPdf } from "@/lib/pdfUtils";

const CompressPdf = () => {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string>("");
  const [showOptions, setShowOptions] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<"low" | "medium" | "high">("medium");
  const [compressImages, setCompressImages] = useState(true);
  const [removeMetadata, setRemoveMetadata] = useState(false);
  const [optimizeFonts, setOptimizeFonts] = useState(true);
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressedPdf, setCompressedPdf] = useState<{ file: File; originalSize: string; compressedSize: string; savingsPercent: number } | null>(null);

  const handlePdfSelected = useCallback(async (files: File[]) => {
    if (files.length > 0 && files[0].type === "application/pdf") {
      setPdfFile(files[0]);
      try {
        const url = await generateFilePreview(files[0]);
        setPdfPreviewUrl(url);
        setShowOptions(true);
        setIsCompressing(false);
        setProgress(0);
        setCompressedPdf(null);
      } catch {
        toast({ variant: "destructive", title: "Preview failed" });
      }
    }
  }, [toast]);

  const handleReset = useCallback(() => {
    setPdfFile(null);
    setPdfPreviewUrl("");
    setShowOptions(false);
    setIsCompressing(false);
    setProgress(0);
    setCompressedPdf(null);
    setCompressionLevel("medium");
    setCompressImages(true);
    setRemoveMetadata(false);
    setOptimizeFonts(true);
  }, []);

  const handleCompress = useCallback(async () => {
    if (!pdfFile) return;
    setIsCompressing(true);
    setProgress(0);
    try {
      const interval = setInterval(() => setProgress(p => Math.min(p + Math.random() * 5, 90)), 200);
      const compressed = await compressPdf(pdfFile, { quality: compressionLevel, removeMetadata });
      clearInterval(interval);
      setProgress(100);
      const savings = Math.round((1 - compressed.size / pdfFile.size) * 100);
      setCompressedPdf({ file: compressed, originalSize: formatFileSize(pdfFile.size), compressedSize: formatFileSize(compressed.size), savingsPercent: savings });
      toast({ title: "Compression complete", description: `Reduced by ${savings}%` });
    } catch {
      setIsCompressing(false);
      toast({ variant: "destructive", title: "Compression failed" });
    }
  }, [pdfFile, compressionLevel, compressImages, removeMetadata, toast]);

  const compressionOptions = [
    { value: "low", label: "Low", desc: "High quality, minimal compression" },
    { value: "medium", label: "Medium", desc: "Balanced quality and size" },
    { value: "high", label: "High", desc: "Smaller file, lower quality" },
  ] as const;

  return (
    <section className="py-10 bg-[#F5F5F5] min-h-[60vh]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-0.5 bg-[#E63228]" />
            <span className="text-[#E63228] text-xs font-semibold uppercase tracking-widest">Optimize</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] font-heading">Compress PDF</h1>
          <p className="text-[#666] text-sm mt-1">Reduce PDF file size while preserving readability</p>
        </div>

        <div className="max-w-2xl bg-white border border-[#E0E0E0]">
          <div className="p-6">
            {!pdfFile ? (
              <FileUpload
                accept=".pdf,application/pdf"
                maxSizeInMB={100}
                multiple={false}
                onFilesSelected={handlePdfSelected}
                title="Upload PDF to Compress"
                description="Drag & drop or click to browse"
                buttonText="Select PDF"
                icon={<FileDown size={36} />}
              />
            ) : (
              <>
                <FilePreview files={[pdfFile]} fileType="pdf" previewUrls={pdfPreviewUrl ? [pdfPreviewUrl] : []} onRemoveAll={handleReset} className="mb-5" />

                {showOptions && !compressedPdf && !isCompressing && (
                  <div className="border border-[#E0E0E0] p-5 mb-5 bg-[#FAFAFA]">
                    <h4 className="text-sm font-semibold text-[#0A0A0A] mb-4 uppercase tracking-wide">Compression Options</h4>
                    <div className="mb-5">
                      <Label className="text-xs font-semibold text-[#555] uppercase tracking-wide block mb-3">Compression Level</Label>
                      <RadioGroup value={compressionLevel} onValueChange={(v: "low" | "medium" | "high") => setCompressionLevel(v)} className="grid grid-cols-3 gap-3">
                        {compressionOptions.map(opt => (
                          <div key={opt.value}>
                            <RadioGroupItem value={opt.value} id={`${opt.value}-compression`} className="peer hidden" />
                            <Label
                              htmlFor={`${opt.value}-compression`}
                              className={`border p-3 text-center block cursor-pointer transition-colors text-sm ${
                                compressionLevel === opt.value
                                  ? "border-[#E63228] bg-[#FFF5F5] text-[#E63228]"
                                  : "border-[#E0E0E0] bg-white text-[#555] hover:border-[#E63228] hover:bg-[#FFF8F8]"
                              }`}
                            >
                              <div className="font-semibold mb-0.5">{opt.label}</div>
                              <div className="text-[10px] leading-tight opacity-75">{opt.desc}</div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-xs font-semibold text-[#555] uppercase tracking-wide block mb-2">Advanced</Label>
                      {[
                        { id: "compress-images", state: compressImages, setter: setCompressImages, label: "Compress embedded images" },
                        { id: "remove-metadata", state: removeMetadata, setter: setRemoveMetadata, label: "Remove document metadata" },
                        { id: "optimize-fonts", state: optimizeFonts, setter: setOptimizeFonts, label: "Optimize fonts" },
                      ].map(item => (
                        <div key={item.id} className="flex items-center gap-2">
                          <Checkbox
                            id={item.id}
                            checked={item.state}
                            onCheckedChange={v => item.setter(v as boolean)}
                            className="border-[#D0D0D0] data-[state=checked]:bg-[#E63228] data-[state=checked]:border-[#E63228]"
                          />
                          <Label htmlFor={item.id} className="text-sm text-[#555] cursor-pointer">{item.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isCompressing && !compressedPdf && (
                  <div className="mb-5">
                    <div className="flex justify-between text-xs text-[#888] mb-1"><span>Compressing...</span><span>{Math.round(progress)}%</span></div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                )}

                {compressedPdf && (
                  <div>
                    <Alert className="bg-[#F5F5F5] border border-[#0A0A0A] mb-5">
                      <AlertDescription className="flex items-center gap-2 text-[#0A0A0A] text-sm">
                        <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        <span><strong>Done.</strong> Reduced by {compressedPdf.savingsPercent}%</span>
                      </AlertDescription>
                    </Alert>

                    <div className="border border-[#E0E0E0] mb-5 grid grid-cols-2 gap-px bg-[#E0E0E0]">
                      <div className="bg-[#FAFAFA] p-4 text-center">
                        <div className="text-xs text-[#888] uppercase tracking-wide mb-1">Original</div>
                        <div className="text-xl font-bold text-[#0A0A0A]">{compressedPdf.originalSize}</div>
                      </div>
                      <div className="bg-[#F5F5F5] p-4 text-center">
                        <div className="text-xs text-[#888] uppercase tracking-wide mb-1">Compressed</div>
                        <div className="text-xl font-bold text-[#E63228]">{compressedPdf.compressedSize}</div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button onClick={() => downloadFile(compressedPdf.file, compressedPdf.file.name, "application/pdf")} className="bg-[#E63228] text-white hover:bg-[#c4231a] rounded-none font-semibold">
                        <Download size={15} className="mr-2" /> Download Compressed
                      </Button>
                      <Button variant="outline" onClick={handleReset} className="border-[#D0D0D0] text-[#0A0A0A] hover:bg-[#F5F5F5] rounded-none">
                        Compress Another
                      </Button>
                    </div>
                  </div>
                )}

                {showOptions && !compressedPdf && !isCompressing && (
                  <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    <Button onClick={handleCompress} disabled={!pdfFile} className="bg-[#E63228] text-white hover:bg-[#c4231a] rounded-none font-semibold">
                      Compress PDF
                    </Button>
                    <Button variant="outline" onClick={handleReset} className="border-[#D0D0D0] text-[#0A0A0A] hover:bg-[#F5F5F5] rounded-none">
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

export default CompressPdf;
