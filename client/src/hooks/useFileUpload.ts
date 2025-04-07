import { useState, useCallback, useRef } from "react";

interface UseFileUploadProps {
  accept?: string;
  maxSizeInMB?: number;
  multiple?: boolean;
}

interface UseFileUploadReturn {
  files: File[];
  fileInputRef: React.RefObject<HTMLInputElement>;
  isDragging: boolean;
  handleDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  triggerFileInput: () => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  error: string | null;
}

export const useFileUpload = ({
  accept = "*",
  maxSizeInMB = 50,
  multiple = false,
}: UseFileUploadProps = {}): UseFileUploadReturn => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearError = () => {
    if (error) setError(null);
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setError(`File size exceeds the maximum limit of ${maxSizeInMB}MB`);
      return false;
    }

    // Check file type if accept is specified and not '*'
    if (accept !== "*") {
      const acceptedTypes = accept.split(",").map((type) => type.trim());
      
      // Handle file extensions (e.g., .pdf, .jpg)
      const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
      const mimeType = file.type;
      
      const isValidType = acceptedTypes.some((type) => {
        // Check if it's a mime type pattern
        if (type.includes("/")) {
          if (type.endsWith("/*")) {
            const mainType = type.split("/")[0];
            return mimeType.startsWith(`${mainType}/`);
          }
          return mimeType === type;
        }
        // It's a file extension
        return fileExtension === type;
      });

      if (!isValidType) {
        setError(`File type not supported. Accepted types: ${accept}`);
        return false;
      }
    }

    return true;
  };

  const handleFiles = (fileList: FileList) => {
    clearError();
    
    const newFiles: File[] = [];
    
    Array.from(fileList).forEach((file) => {
      if (validateFile(file)) {
        newFiles.push(file);
      }
    });

    if (newFiles.length > 0) {
      if (multiple) {
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      } else {
        setFiles([newFiles[0]]);
      }
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, []);

  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return {
    files,
    fileInputRef,
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileSelect,
    triggerFileInput,
    removeFile,
    clearFiles,
    error,
  };
};
