import React from "react";
import { X, RotateCw, Download, Trash } from "lucide-react";

interface FilePreviewProps {
  files: File[];
  onRemove?: (index: number) => void;
  onRemoveAll?: () => void;
  onRotate?: (index: number) => void;
  showControls?: boolean;
  fileType: "pdf" | "image";
  previewUrls?: string[];
  onAddMore?: () => void;
  className?: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  files,
  onRemove,
  onRemoveAll,
  onRotate,
  showControls = true,
  fileType,
  previewUrls = [],
  onAddMore,
  className = "",
}) => {
  if (files.length === 0) return null;

  const fileIcon = fileType === "pdf" ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
  );

  // For single file preview (PDF)
  if (fileType === "pdf" && files.length === 1) {
    return (
      <div className={`border border-gray-200 rounded-lg mb-8 overflow-hidden ${className} dark:border-gray-700`}>
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex justify-between items-center dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center">
            {fileIcon}
            <span className="ml-2 font-medium text-gray-700 dark:text-gray-200">{files[0].name}</span>
          </div>
          {showControls && (
            <button 
              className="text-gray-500 hover:text-red-500 focus:outline-none dark:text-gray-400 dark:hover:text-red-400" 
              onClick={() => onRemoveAll?.()}
              aria-label="Remove file"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <div className="p-4 flex flex-col items-center justify-center">
          {previewUrls.length > 0 ? (
            <div className="w-full max-w-sm bg-gray-50 border border-gray-200 rounded-lg mb-4 overflow-hidden dark:bg-gray-700 dark:border-gray-600">
              <img src={previewUrls[0]} alt="PDF preview" className="w-full h-auto" />
            </div>
          ) : (
            <div className="w-full max-w-sm flex items-center justify-center p-8 bg-gray-50 border border-gray-200 rounded-lg mb-4">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{files[0].name}</p>
              </div>
            </div>
          )}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {(files[0].size / 1024 / 1024).toFixed(2)} MB
          </div>
        </div>
      </div>
    );
  }

  // For multiple files preview (Images)
  return (
    <div className={`border border-gray-200 rounded-lg mb-8 ${className} dark:border-gray-700`}>
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex justify-between items-center dark:bg-gray-800 dark:border-gray-700">
        <h4 className="font-medium text-gray-700 dark:text-gray-200">Selected Files ({files.length})</h4>
        {showControls && (
          <div>
            {onAddMore && (
              <button className="text-sm text-gray-600 hover:text-secondary mr-3 focus:outline-none dark:text-gray-300 dark:hover:text-secondary" onClick={onAddMore}>
                <span className="flex items-center"><span className="mr-1">+</span> Add More</span>
              </button>
            )}
            <button className="text-gray-500 hover:text-red-500 focus:outline-none dark:text-gray-400 dark:hover:text-red-400" onClick={() => onRemoveAll?.()} aria-label="Clear all files">
              <Trash size={16} />
            </button>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="border border-gray-200 rounded-lg overflow-hidden group relative dark:border-gray-700">
              {showControls && (
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  {onRemove && (
                    <button
                      className="w-8 h-8 rounded-full bg-white text-red-500 hover:bg-red-100 transition-colors duration-200 flex items-center justify-center mr-1 dark:bg-gray-700 dark:hover:bg-gray-600"
                      onClick={() => onRemove(index)}
                      title="Remove image"
                    >
                      <Trash size={14} />
                    </button>
                  )}
                  {onRotate && (
                    <button
                      className="w-8 h-8 rounded-full bg-white text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center ml-1 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                      onClick={() => onRotate(index)}
                      title="Rotate image"
                    >
                      <RotateCw size={14} />
                    </button>
                  )}
                </div>
              )}
              
              {previewUrls[index] ? (
                <img
                  src={previewUrls[index]}
                  alt={`Selected file ${index + 1}`}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                  {fileIcon}
                </div>
              )}
              
              <div className="p-2 bg-white dark:bg-gray-800">
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <span className="truncate max-w-[80%]" title={file.name}>{file.name}</span>
                  <span className="bg-gray-100 px-1.5 py-0.5 rounded dark:bg-gray-700">{index + 1}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
