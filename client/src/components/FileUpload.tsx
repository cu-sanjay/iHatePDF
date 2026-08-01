import React, { useEffect, useRef } from "react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Upload, FileText, ImageIcon, ArrowRight, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useFileVault, fileMatchesAccept } from "@/context/FileVault";
import { formatFileSize } from "@/lib/fileUtils";

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
  icon = <Upload size={30} />,
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

  const { files: vaultFiles, addFiles } = useFileVault();
  const adopted = useRef(false);

  // Files carried in from the drop hero (or another tool) are used automatically
  const carried = vaultFiles.filter((f) => fileMatchesAccept(f.file, accept));

  useEffect(() => {
    if (adopted.current || files.length > 0 || carried.length === 0) return;
    adopted.current = true;
    onFilesSelected?.(multiple ? carried.map((f) => f.file) : [carried[0].file]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carried.length]);

  useEffect(() => {
    if (files.length > 0) {
      adopted.current = true;
      addFiles(files);
      onFilesSelected?.(files);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  return (
    <div className={className}>
      {carried.length > 0 && (
        <div className="mb-4 rounded-2xl border border-black/[0.07] bg-white/70 p-3 backdrop-blur-xl">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A8A8E]">
            Carried over from your workspace
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {carried.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  onFilesSelected?.(multiple ? carried.map((f) => f.file) : [item.file])
                }
                className="group flex items-center gap-3 rounded-xl border border-black/[0.06] bg-white px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-[#E63228]"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#FFF3F1]">
                  {item.kind === "image" ? (
                    <img src={item.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <FileText size={16} className="text-[#E63228]" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[#0A0A0A]">
                    {item.file.name}
                  </span>
                  <span className="block text-xs text-[#8A8A8E]">
                    {formatFileSize(item.file.size)}
                  </span>
                </span>
                <ArrowRight
                  size={14}
                  className="shrink-0 text-[#C2C2C6] transition-transform group-hover:translate-x-0.5 group-hover:text-[#E63228]"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        className={`cursor-pointer rounded-[24px] border border-dashed p-8 text-center backdrop-blur-xl transition-all duration-300 sm:p-12 ${
          isDragging
            ? "border-[#E63228] bg-[#FFF6F5]/90 shadow-[0_26px_70px_-42px_rgba(230,50,40,0.55)]"
            : "border-black/[0.12] bg-white/60 hover:border-[#E63228]/60 hover:bg-white/85"
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
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-[18px] border border-black/[0.06] bg-white text-[#E63228] shadow-[0_14px_36px_-22px_rgba(230,50,40,0.7)]">
          {icon}
        </div>
        <h3 className="text-base font-bold text-[#0A0A0A]">{title}</h3>
        <p className="mb-4 mt-1 text-sm text-[#8A8A8E]">{description}</p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            triggerFileInput();
          }}
          className="inline-flex items-center gap-2 rounded-full bg-[#E63228] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#c4231a] hover:shadow-[0_14px_30px_-14px_rgba(230,50,40,0.9)]"
        >
          {carried.length > 0 ? <RefreshCw size={14} /> : <ImageIcon size={14} className="hidden" />}
          {carried.length > 0 ? "Use a different file" : buttonText}
        </button>
        <p className="mt-3 text-xs text-[#B0B0B5]">Max file size: {maxSizeInMB}MB</p>
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
