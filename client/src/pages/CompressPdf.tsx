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

  // Handle PDF file selection
  const handlePdfSelected = useCallback(async (files: File[]) => {
    if (files.length > 0 && files[0].type === 'application/pdf') {
      setPdfFile(files[0]);
      try {
        const previewUrl = await generateFilePreview(files[0]);
        setPdfPreviewUrl(previewUrl);
        setShowOptions(true);
        setIsCompressing(false);
        setProgress(0);
        setCompressedPdf(null);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Preview generation failed",
          description: "Could not generate a preview for this PDF.",
        });
      }
    }
  }, [toast]);

  // Reset the compressor state
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

  // Compress PDF
  const handleCompress = useCallback(async () => {
    if (!pdfFile) return;

    setIsCompressing(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prevProgress => {
          const newProgress = prevProgress + Math.random() * 5;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 200);

      // Compress the PDF
      const compressedFile = await compressPdf(pdfFile, {
        quality: compressionLevel,
        compressImages: compressImages,
        removeMetadata: removeMetadata,
      });

      clearInterval(progressInterval);
      setProgress(100);

      // Calculate size reduction
      const originalSize = formatFileSize(pdfFile.size);
      const compressedSize = formatFileSize(compressedFile.size);
      const savingsPercent = Math.round((1 - (compressedFile.size / pdfFile.size)) * 100);

      setCompressedPdf({
        file: compressedFile,
        originalSize,
        compressedSize,
        savingsPercent,
      });

      toast({
        title: "Compression complete",
        description: `PDF compressed by ${savingsPercent}%`,
      });
    } catch (error) {
      console.error("PDF compression error:", error);
      setIsCompressing(false);
      toast({
        variant: "destructive",
        title: "Compression failed",
        description: "An error occurred during compression. Please try again.",
      });
    }
  }, [pdfFile, compressionLevel, compressImages, removeMetadata, toast]);

  // Download compressed PDF
  const handleDownload = useCallback(() => {
    if (compressedPdf?.file) {
      downloadFile(compressedPdf.file, compressedPdf.file.name, "application/pdf");
    }
  }, [compressedPdf]);

  // Handle compression of another file
  const handleCompressAnother = useCallback(() => {
    handleReset();
  }, [handleReset]);

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-heading text-gray-900 mb-4 dark:text-white">
            PDF Compression Tool
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
            Reduce PDF file size while maintaining quality for easier sharing
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
                title="Upload PDF to Compress"
                description="Drag & drop your PDF here or click to browse"
                buttonText="Select PDF"
                colorScheme="accent"
                icon={<FileDown size={40} />}
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

                {showOptions && !compressedPdf && !isCompressing && (
                  <div className="border border-gray-200 rounded-lg p-6 mb-8 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 dark:text-gray-100">Compression Options</h4>

                    <div className="mb-6">
                      <Label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">Compression Level</Label>
                      <RadioGroup value={compressionLevel} onValueChange={(value: "low" | "medium" | "high") => setCompressionLevel(value)} className="grid grid-cols-3 gap-4">
                        <div>
                          <RadioGroupItem value="low" id="low-compression" className="peer hidden" />
                          <Label
                            htmlFor="low-compression"
                            className="border border-gray-200 rounded-lg p-4 text-center block cursor-pointer hover:bg-purple-50 peer-checked:bg-purple-100 peer-checked:border-purple-300 transition-colors duration-200 dark:border-gray-600 dark:hover:bg-purple-900/20 dark:peer-checked:bg-purple-900/30 dark:peer-checked:border-purple-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto mb-2 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
                              <line x1="16" y1="8" x2="2" y2="22"></line>
                              <line x1="17.5" y1="15" x2="9" y2="15"></line>
                            </svg>
                            <div className="font-medium text-gray-800 dark:text-gray-200">Low</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">High quality, minimal compression</div>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="medium" id="medium-compression" className="peer hidden" />
                          <Label
                            htmlFor="medium-compression"
                            className="border border-gray-200 rounded-lg p-4 text-center block cursor-pointer hover:bg-purple-50 peer-checked:bg-purple-100 peer-checked:border-purple-300 transition-colors duration-200 dark:border-gray-600 dark:hover:bg-purple-900/20 dark:peer-checked:bg-purple-900/30 dark:peer-checked:border-purple-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto mb-2 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="20" x2="12" y2="10"></line>
                              <line x1="18" y1="20" x2="18" y2="4"></line>
                              <line x1="6" y1="20" x2="6" y2="16"></line>
                            </svg>
                            <div className="font-medium text-gray-800 dark:text-gray-200">Medium</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Balanced quality and size</div>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="high" id="high-compression" className="peer hidden" />
                          <Label
                            htmlFor="high-compression"
                            className="border border-gray-200 rounded-lg p-4 text-center block cursor-pointer hover:bg-purple-50 peer-checked:bg-purple-100 peer-checked:border-purple-300 transition-colors duration-200 dark:border-gray-600 dark:hover:bg-purple-900/20 dark:peer-checked:bg-purple-900/30 dark:peer-checked:border-purple-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto mb-2 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="4 14 10 14 10 20"></polyline>
                              <polyline points="20 10 14 10 14 4"></polyline>
                              <line x1="14" y1="10" x2="21" y2="3"></line>
                              <line x1="3" y1="21" x2="10" y2="14"></line>
                            </svg>
                            <div className="font-medium text-gray-800 dark:text-gray-200">High</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Smaller file, lower quality</div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">Advanced Options</Label>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Checkbox
                            id="compress-images"
                            checked={compressImages}
                            onCheckedChange={(checked) => setCompressImages(checked as boolean)}
                            className="text-accent"
                          />
                          <Label htmlFor="compress-images" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            Compress images within PDF
                          </Label>
                        </div>
                        <div className="flex items-center">
                          <Checkbox
                            id="remove-metadata"
                            checked={removeMetadata}
                            onCheckedChange={(checked) => setRemoveMetadata(checked as boolean)}
                            className="text-accent"
                          />
                          <Label htmlFor="remove-metadata" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            Remove document metadata
                          </Label>
                        </div>
                        <div className="flex items-center">
                          <Checkbox
                            id="optimize-fonts"
                            checked={optimizeFonts}
                            onCheckedChange={(checked) => setOptimizeFonts(checked as boolean)}
                            className="text-accent"
                          />
                          <Label htmlFor="optimize-fonts" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            Optimize fonts
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isCompressing && !compressedPdf && (
                  <div className="mt-8 mb-8">
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Compressing...</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2.5" />
                  </div>
                )}

                {compressedPdf && (
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
                          <p className="font-medium">Compression Complete!</p>
                          <p className="text-sm">Your PDF has been successfully compressed.</p>
                        </div>
                      </AlertDescription>
                    </Alert>

                    <div className="border border-gray-200 rounded-lg mb-6 p-6 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-6">
                        <div className="font-medium text-gray-800 dark:text-gray-200">Compression Results</div>
                        <div className="text-sm text-green-600 font-medium dark:text-green-500">
                          Saved {compressedPdf.savingsPercent}%
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8 mb-6">
                        <div>
                          <div className="flex items-center mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                              <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Original File</span>
                          </div>
                          <div className="bg-gray-100 rounded-lg p-4 text-center dark:bg-gray-700">
                            <div className="text-2xl font-bold text-gray-700 mb-1 dark:text-gray-300">{compressedPdf.originalSize}</div>
                            <div className="text-xs text-gray-500 truncate dark:text-gray-400">{pdfFile?.name}</div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                              <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Compressed File</span>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 text-center dark:bg-green-900/30">
                            <div className="text-2xl font-bold text-green-600 mb-1 dark:text-green-500">{compressedPdf.compressedSize}</div>
                            <div className="text-xs text-gray-500 truncate dark:text-gray-400">{compressedPdf.file.name}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <Button
                          onClick={handleDownload}
                          className="bg-accent text-white hover:bg-purple-600"
                        >
                          <Download className="mr-2 h-4 w-4" /> Download Compressed PDF
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        onClick={handleCompressAnother}
                      >
                        Compress Another PDF
                      </Button>
                    </div>
                  </div>
                )}

                {showOptions && !compressedPdf && !isCompressing && (
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button
                      onClick={handleCompress}
                      disabled={!pdfFile}
                      className="bg-accent text-white hover:bg-purple-600"
                    >
                      Compress PDF
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

export default CompressPdf;
