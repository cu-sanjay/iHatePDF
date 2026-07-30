import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import "katex/dist/katex.min.css";
import { Download, Copy, Sigma, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { downloadFile } from "@/lib/fileUtils";
import {
  renderEquationHtml,
  validateLatex,
  equationToImage,
  EQUATION_EXAMPLES,
  SYMBOL_PALETTE,
} from "@/lib/mathUtils";

const EquationImage = () => {
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [latex, setLatex] = useState("E = mc^2");
  const [displayMode, setDisplayMode] = useState(true);
  const [transparent, setTransparent] = useState(true);
  const [format, setFormat] = useState<"png" | "jpg">("png");
  const [resolution, setResolution] = useState(3);
  const [color, setColor] = useState("#0A0A0A");
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState<{ dataUrl: string; width: number; height: number; blob: Blob } | null>(null);

  const error = useMemo(() => (latex.trim() ? validateLatex(latex) : null), [latex]);
  const previewHtml = useMemo(
    () => (latex.trim() ? renderEquationHtml(latex, displayMode) : ""),
    [latex, displayMode]
  );

  useEffect(() => {
    setResult(null);
  }, [latex, displayMode, transparent, format, resolution, color]);

  const insertSnippet = useCallback((snippet: string) => {
    const el = textareaRef.current;
    if (!el) {
      setLatex((prev) => prev + snippet);
      return;
    }
    const start = el.selectionStart ?? latex.length;
    const end = el.selectionEnd ?? latex.length;
    const next = latex.slice(0, start) + snippet + latex.slice(end);
    setLatex(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + snippet.length, start + snippet.length);
    });
  }, [latex]);

  const handleGenerate = useCallback(async () => {
    if (!latex.trim()) return;
    setIsExporting(true);
    try {
      const image = await equationToImage(latex, {
        displayMode,
        format,
        scale: resolution,
        color,
        background: transparent && format === "png" ? null : "#ffffff",
        fontSizePx: 44,
        padding: 10,
      });
      setResult(image);
      toast({ title: "Equation rendered", description: `${image.width} × ${image.height} px` });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Render failed", description: "Check your LaTeX syntax and try again." });
    } finally {
      setIsExporting(false);
    }
  }, [latex, displayMode, format, resolution, color, transparent, toast]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    downloadFile(result.blob, `equation.${format}`, result.blob.type);
    toast({ title: "Downloaded", description: `equation.${format} saved to your device.` });
  }, [result, format, toast]);

  const handleCopyImage = useCallback(async () => {
    if (!result) return;
    try {
      const item = new ClipboardItem({ [result.blob.type]: result.blob });
      await navigator.clipboard.write([item]);
      toast({ title: "Copied", description: "Image copied to clipboard." });
    } catch {
      toast({ variant: "destructive", title: "Copy not supported", description: "Use the download button instead." });
    }
  }, [result, toast]);

  return (
    <section className="py-8 sm:py-10 bg-[#F5F5F5] min-h-[70vh]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-0.5 bg-[#E63228]" />
            <span className="text-[#E63228] text-xs font-semibold uppercase tracking-widest">Create</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] font-heading">Equation to Image</h1>
          <p className="text-[#666] text-sm mt-1">
            Write maths in LaTeX and export a tightly cropped PNG or JPG for papers, reports and slides
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {/* Editor */}
          <div className="bg-white/90 backdrop-blur-sm border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm">
            <div className="bg-[#0A0A0A] px-4 py-2 flex items-center gap-2">
              <Sigma size={14} className="text-[#E63228]" />
              <span className="text-white text-xs font-semibold uppercase tracking-widest">LaTeX input</span>
            </div>

            <div className="p-4 sm:p-5">
              <textarea
                ref={textareaRef}
                value={latex}
                onChange={(e) => setLatex(e.target.value)}
                spellCheck={false}
                rows={5}
                className="w-full p-3 font-mono text-[13px] leading-relaxed text-[#0A0A0A] bg-[#FAFAFA] border border-[#E0E0E0] rounded-lg outline-none resize-y focus:border-[#E63228] transition-colors"
                placeholder="e.g. \frac{-b \pm \sqrt{b^2-4ac}}{2a}"
              />

              {error && (
                <Alert variant="destructive" className="mt-3 rounded-lg">
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}

              <div className="mt-4 space-y-3">
                {SYMBOL_PALETTE.map((group) => (
                  <div key={group.group}>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] mb-1.5">{group.group}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.items.map((item) => (
                        <button
                          key={item.label + item.insert}
                          type="button"
                          onClick={() => insertSnippet(item.insert)}
                          className="px-2.5 py-1.5 text-xs font-mono bg-[#F5F5F5] border border-[#E0E0E0] rounded-md text-[#0A0A0A] hover:border-[#E63228] hover:text-[#E63228] transition-colors"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] mb-1.5">Examples</p>
                <div className="flex flex-wrap gap-1.5">
                  {EQUATION_EXAMPLES.map((ex) => (
                    <button
                      key={ex.label}
                      type="button"
                      onClick={() => setLatex(ex.latex)}
                      className="px-2.5 py-1.5 text-xs bg-white border border-[#E0E0E0] rounded-md text-[#555] hover:border-[#E63228] hover:text-[#E63228] transition-colors"
                    >
                      {ex.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setLatex("")}
                    className="px-2.5 py-1.5 text-xs bg-white border border-[#E0E0E0] rounded-md text-[#555] hover:border-[#E63228] hover:text-[#E63228] transition-colors inline-flex items-center gap-1"
                  >
                    <Trash2 size={11} /> Clear
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview + options */}
          <div className="space-y-4">
            <div className="bg-white/90 backdrop-blur-sm border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm">
              <div className="bg-[#0A0A0A] px-4 py-2 flex items-center justify-between">
                <span className="text-white text-xs font-semibold uppercase tracking-widest">Live preview</span>
                <span className="text-[#E63228] text-xs">{displayMode ? "display" : "inline"}</span>
              </div>
              <div
                className="p-6 min-h-[140px] flex items-center justify-center overflow-x-auto rounded-b-xl"
                style={{
                  backgroundImage:
                    transparent && format === "png"
                      ? "linear-gradient(45deg,#eee 25%,transparent 25%),linear-gradient(-45deg,#eee 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eee 75%),linear-gradient(-45deg,transparent 75%,#eee 75%)"
                      : undefined,
                  backgroundSize: "16px 16px",
                  backgroundPosition: "0 0,0 8px,8px -8px,-8px 0px",
                  backgroundColor: transparent && format === "png" ? "#fff" : "#fff",
                }}
              >
                {latex.trim() ? (
                  <div
                    style={{ color, fontSize: 30 }}
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                ) : (
                  <p className="text-[#aaa] text-sm">Your equation preview appears here</p>
                )}
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm border border-[#E0E0E0] rounded-xl p-4 sm:p-5 shadow-sm">
              <h4 className="text-sm font-semibold text-[#0A0A0A] mb-4 uppercase tracking-wide">Export options</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-[#555] uppercase tracking-wide">Format</Label>
                  <Select value={format} onValueChange={(v: "png" | "jpg") => setFormat(v)}>
                    <SelectTrigger className="mt-1 border-[#D0D0D0] rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG (supports transparency)</SelectItem>
                      <SelectItem value="jpg">JPG (white background)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-[#555] uppercase tracking-wide">Text colour</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-9 w-12 rounded-lg border border-[#D0D0D0] bg-white p-1 cursor-pointer"
                      aria-label="Equation colour"
                    />
                    <span className="text-xs font-mono text-[#666]">{color}</span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <Label className="text-xs font-semibold text-[#555] uppercase tracking-wide">
                    Resolution — {resolution}× ({Math.round(resolution * 96)} DPI equivalent)
                  </Label>
                  <Slider
                    value={[resolution]}
                    min={1}
                    max={6}
                    step={1}
                    onValueChange={(v) => setResolution(v[0])}
                    className="mt-3"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 rounded-lg border border-[#E0E0E0] px-3 py-2">
                  <Label htmlFor="display-mode" className="text-xs text-[#555]">Display mode</Label>
                  <Switch id="display-mode" checked={displayMode} onCheckedChange={setDisplayMode} />
                </div>

                <div className="flex items-center justify-between gap-3 rounded-lg border border-[#E0E0E0] px-3 py-2">
                  <Label htmlFor="transparent-bg" className="text-xs text-[#555]">Transparent background</Label>
                  <Switch
                    id="transparent-bg"
                    checked={transparent && format === "png"}
                    disabled={format !== "png"}
                    onCheckedChange={setTransparent}
                  />
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!latex.trim() || isExporting}
                className="w-full mt-5 bg-[#E63228] text-white hover:bg-[#c4231a] rounded-lg text-sm font-semibold"
              >
                <ImageIcon size={14} className="mr-1.5" />
                {isExporting ? "Rendering…" : "Generate image"}
              </Button>
            </div>

            {result && (
              <div className="bg-white/90 backdrop-blur-sm border border-[#E0E0E0] rounded-xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-[#0A0A0A] uppercase tracking-wide">Result</h4>
                  <span className="text-xs text-[#888]">{result.width} × {result.height} px</span>
                </div>
                <div className="border border-[#E0E0E0] rounded-lg p-4 flex items-center justify-center overflow-x-auto bg-[#FAFAFA]">
                  <img src={result.dataUrl} alt="Rendered LaTeX equation" className="max-w-full h-auto" />
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button onClick={handleDownload} className="bg-[#E63228] text-white hover:bg-[#c4231a] rounded-lg text-sm font-semibold">
                    <Download size={14} className="mr-1.5" /> Download .{format}
                  </Button>
                  <Button variant="outline" onClick={handleCopyImage} className="border-[#D0D0D0] rounded-lg text-sm">
                    <Copy size={14} className="mr-1.5" /> Copy image
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { navigator.clipboard.writeText(latex); toast({ title: "LaTeX copied" }); }}
                    className="border-[#D0D0D0] rounded-lg text-sm"
                  >
                    <Copy size={14} className="mr-1.5" /> Copy LaTeX
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EquationImage;
