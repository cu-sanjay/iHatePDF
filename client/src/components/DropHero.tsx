import React, { useCallback, useRef, useState } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  UploadCloud,
  FileText,
  ImageIcon,
  X,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useFileVault, type VaultFile } from "@/context/FileVault";
import { formatFileSize } from "@/lib/fileUtils";

const pdfActions = [
  { label: "Compress", href: "/compress-pdf" },
  { label: "Split", href: "/split-pdf" },
  { label: "To Images", href: "/pdf-to-image" },
  { label: "Merge", href: "/merge-pdfs" },
  { label: "Watermark", href: "/watermark-pdf" },
  { label: "Sign", href: "/sign-pdf" },
];

const imageActions = [
  { label: "Image → PDF", href: "/image-to-pdf" },
  { label: "Compress", href: "/compress-image" },
];

const FileChip: React.FC<{ item: VaultFile; index: number; onRemove: () => void }> = ({
  item,
  index,
  onRemove,
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 14, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -8, scale: 0.96 }}
    transition={{ type: "spring", stiffness: 380, damping: 30, delay: index * 0.04 }}
    className="group relative flex items-center gap-3 rounded-2xl border border-black/[0.07] bg-white/70 backdrop-blur-xl px-3 py-2.5 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.45)]"
  >
    <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#FFF3F1]">
      {item.kind === "image" ? (
        <img src={item.url} alt="" className="h-full w-full object-cover" />
      ) : (
        <FileText size={20} className="text-[#E63228]" />
      )}
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-[#0A0A0A]">{item.file.name}</p>
      <p className="text-xs text-[#8A8A8E]">{formatFileSize(item.file.size)}</p>
    </div>
    <button
      onClick={onRemove}
      aria-label={`Remove ${item.file.name}`}
      className="shrink-0 rounded-full p-1.5 text-[#A0A0A5] transition-colors hover:bg-black/[0.05] hover:text-[#E63228]"
    >
      <X size={15} />
    </button>
  </motion.div>
);

const DropHero: React.FC = () => {
  const { files, addFiles, removeFile, clear } = useFileVault();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragDepth.current = 0;
      setIsDragging(false);
      const dropped = Array.from(e.dataTransfer.files ?? []);
      if (dropped.length) addFiles(dropped);
    },
    [addFiles]
  );

  const hasFiles = files.length > 0;
  const hasPdf = files.some((f) => f.kind === "pdf");
  const hasImage = files.some((f) => f.kind === "image");
  const actions = [...(hasPdf ? pdfActions : []), ...(hasImage ? imageActions : [])];

  return (
    <section className="relative overflow-hidden bg-white">
      {/* ambient light blobs — subtle, no gradient branding */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#E63228]/[0.07] blur-3xl"
        animate={{ y: [0, 24, 0], x: [0, 16, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-32 h-80 w-80 rounded-full bg-black/[0.04] blur-3xl"
        animate={{ y: [0, -28, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container relative mx-auto px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.07] bg-white/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#E63228] backdrop-blur-xl">
            <ShieldCheck size={13} /> Private · runs in your browser
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.06] tracking-tight text-[#0A0A0A] sm:text-5xl lg:text-6xl">
            Drop a file.
            <br />
            <span className="text-[#E63228]">Do everything with it.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-[#5A5A5F] sm:text-lg">
            Add your PDFs or images once — they stay with you across every tool. No re-uploading, no
            waiting, nothing leaves your device.
          </p>
        </motion.div>

        {/* dropzone */}
        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-10 max-w-3xl"
        >
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
            onDragEnter={(e) => {
              e.preventDefault();
              dragDepth.current += 1;
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              dragDepth.current -= 1;
              if (dragDepth.current <= 0) setIsDragging(false);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className={`relative cursor-pointer rounded-[28px] border border-dashed p-8 text-center backdrop-blur-2xl transition-all duration-300 sm:p-14 ${
              isDragging
                ? "border-[#E63228] bg-[#FFF6F5]/90 shadow-[0_30px_80px_-40px_rgba(230,50,40,0.55)]"
                : "border-black/[0.12] bg-white/60 shadow-[0_24px_70px_-45px_rgba(0,0,0,0.5)] hover:border-[#E63228]/60 hover:bg-white/80"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,application/pdf,image/*"
              className="hidden"
              onChange={(e) => {
                const picked = Array.from(e.target.files ?? []);
                if (picked.length) addFiles(picked);
                e.target.value = "";
              }}
            />

            <motion.div
              animate={isDragging ? { y: -6, scale: 1.06 } : { y: [0, -6, 0], scale: 1 }}
              transition={
                isDragging
                  ? { type: "spring", stiffness: 300, damping: 20 }
                  : { duration: 3.6, repeat: Infinity, ease: "easeInOut" }
              }
              className="mx-auto grid h-16 w-16 place-items-center rounded-[20px] border border-black/[0.06] bg-white shadow-[0_14px_40px_-20px_rgba(230,50,40,0.6)]"
            >
              <UploadCloud size={26} className="text-[#E63228]" />
            </motion.div>

            <h2 className="mt-5 text-lg font-bold text-[#0A0A0A] sm:text-xl">
              {isDragging ? "Release to add your files" : "Drag & drop your files here"}
            </h2>
            <p className="mt-1.5 text-sm text-[#8A8A8E]">
              PDFs and images · or <span className="font-semibold text-[#E63228]">browse</span> from
              your device
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-[#8A8A8E]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] px-3 py-1.5">
                <FileText size={12} /> PDF
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] px-3 py-1.5">
                <ImageIcon size={12} /> JPG · PNG · WEBP
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] px-3 py-1.5">
                <Sparkles size={12} /> Stays loaded everywhere
              </span>
            </div>
          </div>
        </motion.div>

        {/* carried files + what to do next */}
        <AnimatePresence>
          {hasFiles && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="mx-auto mt-6 max-w-3xl rounded-[24px] border border-black/[0.07] bg-white/70 p-4 backdrop-blur-2xl shadow-[0_24px_70px_-50px_rgba(0,0,0,0.55)] sm:p-5"
            >
              <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <p className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-[#8A8A8E]">
                  {files.length} file{files.length > 1 ? "s" : ""} ready
                </p>
                <button
                  onClick={clear}
                  className="shrink-0 text-xs font-semibold text-[#8A8A8E] transition-colors hover:text-[#E63228]"
                >
                  Clear all
                </button>
              </div>

              <motion.div layout className="grid gap-2 sm:grid-cols-2">
                <AnimatePresence initial={false}>
                  {files.map((item, i) => (
                    <FileChip
                      key={item.id}
                      item={item}
                      index={i}
                      onRemove={() => removeFile(item.id)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              {actions.length > 0 && (
                <div className="mt-4 border-t border-black/[0.06] pt-4">
                  <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#8A8A8E]">
                    What next?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {actions.map((action) => (
                      <Link
                        key={action.href}
                        href={action.href}
                        className="group inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-4 py-2 text-sm font-semibold text-[#0A0A0A] transition-all hover:-translate-y-0.5 hover:border-[#E63228] hover:text-[#E63228] hover:shadow-[0_12px_28px_-18px_rgba(230,50,40,0.8)]"
                      >
                        {action.label}
                        <ArrowRight
                          size={13}
                          className="opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default DropHero;
