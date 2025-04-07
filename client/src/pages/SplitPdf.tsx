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

  // Handle PDF file selection
  const handlePdfSelected = useCallback(async (files: File[]) => {
    if (files.length > 0 && files[0].type === 'application/pdf') {
      setPdfFile(files[0]);
      try {
        const previewUrl = await generateFilePreview(files[0]);
        setPdfPreviewUrl(previewUrl);
        setShowOptions(true);
        setIsSplitting(false);
        setProgress(0);
        setSplitPdfs([]);
        
        // Count PDF pages (this would be a real implementation using PDF.js)
        // For now, we'll mock it with a random number between 5-20 for demo purposes
        const pageCount = Math.floor(Math.random() * 16) + 5;
        setTotalPages(pageCount);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Preview generation failed",
          description: "Could not generate a preview for this PDF.",
        });
      }
    }
  }, [toast]);

  // Reset the splitter state
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

  // Parse page range string into array of page numbers
  const parsePageRange = useCallback((rangeStr: string, totalPages: number): number[] => {
    const pages: number[] = [];
    const ranges = rangeStr.split(',');
    
    for (const range of ranges) {
      const trimmedRange = range.trim();
      if (trimmedRange.includes('-')) {
        // Handle range like "1-3"
        const [start, end] = trimmedRange.split('-').map(num => parseInt(num.trim(), 10));
        if (!isNaN(start) && !isNaN(end) && start <= end && start > 0 && end <= totalPages) {
          for (let i = start; i <= end; i++) {
            if (!pages.includes(i)) {
              pages.push(i);
            }
          }
        }
      } else {
        // Handle single page
        const page = parseInt(trimmedRange, 10);
        if (!isNaN(page) && page > 0 && page <= totalPages && !pages.includes(page)) {
          pages.push(page);
        }
      }
    }
    
    return pages.sort((a, b) => a - b);
  }, []);

  // Split PDF
  const handleSplitPdf = useCallback(async () => {
    if (!pdfFile) return;

    setIsSplitting(true);
    setProgress(0);

    try {
      // Determine pages to extract
      let pagesToExtract: number[] | "all" = "all";
      
      if (pageRange === 'custom' && customRange.trim()) {
        const parsedPages = parsePageRange(customRange, totalPages);
        
        if (parsedPages.length === 0) {
          toast({
            variant: "destructive",
            title: "Invalid page range",
            description: `Please enter valid page numbers between 1 and ${totalPages}.`,
          });
          setIsSplitting(false);
          return;
        }
        
        pagesToExtract = parsedPages;
      }

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prevProgress => {
          const newProgress = prevProgress + Math.random() * 10;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 200);

      // Split the PDF
      const splitFiles = await splitPdf(pdfFile, {
        pages: pagesToExtract,
        outputType: splitMode
      });

      clearInterval(progressInterval);
      setProgress(100);
      setSplitPdfs(splitFiles);

      toast({
        title: "Split complete",
        description: `Successfully created ${splitFiles.length} PDF ${splitFiles.length === 1 ? 'file' : 'files'}`,
      });
    } catch (error) {
      console.error("PDF split error:", error);
      setIsSplitting(false);
      
      toast({
        variant: "destructive",
        title: "Split failed",
        description: "An error occurred during the splitting process. Please try again.",
      });
    }
  }, [pdfFile, splitMode, pageRange, customRange, totalPages, parsePageRange, toast]);

  // Download a split PDF
  const handleDownloadPdf = useCallback((index: number) => {
    if (splitPdfs[index]) {
      const file = splitPdfs[index];
      downloadFile(file, file.name, "application/pdf");
    }
  }, [splitPdfs]);

  // Download all split PDFs as a ZIP file
  const handleDownloadAll = useCallback(async () => {
    if (splitPdfs.length === 0) return;
    
    try {
      // Use JSZip to create a zip file of all PDFs
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // Add all PDFs to the zip
      for (const pdfFile of splitPdfs) {
        const arrayBuffer = await pdfFile.arrayBuffer();
        zip.file(pdfFile.name, arrayBuffer);
      }
      
      // Generate the zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Download the zip file
      const zipFileName = pdfFile ? `${pdfFile.name.replace('.pdf', '')}_split.zip` : 'split_pdfs.zip';
      downloadFile(zipBlob, zipFileName, 'application/zip');
      
      toast({
        title: "Download started",
        description: "Your PDFs have been packaged and download has started",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "An error occurred while preparing the download",
      });
    }
  }, [splitPdfs, pdfFile, toast]);

  // Create another split
  const handleSplitAnother = useCallback(() => {
    handleReset();
  }, [handleReset]);

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-heading text-gray-900 mb-4 dark:text-white">
            Split PDF Files
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
            Extract pages or split PDF documents into multiple files as needed
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-800 dark:border dark:border-gray-700">
          <div className="p-8">
            {!pdfFile ? (
              <FileUpload
                accept=".pdf,application/pdf"
                maxSizeInMB={100}
                multiple={false}
                onFilesSelected={handlePdfSelected}
                title="Upload PDF to Split"
                description="Drag & drop your PDF here or click to browse"
                buttonText="Select PDF"
                colorScheme="indigo"
                icon={<Scissors size={40} />}
                className="mb-8"
              />
            ) : (
              <>
                <FilePreview
                  files={[pdfFile]}
                  fileType="pdf"
                  previewUrls={pdfPreviewUrl ? [pdfPreviewUrl] : []}
                  onRemoveAll={handleReset}
                  className="mb-8"
                />

                {showOptions && splitPdfs.length === 0 && !isSplitting && (
                  <div className="border border-gray-200 rounded-lg p-6 mb-8 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 dark:text-gray-100">Split Options</h4>

                    <div className="mb-6">
                      <Label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">Output Type</Label>
                      <RadioGroup value={splitMode} onValueChange={(value: "single" | "multiple") => setSplitMode(value)} className="flex flex-col space-y-2">
                        <div className="flex items-center">
                          <RadioGroupItem value="multiple" id="split-multiple" />
                          <Label htmlFor="split-multiple" className="ml-2">
                            Split into multiple files (one PDF per page)
                          </Label>
                        </div>
                        <div className="flex items-center">
                          <RadioGroupItem value="single" id="split-single" />
                          <Label htmlFor="split-single" className="ml-2">
                            Extract pages into a single PDF
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-200">Page Range</Label>
                      <div className="flex items-center space-x-6 mb-2">
                        <div className="flex items-center">
                          <RadioGroupItem 
                            value="all" 
                            id="all-pages" 
                            checked={pageRange === "all"} 
                            onCheckedChange={(checked) => checked && setPageRange("all")} 
                          />
                          <Label htmlFor="all-pages" className="ml-2">All Pages ({totalPages} pages)</Label>
                        </div>
                        <div className="flex items-center">
                          <RadioGroupItem 
                            value="custom" 
                            id="custom-range" 
                            checked={pageRange === "custom"} 
                            onCheckedChange={(checked) => checked && setPageRange("custom")} 
                          />
                          <Label htmlFor="custom-range" className="ml-2">Custom Range</Label>
                        </div>
                      </div>
                      
                      {pageRange === 'custom' && (
                        <div className="mt-2">
                          <Input
                            type="text"
                            placeholder="e.g., 1-3, 5, 7-9"
                            value={customRange}
                            onChange={(e) => setCustomRange(e.target.value)}
                          />
                          <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                            Separate with commas or hyphens (e.g., 1-3, 5, 7-9)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {isSplitting && (
                  <div className="mt-8 mb-8">
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Splitting PDF...</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2.5" />
                  </div>
                )}

                {splitPdfs.length > 0 && (
                  <div className="mt-8">
                    <Alert className="bg-green-50 border-green-200 mb-6 dark:bg-green-900/30 dark:border-green-800">
                      <AlertDescription className="flex items-start text-green-800 dark:text-green-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 flex-shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <div>
                          <p className="font-medium">Split Complete!</p>
                          <p className="text-sm">Your PDF has been successfully split into {splitPdfs.length} {splitPdfs.length === 1 ? 'file' : 'files'}.</p>
                        </div>
                      </AlertDescription>
                    </Alert>

                    <div className="border border-gray-200 rounded-lg mb-6 dark:border-gray-700">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center dark:bg-gray-700 dark:border-gray-600">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200">Split PDF Files</h4>
                        {splitPdfs.length > 1 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleDownloadAll}
                            className="text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                          >
                            <Download size={14} className="mr-1" /> Download All
                          </Button>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                          {splitPdfs.map((file, index) => (
                            <div key={`${file.name}-${index}`} className="py-3 flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-10 h-12 flex items-center justify-center mr-3">
                                  <FileText size={24} className="text-indigo-500" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800 text-sm dark:text-gray-200">{file.name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {(file.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDownloadPdf(index)} 
                                className="text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                              >
                                <Download size={14} className="mr-1" /> Download
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        onClick={handleSplitAnother}
                      >
                        Split Another PDF
                      </Button>
                    </div>
                  </div>
                )}

                {showOptions && splitPdfs.length === 0 && !isSplitting && (
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button
                      onClick={handleSplitPdf}
                      disabled={!pdfFile}
                      className="bg-indigo-500 text-white hover:bg-indigo-600"
                    >
                      Split PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      disabled={!pdfFile}
                    >
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
