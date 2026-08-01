import { useState, useRef, useCallback, useEffect } from "react";
import FileUpload from "@/components/FileUpload";
import BackToTools from "@/components/BackToTools";
import { FileText, Download, PenLine, Trash2, Plus, X, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { downloadFile } from "@/lib/fileUtils";
import { loadPdfDocument, renderPdfPageToCanvas } from "@/lib/pdfjs";
import { signPdf, type SignaturePlacement } from "@/lib/pdfUtils";

interface PlacedSignature extends SignaturePlacement {
  id: string;
}

const SignaturePad = ({
  onSave,
}: {
  onSave: (dataUrl: string, aspect: number) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const strokes = useRef<{ x: number; y: number }[][]>([]);
  const [penWidth, setPenWidth] = useState(3);
  const [penColor, setPenColor] = useState("#0A0A0A");
  const [isEmpty, setIsEmpty] = useState(true);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth * (canvas.width / canvas.clientWidth || 1);
    for (const stroke of strokes.current) {
      if (stroke.length < 2) {
        if (stroke.length === 1) {
          ctx.beginPath();
          ctx.arc(stroke[0].x, stroke[0].y, ctx.lineWidth / 2, 0, Math.PI * 2);
          ctx.fillStyle = penColor;
          ctx.fill();
        }
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x, stroke[i].y);
      ctx.stroke();
    }
  }, [penColor, penWidth]);

  // Size the backing store to the element (handles mobile + resize)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      redraw();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [redraw]);

  useEffect(() => { redraw(); }, [redraw]);

  const pointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    drawing.current = true;
    strokes.current.push([pointFromEvent(e)]);
    setIsEmpty(false);
    redraw();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    e.preventDefault();
    strokes.current[strokes.current.length - 1].push(pointFromEvent(e));
    redraw();
  };

  const stop = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    drawing.current = false;
    canvasRef.current?.releasePointerCapture(e.pointerId);
  };

  const clear = () => {
    strokes.current = [];
    setIsEmpty(true);
    redraw();
  };

  const undo = () => {
    strokes.current.pop();
    setIsEmpty(strokes.current.length === 0);
    redraw();
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;

    // Trim to the ink bounding box so the stamp has no dead space
    const ctx = canvas.getContext("2d")!;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        if (data[(y * canvas.width + x) * 4 + 3] > 8) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX <= minX || maxY <= minY) return;
    const pad = 6;
    minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
    maxX = Math.min(canvas.width - 1, maxX + pad); maxY = Math.min(canvas.height - 1, maxY + pad);

    const out = document.createElement("canvas");
    out.width = maxX - minX + 1;
    out.height = maxY - minY + 1;
    out.getContext("2d")!.drawImage(canvas, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
    onSave(out.toDataURL("image/png"), out.width / out.height);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        className="w-full h-40 sm:h-48 bg-white border-2 border-dashed border-[#D0D0D0] rounded-lg touch-none cursor-crosshair"
      />
      <div className="flex flex-wrap items-center gap-3 mt-3">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-[#555]">Pen</Label>
          <div className="w-24">
            <Slider value={[penWidth]} min={1} max={8} step={1} onValueChange={(v) => setPenWidth(v[0])} />
          </div>
        </div>
        <input
          type="color"
          value={penColor}
          onChange={(e) => setPenColor(e.target.value)}
          aria-label="Pen colour"
          className="h-8 w-10 rounded-md border border-[#D0D0D0] bg-white p-1 cursor-pointer"
        />
        <Button variant="outline" size="sm" onClick={undo} disabled={isEmpty} className="rounded-lg border-[#D0D0D0] text-xs">
          <Undo2 size={12} className="mr-1" /> Undo
        </Button>
        <Button variant="outline" size="sm" onClick={clear} disabled={isEmpty} className="rounded-lg border-[#D0D0D0] text-xs">
          <Trash2 size={12} className="mr-1" /> Clear
        </Button>
        <Button size="sm" onClick={save} disabled={isEmpty} className="rounded-lg bg-[#E63228] hover:bg-[#c4231a] text-xs font-semibold ml-auto">
          <Plus size={12} className="mr-1" /> Use signature
        </Button>
      </div>
    </div>
  );
};

const SignPdf = () => {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [signature, setSignature] = useState<{ dataUrl: string; aspect: number } | null>(null);
  const [placements, setPlacements] = useState<PlacedSignature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ id: string; mode: "move" | "resize"; offsetX: number; offsetY: number } | null>(null);

  const handlePdfSelected = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const pdf = await loadPdfDocument(file);
      const images: string[] = [];
      const maxPages = Math.min(pdf.numPages, 30);
      for (let i = 1; i <= maxPages; i++) {
        const canvas = await renderPdfPageToCanvas(pdf, i, 1.5);
        images.push(canvas.toDataURL("image/jpeg", 0.85));
      }
      await pdf.destroy();
      setPdfFile(file);
      setPageImages(images);
      setCurrentPage(1);
      setPlacements([]);
      if (pdf.numPages > maxPages) {
        toast({ title: "Large document", description: `Showing the first ${maxPages} pages for signing.` });
      }
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Could not open PDF", description: "The file may be corrupted or password protected." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const reset = () => {
    setPdfFile(null);
    setPageImages([]);
    setPlacements([]);
    setSignature(null);
    setCurrentPage(1);
  };

  const addPlacement = useCallback(() => {
    if (!signature) return;
    const widthRatio = 0.28;
    const box = pageRef.current?.getBoundingClientRect();
    const pageAspect = box ? box.width / box.height : 0.707;
    const heightRatio = (widthRatio / signature.aspect) * pageAspect;
    setPlacements((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        pageNumber: currentPage,
        xRatio: 0.6,
        yRatio: 0.78,
        widthRatio,
        heightRatio,
        dataUrl: signature.dataUrl,
      },
    ]);
  }, [signature, currentPage]);

  const onPointerDownBox = (e: React.PointerEvent, id: string, mode: "move" | "resize") => {
    e.preventDefault();
    e.stopPropagation();
    const box = pageRef.current!.getBoundingClientRect();
    const placement = placements.find((p) => p.id === id)!;
    dragState.current = {
      id,
      mode,
      offsetX: (e.clientX - box.left) / box.width - placement.xRatio,
      offsetY: (e.clientY - box.top) / box.height - placement.yRatio,
    };
    setActiveId(id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMovePage = (e: React.PointerEvent) => {
    const state = dragState.current;
    if (!state || !pageRef.current) return;
    const box = pageRef.current.getBoundingClientRect();
    const px = (e.clientX - box.left) / box.width;
    const py = (e.clientY - box.top) / box.height;

    setPlacements((prev) =>
      prev.map((p) => {
        if (p.id !== state.id) return p;
        if (state.mode === "move") {
          return {
            ...p,
            xRatio: Math.min(Math.max(px - state.offsetX, 0), 1 - p.widthRatio),
            yRatio: Math.min(Math.max(py - state.offsetY, 0), 1 - p.heightRatio),
          };
        }
        const newWidth = Math.min(Math.max(px - p.xRatio, 0.05), 1 - p.xRatio);
        const scale = newWidth / p.widthRatio;
        const newHeight = Math.min(p.heightRatio * scale, 1 - p.yRatio);
        return { ...p, widthRatio: newWidth, heightRatio: newHeight };
      })
    );
  };

  const endDrag = () => { dragState.current = null; };

  const handleExport = useCallback(async () => {
    if (!pdfFile || placements.length === 0) return;
    setIsSaving(true);
    try {
      const signed = await signPdf(pdfFile, placements.map(({ id, ...rest }) => rest));
      downloadFile(signed, signed.name, "application/pdf");
      toast({ title: "Signed PDF ready", description: `${signed.name} downloaded.` });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Signing failed", description: "Could not write the signature into this PDF." });
    } finally {
      setIsSaving(false);
    }
  }, [pdfFile, placements, toast]);

  const pagePlacements = placements.filter((p) => p.pageNumber === currentPage);

  return (
    <section className="py-8 sm:py-10 bg-[#F5F5F5] min-h-[70vh]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <BackToTools />
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-0.5 bg-[#E63228]" />
            <span className="text-[#E63228] text-xs font-semibold uppercase tracking-widest">Sign</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] font-heading">Sign PDF</h1>
          <p className="text-[#666] text-sm mt-1">Draw your signature, drop it on any page, then drag and resize it into place</p>
        </div>

        {!pdfFile ? (
          <div className="max-w-2xl bg-white/90 backdrop-blur-sm border border-[#E0E0E0] rounded-xl p-6 shadow-sm">
            <FileUpload
              accept=".pdf,application/pdf"
              maxSizeInMB={50}
              multiple={false}
              onFilesSelected={handlePdfSelected}
              title={isLoading ? "Loading document…" : "Upload PDF File"}
              description="Drag & drop or click to browse"
              buttonText="Select PDF"
              icon={<FileText size={36} />}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-4 items-start">
            {/* Page canvas */}
            <div className="bg-white/90 backdrop-blur-sm border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm">
              <div className="bg-[#0A0A0A] px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
                <span className="text-white text-xs font-semibold uppercase tracking-widest truncate max-w-[55%]">{pdfFile.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    className="text-xs text-[#aaa] hover:text-white disabled:opacity-40"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                  <span className="text-xs text-white">{currentPage} / {pageImages.length}</span>
                  <button
                    className="text-xs text-[#aaa] hover:text-white disabled:opacity-40"
                    onClick={() => setCurrentPage((p) => Math.min(pageImages.length, p + 1))}
                    disabled={currentPage === pageImages.length}
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="p-3 sm:p-5 bg-[#FAFAFA]">
                <div
                  ref={pageRef}
                  className="relative mx-auto w-full max-w-[720px] select-none touch-none shadow-sm"
                  onPointerMove={onPointerMovePage}
                  onPointerUp={endDrag}
                  onPointerLeave={endDrag}
                >
                  <img src={pageImages[currentPage - 1]} alt={`Page ${currentPage}`} className="w-full h-auto block rounded-md" />

                  {pagePlacements.map((p) => (
                    <div
                      key={p.id}
                      className={`absolute rounded-md border ${activeId === p.id ? "border-[#E63228]" : "border-transparent hover:border-[#E63228]/50"}`}
                      style={{
                        left: `${p.xRatio * 100}%`,
                        top: `${p.yRatio * 100}%`,
                        width: `${p.widthRatio * 100}%`,
                        height: `${p.heightRatio * 100}%`,
                        cursor: "move",
                        touchAction: "none",
                      }}
                      onPointerDown={(e) => onPointerDownBox(e, p.id, "move")}
                    >
                      <img src={p.dataUrl} alt="Signature" className="w-full h-full object-fill pointer-events-none" />
                      <button
                        type="button"
                        onPointerDown={(e) => { e.stopPropagation(); }}
                        onClick={() => setPlacements((prev) => prev.filter((x) => x.id !== p.id))}
                        className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center"
                        aria-label="Remove signature"
                      >
                        <X size={11} />
                      </button>
                      <div
                        onPointerDown={(e) => onPointerDownBox(e, p.id, "resize")}
                        className="absolute -bottom-2 -right-2 w-4 h-4 rounded-sm bg-[#E63228] border-2 border-white cursor-se-resize"
                        style={{ touchAction: "none" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <div className="bg-white/90 backdrop-blur-sm border border-[#E0E0E0] rounded-xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <PenLine size={14} className="text-[#E63228]" />
                  <h4 className="text-sm font-semibold text-[#0A0A0A] uppercase tracking-wide">Draw signature</h4>
                </div>
                <SignaturePad onSave={(dataUrl, aspect) => { setSignature({ dataUrl, aspect }); toast({ title: "Signature saved", description: "Now place it on the page." }); }} />
              </div>

              {signature && (
                <div className="bg-white/90 backdrop-blur-sm border border-[#E0E0E0] rounded-xl p-4 sm:p-5 shadow-sm">
                  <h4 className="text-sm font-semibold text-[#0A0A0A] uppercase tracking-wide mb-3">Your signature</h4>
                  <div className="border border-[#E0E0E0] rounded-lg p-3 bg-[#FAFAFA] flex items-center justify-center">
                    <img src={signature.dataUrl} alt="Saved signature" className="max-h-16" />
                  </div>
                  <Button onClick={addPlacement} className="w-full mt-3 bg-[#E63228] hover:bg-[#c4231a] rounded-lg text-sm font-semibold">
                    <Plus size={14} className="mr-1.5" /> Place on page {currentPage}
                  </Button>
                </div>
              )}

              <Alert className="bg-white/80 border border-[#E0E0E0] rounded-xl">
                <AlertDescription className="text-xs text-[#666] leading-relaxed">
                  Drag the signature to move it, pull the red corner to resize. Everything stays in your browser —
                  nothing is uploaded. This adds a visible signature image, not a cryptographic digital signature.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleExport}
                  disabled={placements.length === 0 || isSaving}
                  className="bg-[#0A0A0A] text-white hover:bg-[#222] rounded-lg text-sm font-semibold"
                >
                  <Download size={14} className="mr-1.5" />
                  {isSaving ? "Preparing…" : `Download signed PDF (${placements.length})`}
                </Button>
                <Button variant="outline" onClick={reset} className="border-[#D0D0D0] rounded-lg text-sm">
                  Start over
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SignPdf;
