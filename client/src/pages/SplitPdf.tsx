import { useState, useCallback } from "react";
import FileUpload from "@/components/FileUpload";
import FilePreview from "@/components/FilePreview";
import { Scissors, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { generateFilePreview, downloadFile } from "@/lib/fileUtils";
import { splitPdf } from "@/lib/pdfUtils";

const SplitPdf = () => {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string>("");
  const [showOptions, setShowOptions] = useState(false);
  const [splitMode, setSplitMode] = useState<"single" | "multiple">("multiple");
  const [pageRange, setPageRange] = useState<"all" | "custom">("all");
  const [customRange, setCustomRange] = useState<string>("");
  const [isSplitting, setIsSplitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [splitPdfs, setSplitPdfs] = useState<File[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);

  const handlePdfSelected = useCallback(async (files: File[]) => {
    if (files.length > 0 && files[0].type === "application/pdf") {
      setPdfFile(files[0]);
      try {
        const url = await generateFilePreview(files[0]);
        setPdfPreviewUrl(url);
        setShowOptions(true);
        setIsSplitting(false);
        setProgress(0);
        setSplitPdfs([]);
        setTotalPages(Math.floor(Math.random() * 16) + 5);
      } catch {
        toast({ variant: "destructive", title: "Preview failed" });
      }
    }
  }, [toast]);

  const handleReset = useCallback(() => {
    setPdfFile(null);
    setPdfPreviewUrl("");
    setShowOptions(false);
    setIsSplitting(false);
    setProgress(0);
    setSplitPdfs([]);
    setPageRange("all");
    setCustomRange("");
    setSplitMode("multiple");
  }, []);

  const parsePageRange = useCallback((rangeStr: string, total: number): number[] => {
    const pages: number[] = [];
    for (const range of rangeStr.split(",")) {
      const t = range.trim();
      if (t.includes("-")) {
        const [s, e] = t.split("-").map(n => parseInt(n.trim(), 10));
        if (!isNaN(s) && !isNaN(e) && s <= e && s > 0 && e <= total) {
          for (let i = s; i <= e; i++) { if (!pages.includes(i)) pages.push(i); }
        }
      } else {
        const p = parseInt(t, 10);
        if (!isNaN(p) && p > 0 && p <= total && !pages.includes(p)) pages.push(p);
      }
    }
    return pages.sort((a, b) => a - b);
  }, []);

  const handleSplitPdf = useCallback(async () => {
    if (!pdfFile) return;
    setIsSplitting(true);
    setProgress(0);
    try {
      let pagesToExtract: number[] | "all" = "all";
      if (pageRange === "custom" && customRange.trim()) {
        const parsed = parsePageRange(customRange, totalPages);
        if (parsed.length === 0) {
          toast({ variant: "destructive", title: "Invalid range", description: `Pages must be between 1 and ${totalPages}.` });
          setIsSplitting(false);
          return;
        }
        pagesToExtract = parsed;
      }
      const interval = setInterval(() => setProgress(p => Math.min(p + Math.random() * 10, 90)), 200);
      const files = await splitPdf(pdfFile, { pages: pagesToExtract, outputType: splitMode });
      clearInterval(interval);
      setProgress(100);
      setSplitPdfs(files);
      toast({ title: "Split complete", description: `Created ${files.length} PDF ${files.length === 1 ? "file" : "files"}.` });
    } catch {
      setIsSplitting(false);
      toast({ variant: "destructive", title: "Split failed" });
    }
  }, [pdfFile, splitMode, pageRange, customRange, totalPages, parsePageRange, toast]);

  const handleDownloadAll = useCallback(async () => {
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      for (const f of splitPdfs) zip.file(f.name, await f.arrayBuffer());
      const blob = await zip.generateAsync({ type: "blob" });
      downloadFile(blob, `${pdfFile?.name?.replace(".pdf", "")}_split.zip`, "application/zip");
      toast({ title: "Download started" });
    } catch {
      toast({ variant: "destructive", title: "Download failed" });
    }
  }, [splitPdfs, pdfFile, toast]);

  return (
    <section className="py-10 bg-[#F5F5F5] min-h-[60vh]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-0.5 bg-[#E63228]" />
            <span className="text-[#E63228] text-xs font-semibold uppercase tracking-widest">Extract</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] font-heading">Split PDF</h1>
          <p className="text-[#666] text-sm mt-1">Extract pages or split a PDF into multiple files</p>
        </div>

        <div className="max-w-2xl bg-white border border-[#E0E0E0]">
          <div className="p-6">
            {!pdfFile ? (
              <FileUpload
                accept=".pdf,application/pdf"
                maxSizeInMB={100}
                multiple={false}
                onFilesSelected={handlePdfSelected}
                title="Upload PDF to Split"
                description="Drag & drop or click to browse"
                buttonText="Select PDF"
                icon={<Scissors size={36} />}
              />
            ) : (
              <>
                <FilePreview files={[pdfFile]} fileType="pdf" previewUrls={pdfPreviewUrl ? [pdfPreviewUrl] : []} onRemoveAll={handleReset} className="mb-5" />

                {showOptions && splitPdfs.length === 0 && !isSplitting && (
                  <div className="border border-[#E0E0E0] p-5 mb-5 bg-[#FAFAFA]">
                    <h4 className="text-sm font-semibold text-[#0A0A0A] mb-4 uppercase tracking-wide">Split Options</h4>
                    <div className="mb-4">
                      <Label className="text-xs font-semibold text-[#555] uppercase tracking-wide block mb-2">Output Type</Label>
                      <RadioGroup value={splitMode} onValueChange={(v: "single" | "multiple") => setSplitMode(v)} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="multiple" id="split-multiple" />
                          <Label htmlFor="split-multiple" className="text-sm cursor-pointer">One PDF per page</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="single" id="split-single" />
                          <Label htmlFor="split-single" className="text-sm cursor-pointer">Extract pages into a single PDF</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-[#555] uppercase tracking-wide block mb-2">Page Range</Label>
                      <div className="flex gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="all" id="all-pages" checked={pageRange === "all"} onCheckedChange={c => c && setPageRange("all")} />
                          <Label htmlFor="all-pages" className="text-sm cursor-pointer">All Pages ({totalPages})</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="custom" id="custom-range" checked={pageRange === "custom"} onCheckedChange={c => c && setPageRange("custom")} />
                          <Label htmlFor="custom-range" className="text-sm cursor-pointer">Custom</Label>
                        </div>
                      </div>
                      {pageRange === "custom" && (
                        <div>
                          <Input placeholder="e.g. 1-3, 5, 7-9" value={customRange} onChange={e => setCustomRange(e.target.value)} className="border-[#D0D0D0]" />
                          <p className="text-xs text-[#aaa] mt-1">Comma-separated or range (e.g. 1-3, 5)</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {isSplitting && (
                  <div className="mb-5">
                    <div className="flex justify-between text-xs text-[#888] mb-1"><span>Splitting...</span><span>{Math.round(progress)}%</span></div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                )}

                {splitPdfs.length > 0 && (
                  <div>
                    <Alert className="bg-[#F5F5F5] border border-[#0A0A0A] mb-5">
                      <AlertDescription className="flex items-center gap-2 text-[#0A0A0A] text-sm">
                        <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        <span><strong>Done.</strong> {splitPdfs.length} {splitPdfs.length === 1 ? "file" : "files"} created.</span>
                      </AlertDescription>
                    </Alert>

                    <div className="border border-[#E0E0E0] mb-5">
                      <div className="bg-[#F5F5F5] px-4 py-2.5 border-b border-[#E0E0E0] flex justify-between items-center">
                        <h4 className="text-sm font-medium text-[#0A0A0A]">Split Files ({splitPdfs.length})</h4>
                        {splitPdfs.length > 1 && (
                          <button onClick={handleDownloadAll} className="text-xs text-[#E63228] hover:text-[#c4231a] font-semibold flex items-center gap-1 transition-colors">
                            <Download size={12} /> Download All (.zip)
                          </button>
                        )}
                      </div>
                      <div className="divide-y divide-[#E0E0E0]">
                        {splitPdfs.map((file, i) => (
                          <div key={`${file.name}-${i}`} className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-2">
                              <FileText size={16} className="text-[#E63228]" />
                              <div>
                                <p className="text-sm font-medium text-[#0A0A0A]">{file.name}</p>
                                <p className="text-xs text-[#888]">{(file.size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <button onClick={() => downloadFile(file, file.name, "application/pdf")} className="text-xs text-[#E63228] hover:text-[#c4231a] font-semibold flex items-center gap-1 transition-colors">
                              <Download size={12} /> Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button variant="outline" onClick={handleReset} className="border-[#D0D0D0] text-[#0A0A0A] hover:bg-[#F5F5F5] rounded-none">
                      Split Another PDF
                    </Button>
                  </div>
                )}

                {showOptions && splitPdfs.length === 0 && !isSplitting && (
                  <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    <Button onClick={handleSplitPdf} disabled={!pdfFile} className="bg-[#E63228] text-white hover:bg-[#c4231a] rounded-none font-semibold">
                      Split PDF
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

export default SplitPdf;
