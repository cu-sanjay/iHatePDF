import { useState, useCallback } from "react";
import BackToTools from "@/components/BackToTools";
import FileUpload from "@/components/FileUpload";
import FilePreview from "@/components/FilePreview";
import { Stamp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { generateFilePreview, downloadFile } from "@/lib/fileUtils";
import { addWatermark } from "@/lib/pdfUtils";

const WatermarkPdf = () => {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string>("");
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(20);
  const [fontSize, setFontSize] = useState(48);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultFile, setResultFile] = useState<File | null>(null);

  const handlePdfSelected = useCallback(async (files: File[]) => {
    if (files.length > 0 && files[0].type === "application/pdf") {
      setPdfFile(files[0]);
      setResultFile(null);
      try {
        const url = await generateFilePreview(files[0]);
        setPdfPreviewUrl(url);
      } catch {
        // preview optional
      }
    }
  }, []);

  const handleReset = useCallback(() => {
    setPdfFile(null);
    setPdfPreviewUrl("");
    setResultFile(null);
    setProgress(0);
  }, []);

  const handleProcess = useCallback(async () => {
    if (!pdfFile || !watermarkText.trim()) return;
    setIsProcessing(true);
    setProgress(0);

    try {
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + 15, 85));
      }, 150);

      const result = await addWatermark(pdfFile, {
        text: watermarkText,
        opacity: opacity / 100,
        fontSize,
      });

      clearInterval(interval);
      setProgress(100);
      setResultFile(result);
      toast({ title: "Watermark added", description: "Your PDF has been watermarked successfully." });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Failed", description: "Could not add watermark. Try a different PDF." });
    } finally {
      setIsProcessing(false);
    }
  }, [pdfFile, watermarkText, opacity, fontSize, toast]);

  const handleDownload = useCallback(() => {
    if (resultFile) downloadFile(resultFile, resultFile.name, "application/pdf");
  }, [resultFile]);

  return (
    <section className="py-10 bg-[#F5F5F5] min-h-[60vh]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <BackToTools />
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-0.5 bg-[#E63228]" />
            <span className="text-[#E63228] text-xs font-semibold uppercase tracking-widest">Annotate</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] font-heading">Watermark PDF</h1>
          <p className="text-[#666] text-sm mt-1">Add diagonal text watermarks to every page of your PDF</p>
        </div>

        <div className="max-w-2xl bg-white/90 backdrop-blur-sm border border-[#E0E0E0] rounded-xl shadow-sm">
          <div className="p-6">
            {!pdfFile ? (
              <FileUpload
                accept=".pdf,application/pdf"
                maxSizeInMB={100}
                multiple={false}
                onFilesSelected={handlePdfSelected}
                title="Upload PDF"
                description="Drag & drop or click to browse"
                buttonText="Select PDF"
                icon={<Stamp size={36} />}
              />
            ) : (
              <>
                <FilePreview
                  files={[pdfFile]}
                  fileType="pdf"
                  previewUrls={pdfPreviewUrl ? [pdfPreviewUrl] : []}
                  onRemoveAll={handleReset}
                />

                {!resultFile && !isProcessing && (
                  <div className="border border-[#E0E0E0] p-5 mb-5 bg-[#FAFAFA]">
                    <h4 className="text-sm font-semibold text-[#0A0A0A] mb-4 uppercase tracking-wide">Watermark Options</h4>
                    <div className="space-y-5">
                      <div>
                        <Label htmlFor="wm-text" className="text-xs font-semibold text-[#555] uppercase tracking-wide">Watermark Text</Label>
                        <Input
                          id="wm-text"
                          value={watermarkText}
                          onChange={(e) => setWatermarkText(e.target.value)}
                          placeholder="e.g. CONFIDENTIAL, DRAFT, SAMPLE"
                          className="mt-1 border-[#D0D0D0] focus:border-[#E63228] focus:ring-0"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label className="text-xs font-semibold text-[#555] uppercase tracking-wide">Opacity</Label>
                          <span className="text-xs text-[#888] font-mono">{opacity}%</span>
                        </div>
                        <Slider
                          min={5}
                          max={60}
                          step={1}
                          value={[opacity]}
                          onValueChange={(v) => setOpacity(v[0])}
                        />
                        <div className="flex justify-between text-[10px] text-[#aaa] mt-1">
                          <span>Subtle (5%)</span>
                          <span>Prominent (60%)</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label className="text-xs font-semibold text-[#555] uppercase tracking-wide">Font Size</Label>
                          <span className="text-xs text-[#888] font-mono">{fontSize}pt</span>
                        </div>
                        <Slider
                          min={20}
                          max={80}
                          step={2}
                          value={[fontSize]}
                          onValueChange={(v) => setFontSize(v[0])}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {isProcessing && (
                  <div className="mb-5">
                    <div className="flex justify-between text-xs text-[#888] mb-1">
                      <span>Adding watermark...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                )}

                {resultFile && (
                  <Alert className="bg-[#F5F5F5] border border-[#0A0A0A] mb-5">
                    <AlertDescription className="flex items-center gap-2 text-[#0A0A0A] text-sm">
                      <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                      <span><strong>Done.</strong> Watermark "{watermarkText}" applied to all pages.</span>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  {!resultFile && !isProcessing && (
                    <Button
                      onClick={handleProcess}
                      disabled={!watermarkText.trim()}
                      className="bg-[#E63228] text-white hover:bg-[#c4231a] rounded-none font-semibold"
                    >
                      <Stamp size={15} className="mr-2" /> Add Watermark
                    </Button>
                  )}
                  {resultFile && (
                    <Button
                      onClick={handleDownload}
                      className="bg-[#E63228] text-white hover:bg-[#c4231a] rounded-none font-semibold"
                    >
                      <Download size={15} className="mr-2" /> Download PDF
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="border-[#D0D0D0] text-[#0A0A0A] hover:bg-[#F5F5F5] rounded-none"
                  >
                    {resultFile ? "Watermark Another" : "Reset"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WatermarkPdf;
