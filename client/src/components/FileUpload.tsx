import React from "react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileUploadProps {
  accept?: string;
  maxSizeInMB?: number;
  multiple?: boolean;
  onFilesSelected?: (files: File[]) => void;
  className?: string;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  buttonText?: string;
  colorScheme?: "primary" | "secondary" | "accent" | "red" | "yellow" | "indigo";
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept = "*",
  maxSizeInMB = 50,
  multiple = false,
  onFilesSelected,
  className = "",
  icon = <Upload size={36} />,
  title,
  description = "Drag & drop your files here or click to browse",
  buttonText = "Select Files",
}) => {
  const {
    files,
    fileInputRef,
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileSelect,
    triggerFileInput,
    error,
  } = useFileUpload({ accept, maxSizeInMB, multiple });

  React.useEffect(() => {
    if (files.length > 0 && onFilesSelected) {
      onFilesSelected(files);
    }
  }, [files, onFilesSelected]);

  return (
    <div className={className}>
      <div
        className={`border-2 border-dashed transition-colors duration-200 p-8 sm:p-12 text-center cursor-pointer ${
          isDragging
            ? "border-[#E63228] bg-[#FFF5F5]"
            : "border-[#D0D0D0] bg-[#FAFAFA] hover:border-[#E63228] hover:bg-[#FFF8F8]"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
        />
        <div className="text-[#E63228] mb-4 flex justify-center">{icon}</div>
        <h3 className="text-base font-semibold text-[#0A0A0A] mb-1">{title}</h3>
        <p className="text-[#888] text-sm mb-4">{description}</p>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}
          className="px-5 py-2 bg-[#E63228] text-white text-sm font-semibold hover:bg-[#c4231a] transition-colors"
        >
          {buttonText}
        </button>
        <p className="text-[#aaa] text-xs mt-3">
          Max file size: {maxSizeInMB}MB
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-3">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FileUpload;
