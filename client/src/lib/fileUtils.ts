/**
 * Generates a preview URL for a file
 */
export const generateFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to generate image preview'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      // For PDFs we'll handle preview generation elsewhere using PDF.js
      resolve(URL.createObjectURL(file));
    } else {
      reject(new Error('Unsupported file type for preview'));
    }
  });
};

/**
 * Creates a file with the specified content and name
 */
export const createFile = (
  content: Blob | string,
  fileName: string,
  type: string
): File => {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  return new File([blob], fileName, { type });
};

/**
 * Downloads a file to the user's device
 */
export const downloadFile = (content: Blob | string, fileName: string, type?: string): void => {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Formats a file size in bytes to a human-readable string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Checks if a file is an image
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * Checks if a file is a PDF
 */
export const isPdfFile = (file: File): boolean => {
  return file.type === 'application/pdf';
};

/**
 * Validates a file against size and type constraints
 */
export const validateFile = (
  file: File,
  { maxSizeInMB = 50, acceptedTypes = [] }: { maxSizeInMB?: number; acceptedTypes?: string[] } = {}
): { valid: boolean; error?: string } => {
  // Check file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      valid: false,
      error: `File size exceeds the maximum limit of ${maxSizeInMB}MB`,
    };
  }

  // Check file type if acceptedTypes is provided
  if (acceptedTypes.length > 0) {
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    const mimeType = file.type;
    
    const isAcceptedType = acceptedTypes.some((type) => {
      // Check for MIME type pattern
      if (type.includes('/')) {
        if (type.endsWith('/*')) {
          const mainType = type.split('/')[0];
          return mimeType.startsWith(`${mainType}/`);
        }
        return mimeType === type;
      }
      // Check for file extension
      return fileExtension === type;
    });

    if (!isAcceptedType) {
      return {
        valid: false,
        error: `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`,
      };
    }
  }

  return { valid: true };
};
