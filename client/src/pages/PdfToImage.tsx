import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import FileUpload from "@/components/FileUpload";
import FilePreview from "@/components/FilePreview";
import { FileText, Download, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateFilePreview, downloadFile } from "@/lib/fileUtils";
import { convertPdfToImages } from "@/lib/pdfUtils";

const PdfToImage = () => {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string>("");
  const [showOptions, setShowOptions] = useState(false);
  const [convertingStatus, setConvertingStatus] = useState<'idle' | 'converting' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);
  const [convertedImages, setConvertedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [pageRange, setPageRange] = useState<'all' | 'custom'>('all');
  const [customRange, setCustomRange] = useState<string>("");
  const [imageFormat, setImageFormat] = useState<'jpg' | 'png' | 'webp'>('jpg');
  const [imageQuality, setImageQuality] = useState<'high' | 'medium' | 'low'>('medium');

  // Handle PDF file selection
  const handlePdfSelected = useCallback(async (files: File[]) => {
    if (files.length > 0 && files[0].type === 'application/pdf') {
      setPdfFile(files[0]);
      try {
        const previewUrl = await generateFilePreview(files[0]);
        setPdfPreviewUrl(previewUrl);
        setShowOptions(true);
        setConvertingStatus('idle');
        setProgress(0);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Preview generation failed",
          description: "Could not generate a preview for this PDF.",
        });
      }
    }
  }, [toast]);

  // Reset the converter state
  const handleReset = useCallback(() => {
    setPdfFile(null);
    setPdfPreviewUrl("");
    setShowOptions(false);
    setConvertingStatus('idle');
    setProgress(0);
    setConvertedImages([]);
    setImagePreviewUrls([]);
    setPageRange('all');
    setCustomRange("");
  }, []);

  // Convert PDF to images
  const handleConvert = useCallback(async () => {
    if (!pdfFile) return;

    setConvertingStatus('converting');
    setProgress(0);

    try {
      // Parse page range if custom
      let pagesToConvert: number[] | "all" = "all";
      if (pageRange === 'custom' && customRange.trim()) {
        pagesToConvert = [];
        const ranges = customRange.split(',');
        
        for (const range of ranges) {
          const trimmedRange = range.trim();
          if (trimmedRange.includes('-')) {
            // Handle range like "1-3"
            const [start, end] = trimmedRange.split('-').map(num => parseInt(num.trim(), 10));
            if (!isNaN(start) && !isNaN(end) && start <= end) {
              for (let i = start; i <= end; i++) {
                if (!pagesToConvert.includes(i)) {
                  pagesToConvert.push(i);
                }
              }
            }
          } else {
            // Handle single page
            const page = parseInt(trimmedRange, 10);
            if (!isNaN(page) && !pagesToConvert.includes(page)) {
              pagesToConvert.push(page);
            }
          }
        }
        
        if (pagesToConvert.length === 0) {
          pagesToConvert = "all";
        }
      }

      // Quality settings based on selected option
      const qualitySettings = {
        high: 0.9,
        medium: 0.7,
        low: 0.5
      };

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prevProgress => {
          const newProgress = prevProgress + 5;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 200);

      // Convert PDF to images
      const images = await convertPdfToImages(pdfFile, {
        format: imageFormat,
        quality: qualitySettings[imageQuality],
        pages: pagesToConvert,
        scale: 2
      });

      clearInterval(progressInterval);
      setProgress(100);
      setConvertedImages(images);

      // Generate previews for the converted images
      const previewUrls = await Promise.all(images.map(img => generateFilePreview(img)));
      setImagePreviewUrls(previewUrls);
      setConvertingStatus('complete');

      toast({
        title: "Conversion complete",
        description: `Successfully converted ${images.length} pages to images`,
      });
    } catch (error) {
      console.error("PDF conversion error:", error);
      setConvertingStatus('idle');
      toast({
        variant: "destructive",
        title: "Conversion failed",
        description: "An error occurred during conversion. Please try again.",
      });
    }
  }, [pdfFile, pageRange, customRange, imageFormat, imageQuality, toast]);

  // Download a single converted image
  const handleDownloadImage = (index: number) => {
    if (convertedImages[index]) {
      const file = convertedImages[index];
      downloadFile(file, file.name, file.type);
    }
  };

  // Download all converted images as a ZIP file
  const handleDownloadAll = async () => {
    try {
      // Use JSZip to create a zip file of all images
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // Add all images to the zip
      for (const imageFile of convertedImages) {
        const arrayBuffer = await imageFile.arrayBuffer();
        zip.file(imageFile.name, arrayBuffer);
      }
      
      // Generate the zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Download the zip file
      const zipFileName = pdfFile ? `${pdfFile.name.replace('.pdf', '')}_images.zip` : 'converted_images.zip';
      downloadFile(zipBlob, zipFileName, 'application/zip');
      
      toast({
        title: "Download started",
        description: "Your images have been packaged and download has started",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "An error occurred while preparing the download",
      });
    }
  };

  // Handle conversion of another file
  const handleConvertAnother = () => {
    handleReset();
  };

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-heading text-gray-900 mb-4 dark:text-white">
            PDF to Image Converter
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
            Convert your PDF files to high-quality JPG, PNG, or other image formats
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-800 dark:border dark:border-gray-700">
          <div className="p-8">
            {!pdfFile ? (
              <FileUpload
                accept=".pdf,application/pdf"
                maxSizeInMB={50}
                multiple={false}
                onFilesSelected={handlePdfSelected}
                title="Upload PDF File"
                description="Drag & drop your PDF here or click to browse"
                buttonText="Select PDF"
                colorScheme="primary"
                icon={<FileText size={40} />}
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

                {showOptions && convertingStatus === 'idle' && (
                  <div className="border border-gray-200 rounded-lg p-6 mb-8 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 dark:text-gray-100">Conversion Options</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <Label htmlFor="image-format">Image Format</Label>
                        <Select
                          value={imageFormat}
                          onValueChange={(value: "jpg" | "png" | "webp") => setImageFormat(value)}
                        >
                          <SelectTrigger id="image-format" className="w-full">
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="jpg">JPG</SelectItem>
                            <SelectItem value="png">PNG</SelectItem>
                            <SelectItem value="webp">WebP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="image-quality">Image Quality</Label>
                        <Select
                          value={imageQuality}
                          onValueChange={(value: "high" | "medium" | "low") => setImageQuality(value)}
                        >
                          <SelectTrigger id="image-quality" className="w-full">
                            <SelectValue placeholder="Select quality" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-200">Page Range</Label>
                      <RadioGroup value={pageRange} onValueChange={(value: "all" | "custom") => setPageRange(value)} className="flex items-center space-x-2 mb-2">
                        <div className="flex items-center">
                          <RadioGroupItem value="all" id="all-pages" />
                          <Label htmlFor="all-pages" className="ml-2">All Pages</Label>
                        </div>
                        <div className="flex items-center">
                          <RadioGroupItem value="custom" id="custom-range" />
                          <Label htmlFor="custom-range" className="ml-2">Custom Range</Label>
                        </div>
                      </RadioGroup>
                      
                      {pageRange === 'custom' && (
                        <div className="mt-2">
                          <Input
                            type="text"
                            placeholder="e.g., 1-3, 5, 7-9"
                            value={customRange}
                            onChange={(e) => setCustomRange(e.target.value)}
                          />
                          <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Separate with commas or hyphens (e.g., 1-3, 5, 7-9)</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {convertingStatus === 'converting' && (
                  <div id="conversion-progress" className="mt-8 mb-8">
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Converting...</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2.5" />
                  </div>
                )}

                {convertingStatus === 'complete' && convertedImages.length > 0 && (
                  <div id="conversion-result" className="mt-8">
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
                          <p className="font-medium">Conversion Complete!</p>
                          <p className="text-sm">Your PDF has been successfully converted to images.</p>
                        </div>
                      </AlertDescription>
                    </Alert>

                    <div className="border border-gray-200 rounded-lg mb-6 dark:border-gray-700">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200">Generated Images</h4>
                      </div>
                      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {convertedImages.map((image, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden dark:border-gray-700">
                            <img
                              src={imagePreviewUrls[index]}
                              alt={`Converted image ${index + 1}`}
                              className="w-full h-auto"
                            />
                            <div className="bg-white p-2 flex justify-between items-center dark:bg-gray-800">
                              <span className="text-xs text-gray-600 truncate max-w-[120px] dark:text-gray-300" title={image.name}>
                                {image.name}
                              </span>
                              <button
                                className="text-xs text-primary hover:text-blue-700 font-medium dark:hover:text-blue-400"
                                onClick={() => handleDownloadImage(index)}
                              >
                                <Download size={14} className="inline mr-1" /> Download
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Button
                        onClick={handleDownloadAll}
                        className="bg-primary text-white hover:bg-blue-600"
                      >
                        <Download className="mr-2 h-4 w-4" /> Download All
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleConvertAnother}
                      >
                        Convert Another File
                      </Button>
                    </div>
                  </div>
                )}

                {convertingStatus === 'idle' && (
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button
                      onClick={handleConvert}
                      disabled={!pdfFile}
                      className="bg-primary text-white hover:bg-blue-600"
                    >
                      Convert to Images
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

export default PdfToImage;
