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

const colorVariants = {
  primary: {
    border: "border-blue-200",
    hover: "hover:border-primary",
    bg: "bg-blue-50",
    buttonBg: "bg-primary",
    buttonHover: "hover:bg-blue-600",
    iconText: "text-blue-400",
  },
  secondary: {
    border: "border-green-200",
    hover: "hover:border-secondary",
    bg: "bg-green-50",
    buttonBg: "bg-secondary",
    buttonHover: "hover:bg-green-600",
    iconText: "text-green-400",
  },
  accent: {
    border: "border-purple-200",
    hover: "hover:border-accent",
    bg: "bg-purple-50",
    buttonBg: "bg-accent",
    buttonHover: "hover:bg-purple-600",
    iconText: "text-purple-400",
  },
  red: {
    border: "border-red-200",
    hover: "hover:border-red-500",
    bg: "bg-red-50",
    buttonBg: "bg-red-500",
    buttonHover: "hover:bg-red-600",
    iconText: "text-red-400",
  },
  yellow: {
    border: "border-yellow-200",
    hover: "hover:border-yellow-500",
    bg: "bg-yellow-50",
    buttonBg: "bg-yellow-500",
    buttonHover: "hover:bg-yellow-600",
    iconText: "text-yellow-400",
  },
  indigo: {
    border: "border-indigo-200",
    hover: "hover:border-indigo-500",
    bg: "bg-indigo-50",
    buttonBg: "bg-indigo-500",
    buttonHover: "hover:bg-indigo-600",
    iconText: "text-indigo-400",
  },
};

const FileUpload: React.FC<FileUploadProps> = ({
  accept = "*",
  maxSizeInMB = 50,
  multiple = false,
  onFilesSelected,
  className = "",
  icon = <Upload size={40} />,
  title,
  description = "Drag & drop your files here or click to browse",
  buttonText = "Select Files",
  colorScheme = "primary",
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

  const colors = colorVariants[colorScheme];

  React.useEffect(() => {
    if (files.length > 0 && onFilesSelected) {
      onFilesSelected(files);
    }
  }, [files, onFilesSelected]);

  return (
    <div className={className}>
      <div
        className={`border-2 border-dashed ${colors.border} rounded-lg p-8 text-center ${colors.hover} transition-colors duration-300 ${colors.bg} ${
          isDragging ? "border-primary bg-blue-100" : ""
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
        />
        <div className={`text-5xl ${colors.iconText} mb-4`}>{icon}</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2 dark:text-white">{title}</h3>
        <p className="text-gray-600 mb-4 dark:text-gray-300">{description}</p>
        <button
          onClick={triggerFileInput}
          className={`px-6 py-2 ${colors.buttonBg} text-white rounded-lg ${colors.buttonHover} transition-colors duration-300 font-medium`}
        >
          {buttonText}
        </button>
        <p className="text-sm text-gray-500 mt-4 dark:text-gray-400">
          Maximum file size: {maxSizeInMB}MB
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FileUpload;
