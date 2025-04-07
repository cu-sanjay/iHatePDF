import { useState, useCallback, useEffect } from "react";
import FileUpload from "@/components/FileUpload";
import FilePreview from "@/components/FilePreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Images, Upload, RotateCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateFilePreview, downloadFile } from "@/lib/fileUtils";
import { convertImagesToPdf } from "@/lib/imageUtils";
import { rotateImage } from "@/lib/imageUtils";

const ImageToPdf = () => {
  const { toast } = useToast();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [pageSize, setPageSize] = useState<"a4" | "letter" | "legal" | "custom">("a4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [quality, setQuality] = useState<number>(80);
  const [customWidth, setCustomWidth] = useState<number>(210); // A4 width in mm
  const [customHeight, setCustomHeight] = useState<number>(297); // A4 height in mm
  const [filename, setFilename] = useState<string>("images.pdf");
  const [pdfResult, setPdfResult] = useState<{ file: File; size: string } | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  // Handle image file selection
  const handleImagesSelected = useCallback(async (files: File[]) => {
    if (files.length > 0) {
      setImageFiles(files);
      
      try {
        const previewUrls = await Promise.all(
          files.map(file => generateFilePreview(file))
        );
        setImagePreviewUrls(previewUrls);
        setShowOptions(true);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Preview generation failed",
          description: "Could not generate previews for some images.",
        });
      }
    }
  }, [toast]);

  // Add more images to the existing selection
  const handleAddMoreImages = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const newFiles = Array.from(target.files);
        const updatedFiles = [...imageFiles, ...newFiles];
        setImageFiles(updatedFiles);
        
        try {
          const newPreviewUrls = await Promise.all(
            newFiles.map(file => generateFilePreview(file))
          );
          setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Preview generation failed",
            description: "Could not generate previews for some images.",
          });
        }
      }
    };
    
    input.click();
  }, [imageFiles, imagePreviewUrls, toast]);

  // Remove a single image
  const handleRemoveImage = useCallback((index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Clear all images
  const handleClearImages = useCallback(() => {
    setImageFiles([]);
    setImagePreviewUrls([]);
    setShowOptions(false);
    setPdfResult(null);
  }, []);

  // Rotate an image
  const handleRotateImage = useCallback(async (index: number) => {
    if (index >= 0 && index < imageFiles.length) {
      try {
        const rotatedImage = await rotateImage(imageFiles[index], 90);
        const newImageFiles = [...imageFiles];
        newImageFiles[index] = rotatedImage;
        setImageFiles(newImageFiles);
        
        // Update preview for the rotated image
        const newPreviewUrl = await generateFilePreview(rotatedImage);
        const newPreviewUrls = [...imagePreviewUrls];
        newPreviewUrls[index] = newPreviewUrl;
        setImagePreviewUrls(newPreviewUrls);
        
        toast({
          title: "Image rotated",
          description: "The image has been rotated 90 degrees clockwise",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Rotation failed",
          description: "Could not rotate the image. Please try again.",
        });
      }
    }
  }, [imageFiles, imagePreviewUrls, toast]);

  // Convert images to PDF
  const handleConvertToPdf = useCallback(async () => {
    if (imageFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "No images selected",
        description: "Please select at least one image to convert.",
      });
      return;
    }

    setIsConverting(true);

    try {
      const pdfFile = await convertImagesToPdf(imageFiles, {
        pageSize,
        orientation,
        quality: quality / 100,
        customWidth: pageSize === "custom" ? customWidth : undefined,
        customHeight: pageSize === "custom" ? customHeight : undefined,
        filename: filename || "images.pdf",
      });

      setPdfResult({
        file: pdfFile,
        size: `${(pdfFile.size / 1024 / 1024).toFixed(2)} MB`,
      });

      toast({
        title: "Conversion complete",
        description: "Your images have been converted to PDF successfully",
      });
    } catch (error) {
      console.error("PDF conversion error:", error);
      toast({
        variant: "destructive",
        title: "Conversion failed",
        description: "An error occurred during PDF creation. Please try again.",
      });
    } finally {
      setIsConverting(false);
    }
  }, [
    imageFiles,
    pageSize,
    orientation,
    quality,
    customWidth,
    customHeight,
    filename,
    toast,
  ]);

  // Download the generated PDF
  const handleDownloadPdf = useCallback(() => {
    if (pdfResult?.file) {
      downloadFile(pdfResult.file, pdfResult.file.name, "application/pdf");
    }
  }, [pdfResult]);

  // Create another PDF
  const handleCreateAnother = useCallback(() => {
    handleClearImages();
  }, [handleClearImages]);

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-heading text-gray-900 mb-4 dark:text-white">
            Image to PDF Converter
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
            Convert your image files (JPG, PNG, etc.) to PDF documents
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-800 dark:border dark:border-gray-700">
          <div className="p-8">
            {imageFiles.length === 0 ? (
              <FileUpload
                accept="image/*"
                maxSizeInMB={50}
                multiple={true}
                onFilesSelected={handleImagesSelected}
                title="Upload Images"
                description="Drag & drop your images here or click to browse"
                buttonText="Select Images"
                colorScheme="secondary"
                icon={<Images size={40} />}
                className="mb-8"
              />
            ) : (
              <>
                <FilePreview
                  files={imageFiles}
                  fileType="image"
                  previewUrls={imagePreviewUrls}
                  onRemove={handleRemoveImage}
                  onRemoveAll={handleClearImages}
                  onRotate={handleRotateImage}
                  onAddMore={handleAddMoreImages}
                  className="mb-8"
                />

                {showOptions && !pdfResult && (
                  <div className="border border-gray-200 rounded-lg p-6 mb-8 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 dark:text-gray-100">
                      PDF Options
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <Label htmlFor="page-size">Page Size</Label>
                        <Select
                          value={pageSize}
                          onValueChange={(value: "a4" | "letter" | "legal" | "custom") => setPageSize(value)}
                        >
                          <SelectTrigger id="page-size" className="w-full">
                            <SelectValue placeholder="Select page size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="a4">A4</SelectItem>
                            <SelectItem value="letter">Letter</SelectItem>
                            <SelectItem value="legal">Legal</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="orientation">Orientation</Label>
                        <Select
                          value={orientation}
                          onValueChange={(value: "portrait" | "landscape") => setOrientation(value)}
                        >
                          <SelectTrigger id="orientation" className="w-full">
                            <SelectValue placeholder="Select orientation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="portrait">Portrait</SelectItem>
                            <SelectItem value="landscape">Landscape</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {pageSize === "custom" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <Label htmlFor="custom-width">Width (mm)</Label>
                          <Input
                            id="custom-width"
                            type="number"
                            value={customWidth}
                            onChange={(e) => setCustomWidth(Number(e.target.value))}
                            min={1}
                          />
                        </div>
                        <div>
                          <Label htmlFor="custom-height">Height (mm)</Label>
                          <Input
                            id="custom-height"
                            type="number"
                            value={customHeight}
                            onChange={(e) => setCustomHeight(Number(e.target.value))}
                            min={1}
                          />
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <Label htmlFor="pdf-filename">PDF Filename</Label>
                      <Input
                        id="pdf-filename"
                        placeholder="Enter filename (without .pdf extension)"
                        value={filename.replace(/\.pdf$/, "")}
                        onChange={(e) => setFilename(`${e.target.value}.pdf`)}
                      />
                    </div>

                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-200">
                        Image Quality
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Slider
                          min={1}
                          max={100}
                          step={1}
                          value={[quality]}
                          onValueChange={(values) => setQuality(values[0])}
                          className="w-full"
                        />
                        <span className="text-sm text-gray-600 w-8 dark:text-gray-300">
                          {quality}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {pdfResult && (
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
                          <p className="font-medium">PDF Created Successfully!</p>
                          <p className="text-sm">Your images have been combined into a PDF document.</p>
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
                        {pdfResult.file.name}
                      </h4>
                      <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">
                        {imageFiles.length} {imageFiles.length === 1 ? "page" : "pages"} · {pdfResult.size}
                      </p>
                      <Button
                        onClick={handleDownloadPdf}
                        className="bg-secondary text-white hover:bg-green-600"
                      >
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                      </Button>
                    </div>

                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        onClick={handleCreateAnother}
                      >
                        Create Another PDF
                      </Button>
                    </div>
                  </div>
                )}

                {showOptions && !pdfResult && (
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button
                      onClick={handleConvertToPdf}
                      disabled={imageFiles.length === 0 || isConverting}
                      className="bg-secondary text-white hover:bg-green-600"
                    >
                      {isConverting ? "Converting..." : "Convert to PDF"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleClearImages}
                      disabled={imageFiles.length === 0 || isConverting}
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

export default ImageToPdf;
