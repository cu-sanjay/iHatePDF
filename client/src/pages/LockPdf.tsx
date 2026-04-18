import { useState, useCallback } from "react";
import FileUpload from "@/components/FileUpload";
import FilePreview from "@/components/FilePreview";
import { ShieldCheck, Download, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { generateFilePreview, downloadFile } from "@/lib/fileUtils";
import { protectPdf } from "@/lib/pdfUtils";

const LockPdf = () => {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string>("");
  const [protectionText, setProtectionText] = useState("CONFIDENTIAL");
  const [addOverlay, setAddOverlay] = useState(true);
  const [clearMetadata, setClearMetadata] = useState(true);
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
    if (!pdfFile) return;
    setIsProcessing(true);
    setProgress(0);

    try {
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + 15, 85));
      }, 150);

      const result = await protectPdf(pdfFile, {
        watermarkText: addOverlay ? protectionText : undefined,
        removeMetadata: clearMetadata,
      });

      clearInterval(interval);
      setProgress(100);
      setResultFile(result);
      toast({ title: "PDF protected", description: "Protection applied successfully." });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Failed", description: "Could not protect this PDF. Try a different file." });
    } finally {
      setIsProcessing(false);
    }
  }, [pdfFile, protectionText, addOverlay, clearMetadata, toast]);

  const handleDownload = useCallback(() => {
    if (resultFile) downloadFile(resultFile, resultFile.name, "application/pdf");
  }, [resultFile]);

  return (
    <section className="py-10 bg-[#F5F5F5] min-h-[60vh]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-0.5 bg-[#E63228]" />
            <span className="text-[#E63228] text-xs font-semibold uppercase tracking-widest">Security</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] font-heading">Protect PDF</h1>
          <p className="text-[#666] text-sm mt-1">Add visual protection overlays and strip document metadata</p>
        </div>

        <div className="max-w-2xl space-y-3">
          <div className="bg-[#FFF8F5] border border-[#E63228]/30 p-4 flex gap-3">
            <Info size={15} className="text-[#E63228] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#555] leading-relaxed">
              <strong className="text-[#0A0A0A]">Note on encryption:</strong> True PDF password protection requires server-side processing due to browser limitations. This tool adds strong visual protection watermarks and strips document metadata to remove author/creation info.
            </p>
          </div>

          <div className="bg-white border border-[#E0E0E0]">
            <div className="p-6">
              {!pdfFile ? (
                <FileUpload
                  accept=".pdf,application/pdf"
                  maxSizeInMB={100}
                  multiple={false}
                  onFilesSelected={handlePdfSelected}
                  title="Upload PDF to Protect"
                  description="Drag & drop or click to browse"
                  buttonText="Select PDF"
                  icon={<ShieldCheck size={36} />}
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
                      <h4 className="text-sm font-semibold text-[#0A0A0A] mb-4 uppercase tracking-wide">Protection Options</h4>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="add-overlay"
                            checked={addOverlay}
                            onCheckedChange={(c) => setAddOverlay(c as boolean)}
                            className="mt-0.5 border-[#D0D0D0] data-[state=checked]:bg-[#E63228] data-[state=checked]:border-[#E63228]"
                          />
                          <div>
                            <Label htmlFor="add-overlay" className="text-sm font-medium text-[#0A0A0A] cursor-pointer">
                              Add visual protection watermark
                            </Label>
                            <p className="text-xs text-[#888] mt-0.5">Adds a diagonal overlay to every page marking it as protected</p>
                          </div>
                        </div>

                        {addOverlay && (
                          <div className="ml-7">
                            <Label htmlFor="prot-text" className="text-xs font-semibold text-[#555] uppercase tracking-wide">Protection Label</Label>
                            <Input
                              id="prot-text"
                              value={protectionText}
                              onChange={(e) => setProtectionText(e.target.value)}
                              placeholder="e.g. CONFIDENTIAL, DO NOT COPY"
                              className="mt-1 border-[#D0D0D0] focus:border-[#E63228] focus:ring-0"
                            />
                          </div>
                        )}

                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="clear-meta"
                            checked={clearMetadata}
                            onCheckedChange={(c) => setClearMetadata(c as boolean)}
                            className="mt-0.5 border-[#D0D0D0] data-[state=checked]:bg-[#E63228] data-[state=checked]:border-[#E63228]"
                          />
                          <div>
                            <Label htmlFor="clear-meta" className="text-sm font-medium text-[#0A0A0A] cursor-pointer">
                              Strip document metadata
                            </Label>
                            <p className="text-xs text-[#888] mt-0.5">Removes author, title, creation date, and producer info</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="mb-5">
                      <div className="flex justify-between text-xs text-[#888] mb-1">
                        <span>Applying protection...</span>
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
                        <span><strong>Protected.</strong> Watermark and metadata removal applied.</span>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    {!resultFile && !isProcessing && (
                      <Button
                        onClick={handleProcess}
                        className="bg-[#E63228] text-white hover:bg-[#c4231a] rounded-none font-semibold"
                      >
                        <ShieldCheck size={15} className="mr-2" /> Protect PDF
                      </Button>
                    )}
                    {resultFile && (
                      <Button
                        onClick={handleDownload}
                        className="bg-[#E63228] text-white hover:bg-[#c4231a] rounded-none font-semibold"
                      >
                        <Download size={15} className="mr-2" /> Download Protected PDF
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="border-[#D0D0D0] text-[#0A0A0A] hover:bg-[#F5F5F5] rounded-none"
                    >
                      {resultFile ? "Protect Another" : "Reset"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LockPdf;
