import { useCallback, useState } from "react";
import BackToTools from "@/components/BackToTools";
import FileUpload from "@/components/FileUpload";
import FilePreview from "@/components/FilePreview";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { downloadFile, formatFileSize, generateFilePreview } from "@/lib/fileUtils";
import { Download, ImageDown } from "lucide-react";

const compressImage = async (file: File, quality: number, maxWidth: number): Promise<File> => {
  const source = await createImageBitmap(file);
  const ratio = Math.min(1, maxWidth / source.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(source.width * ratio));
  canvas.height = Math.max(1, Math.round(source.height * ratio));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  source.close();
  const outputType = file.type === "image/png" ? "image/webp" : "image/jpeg";
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Image encoding failed")), outputType, quality / 100),
  );
  const extension = outputType === "image/webp" ? "webp" : "jpg";
  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}_compressed.${extension}`, { type: outputType });
};

const CompressImage = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [quality, setQuality] = useState(76);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [result, setResult] = useState<File | null>(null);
  const [resultPreview, setResultPreview] = useState("");
  const [working, setWorking] = useState(false);

  const select = useCallback(async (files: File[]) => {
    const selected = files[0];
    if (!selected) return;
    setFile(selected);
    setPreview(await generateFilePreview(selected));
    setResult(null);
    setResultPreview("");
  }, []);

  const run = useCallback(async () => {
    if (!file) return;
    setWorking(true);
    try {
      const compressed = await compressImage(file, quality, maxWidth);
      setResult(compressed);
      setResultPreview(await generateFilePreview(compressed));
      toast({ title: "Image compressed", description: `${formatFileSize(file.size)} → ${formatFileSize(compressed.size)}` });
    } catch {
      toast({ variant: "destructive", title: "Compression failed" });
    } finally {
      setWorking(false);
    }
  }, [file, maxWidth, quality, toast]);

  const reset = () => { setFile(null); setPreview(""); setResult(null); setResultPreview(""); };

  return (
    <section className="min-h-[70vh] bg-[#F5F5F5] py-8 sm:py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <BackToTools />
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#E63228]">Optimize</p>
          <h1 className="mt-2 text-2xl font-bold text-[#0A0A0A]">Compress Image</h1>
          <p className="mt-1 text-sm text-[#666]">Resize and compress JPG, PNG or WebP images directly on your device.</p>
        </div>
        <div className="max-w-4xl rounded-[28px] border border-white/80 bg-white/65 p-5 shadow-[0_30px_90px_-60px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-7">
          {!file ? (
            <FileUpload accept="image/*" multiple={false} maxSizeInMB={50} onFilesSelected={select} title="Choose an image" buttonText="Select image" icon={<ImageDown size={34} />} />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <FilePreview files={[file]} fileType="image" previewUrls={[preview]} onRemoveAll={reset} />
                <div className="space-y-5 rounded-2xl border border-black/[0.07] bg-white/70 p-4">
                  <div><Label>Quality — {quality}%</Label><Slider value={[quality]} min={20} max={95} step={1} onValueChange={(value) => setQuality(value[0])} className="mt-3" /></div>
                  <div><Label htmlFor="max-width">Maximum width</Label><input id="max-width" type="number" min="320" max="8000" value={maxWidth} onChange={(event) => setMaxWidth(Math.max(320, Number(event.target.value)))} className="mt-2 h-10 w-full rounded-xl border border-[#D0D0D0] bg-white px-3 text-sm outline-none focus:border-[#E63228]" /></div>
                  <Button onClick={run} disabled={working} className="w-full rounded-xl bg-[#E63228] text-white hover:bg-[#c4231a]">{working ? "Compressing…" : "Compress image"}</Button>
                </div>
              </div>
              <div className="min-h-64 rounded-2xl border border-black/[0.07] bg-white/70 p-4">
                {result ? <><img src={resultPreview} alt="Compressed image preview" className="max-h-[420px] w-full rounded-xl bg-[#FAFAFA] object-contain" /><div className="mt-4 grid grid-cols-2 gap-2 text-center text-sm"><div className="rounded-xl bg-[#F5F5F5] p-3"><span className="block text-xs text-[#888]">Original</span><strong>{formatFileSize(file.size)}</strong></div><div className="rounded-xl bg-[#FFF3F1] p-3"><span className="block text-xs text-[#888]">Compressed</span><strong className="text-[#E63228]">{formatFileSize(result.size)}</strong></div></div><Button onClick={() => downloadFile(result, result.name, result.type)} className="mt-4 w-full rounded-xl bg-[#E63228] text-white hover:bg-[#c4231a]"><Download size={15} /> Download</Button></> : <div className="grid h-full min-h-60 place-items-center text-center text-sm text-[#888]">Your compressed image preview will appear here.</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CompressImage;