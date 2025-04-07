import { useState, useCallback } from "react";
import FileUpload from "@/components/FileUpload";
import FilePreview from "@/components/FilePreview";
import { Combine, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { generateFilePreview, downloadFile } from "@/lib/fileUtils";
import { mergePdfFiles } from "@/lib/pdfUtils";

const MergePdf = () => {
  const { toast } = useToast();
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [mergedFilename, setMergedFilename] = useState<string>("merged.pdf");
  const [isMerging, setIsMerging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mergedPdf, setMergedPdf] = useState<File | null>(null);
  const [mergedSize, setMergedSize] = useState<string>("");

  // Handle PDF file selection
  const handlePdfsSelected = useCallback(async (files: File[]) => {
    if (files.length > 0) {
      // Filter out non-PDF files
      const pdfFiles = files.filter(file => file.type === 'application/pdf');
      
      if (pdfFiles.length === 0) {
        toast({
          variant: "destructive",
          title: "Invalid files",
          description: "Please select only PDF files.",
        });
        return;
      }
      
      setPdfFiles(pdfFiles);
      setShowOptions(true);
      setMergedPdf(null);
    }
  }, [toast]);

  // Add more PDFs to the existing selection
  const handleAddMorePdfs = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,application/pdf";
    input.multiple = true;
    
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const newFiles = Array.from(target.files).filter(file => file.type === 'application/pdf');
        if (newFiles.length > 0) {
          setPdfFiles(prev => [...prev, ...newFiles]);
        }
      }
    };
    
    input.click();
  }, []);

  // Remove a PDF from the list
  const handleRemovePdf = useCallback((index: number) => {
    setPdfFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Clear all PDFs
  const handleClearPdfs = useCallback(() => {
    setPdfFiles([]);
    setShowOptions(false);
    setMergedPdf(null);
    setMergedFilename("merged.pdf");
  }, []);

  // Merge PDFs
  const handleMergePdfs = useCallback(async () => {
    if (pdfFiles.length < 2) {
      toast({
        variant: "destructive",
        title: "Not enough PDFs",
        description: "You need at least two PDF files to merge.",
      });
      return;
    }

    setIsMerging(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prevProgress => {
          const newProgress = prevProgress + Math.random() * 10;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 200);

      // Merge the PDFs
      const mergedFile = await mergePdfFiles(pdfFiles);
      
      // Rename the merged file if a custom name was provided
      if (mergedFilename && mergedFilename !== "merged.pdf") {
        const nameWithExtension = mergedFilename.endsWith('.pdf') ? mergedFilename : `${mergedFilename}.pdf`;
        const renamedFile = new File([mergedFile], nameWithExtension, { type: "application/pdf" });
        setMergedPdf(renamedFile);
      } else {
        setMergedPdf(mergedFile);
      }

      setMergedSize(`${(mergedFile.size / 1024 / 1024).toFixed(2)} MB`);
      
      clearInterval(progressInterval);
      setProgress(100);

      toast({
        title: "Merge complete",
        description: `Successfully merged ${pdfFiles.length} PDF files`,
      });
    } catch (error) {
      console.error("PDF merge error:", error);
      toast({
        variant: "destructive",
        title: "Merge failed",
        description: "An error occurred during the merging process. Please try again.",
      });
    } finally {
      setIsMerging(false);
    }
  }, [pdfFiles, mergedFilename, toast]);

  // Download merged PDF
  const handleDownload = useCallback(() => {
    if (mergedPdf) {
      downloadFile(mergedPdf, mergedPdf.name, "application/pdf");
    }
  }, [mergedPdf]);

  // Create another merged PDF
  const handleCreateAnother = useCallback(() => {
    handleClearPdfs();
  }, [handleClearPdfs]);

  // Reorder PDFs via drag-and-drop (for a future implementation)
  const handleReorderPdfs = useCallback((fromIndex: number, toIndex: number) => {
    setPdfFiles(prev => {
      const result = [...prev];
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return result;
    });
  }, []);

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-heading text-gray-900 mb-4 dark:text-white">
            Merge PDF Files
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
            Combine multiple PDF files into a single document quickly and easily
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-800 dark:border dark:border-gray-700">
          <div className="p-8">
            {pdfFiles.length === 0 ? (
              <FileUpload
                accept=".pdf,application/pdf"
                maxSizeInMB={100}
                multiple={true}
                onFilesSelected={handlePdfsSelected}
                title="Upload PDF Files to Merge"
                description="Drag & drop your PDFs here or click to browse"
                buttonText="Select PDFs"
                colorScheme="red"
                icon={<Combine size={40} />}
                className="mb-8"
              />
            ) : (
              <>
                <FilePreview
                  files={pdfFiles}
                  fileType="pdf"
                  previewUrls={[]}
                  onRemove={handleRemovePdf}
                  onRemoveAll={handleClearPdfs}
                  onAddMore={handleAddMorePdfs}
                  className="mb-8"
                />

                {showOptions && !mergedPdf && !isMerging && (
                  <div className="border border-gray-200 rounded-lg p-6 mb-8 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 dark:text-gray-100">Merge Options</h4>

                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="merge-filename">Output Filename</Label>
                        <span className="text-xs text-gray-500 dark:text-gray-400">.pdf will be added automatically if missing</span>
                      </div>
                      <Input
                        id="merge-filename"
                        value={mergedFilename.replace(/\.pdf$/, "")}
                        onChange={(e) => setMergedFilename(e.target.value)}
                        placeholder="Enter a name for the merged PDF"
                      />
                    </div>

                    <div className="mb-4">
                      <Label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">File Order</Label>
                      <p className="text-sm text-gray-600 mb-2 dark:text-gray-400">
                        PDFs will be merged in the order shown below. You can remove files that you don't want to include.
                      </p>
                      
                      <div className="border border-gray-200 rounded-lg dark:border-gray-600">
                        <div className="divide-y divide-gray-200 dark:divide-gray-600">
                          {pdfFiles.map((file, index) => (
                            <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 text-xs font-medium dark:bg-gray-700 dark:text-gray-300">
                                  {index + 1}
                                </div>
                                <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                  </svg>
                                  <span className="text-sm text-gray-700 truncate max-w-[200px] dark:text-gray-300">{file.name}</span>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleRemovePdf(index)}
                                className="text-gray-400 hover:text-red-500 focus:outline-none"
                                aria-label="Remove file"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 text-right">
                        <button
                          onClick={handleAddMorePdfs}
                          className="text-sm text-red-500 hover:text-red-600 font-medium focus:outline-none dark:text-red-400 dark:hover:text-red-300"
                        >
                          + Add More PDFs
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isMerging && (
                  <div className="mt-8 mb-8">
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Merging PDFs...</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2.5" />
                  </div>
                )}

                {mergedPdf && (
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
                          <p className="font-medium">PDFs Merged Successfully!</p>
                          <p className="text-sm">Your PDF files have been combined into a single document.</p>
                        </div>
                      </AlertDescription>
                    </Alert>

                    <div className="border border-gray-200 rounded-lg mb-6 p-6 flex flex-col items-center dark:border-gray-700">
                      <div className="w-40 h-52 bg-gray-50 border border-gray-200 rounded-lg mb-4 p-2 shadow-sm dark:bg-gray-700 dark:border-gray-600">
                        <div className="w-full h-full flex items-center justify-center bg-white rounded dark:bg-gray-800">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-20 w-20 text-red-500"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                        </div>
                      </div>
                      <h4 className="font-medium text-gray-800 mb-1 dark:text-gray-200">
                        {mergedPdf.name}
                      </h4>
                      <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">
                        {pdfFiles.length} {pdfFiles.length === 1 ? "page" : "pages"} · {mergedSize}
                      </p>
                      <Button
                        onClick={handleDownload}
                        className="bg-red-500 text-white hover:bg-red-600"
                      >
                        <Download className="mr-2 h-4 w-4" /> Download Merged PDF
                      </Button>
                    </div>

                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        onClick={handleCreateAnother}
                      >
                        Merge More PDFs
                      </Button>
                    </div>
                  </div>
                )}

                {showOptions && !mergedPdf && !isMerging && (
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button
                      onClick={handleMergePdfs}
                      disabled={pdfFiles.length < 2}
                      className="bg-red-500 text-white hover:bg-red-600"
                    >
                      Merge PDFs
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleClearPdfs}
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

export default MergePdf;
