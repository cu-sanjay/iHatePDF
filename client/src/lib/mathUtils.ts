import katex from "katex";
import { toJpeg, toPng } from "html-to-image";

export interface EquationRenderOptions {
  displayMode?: boolean;
  fontSizePx?: number;
  /** pixel density multiplier for the exported raster */
  scale?: number;
  color?: string;
  background?: string | null; // null = transparent
  padding?: number;
  format?: "png" | "jpg";
}

export const validateLatex = (latex: string): string | null => {
  try {
    katex.renderToString(latex, { throwOnError: true, displayMode: true });
    return null;
  } catch (error) {
    return error instanceof Error ? error.message.replace(/^KaTeX parse error:\s*/, "") : "Invalid LaTeX";
  }
};

export const renderEquationHtml = (latex: string, displayMode = true): string =>
  katex.renderToString(latex, {
    throwOnError: false,
    displayMode,
    output: "html",
    strict: false,
    trust: true,
  });

export interface EquationImageResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Renders a LaTeX equation to a tightly cropped raster image
 * (PNG with optional transparency, or JPG on white).
 */
export const equationToImage = async (
  latex: string,
  options: EquationRenderOptions = {}
): Promise<EquationImageResult> => {
  const {
    displayMode = true,
    fontSizePx = 44,
    scale = 3,
    color = "#0A0A0A",
    background = null,
    padding = 18,
    format = "png",
  } = options;

  const transparent = background === null && format === "png";

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.position = "fixed";
  host.style.left = "0";
  host.style.top = "0";
  host.style.zIndex = "-1";
  host.style.pointerEvents = "none";
  host.style.display = "inline-block";
  host.style.padding = `${padding}px ${padding + 4}px`;
  host.style.color = color;
  host.style.fontSize = `${fontSizePx}px`;
  host.style.overflow = "visible";
  host.style.background = transparent ? "transparent" : background ?? "#ffffff";
  host.innerHTML = renderEquationHtml(latex, displayMode);
  const katexDisplay = host.querySelector<HTMLElement>(".katex-display");
  if (katexDisplay) {
    katexDisplay.style.margin = "0";
    katexDisplay.style.padding = "0.18em 0";
    katexDisplay.style.overflow = "visible";
  }

  document.body.appendChild(host);

  try {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
    // Give KaTeX fonts one frame to apply before rasterising
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    const bounds = host.getBoundingClientRect();
    const renderOptions = {
      pixelRatio: scale,
      cacheBust: true,
      skipFonts: true,
      backgroundColor: transparent ? undefined : background ?? "#ffffff",
    };
    const dataUrl = format === "jpg"
      ? await toJpeg(host, { ...renderOptions, quality: 0.95 })
      : await toPng(host, renderOptions);
    const blob = await fetch(dataUrl).then((response) => response.blob());

    return {
      blob,
      dataUrl,
      width: Math.max(1, Math.ceil(bounds.width * scale)),
      height: Math.max(1, Math.ceil(bounds.height * scale)),
    };
  } finally {
    host.remove();
  }
};

export const EQUATION_EXAMPLES: { label: string; latex: string }[] = [
  { label: "Quadratic formula", latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}" },
  { label: "Gaussian integral", latex: "\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}" },
  { label: "Matrix", latex: "A = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}" },
  { label: "Summation", latex: "\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}" },
  { label: "Bayes' theorem", latex: "P(A \\mid B) = \\frac{P(B \\mid A)\\,P(A)}{P(B)}" },
  { label: "Limit definition", latex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}" },
  { label: "Schrödinger", latex: "i\\hbar \\frac{\\partial}{\\partial t}\\Psi = \\hat{H}\\Psi" },
  { label: "Chemistry", latex: "\\mathrm{6CO_2 + 6H_2O \\rightarrow C_6H_{12}O_6 + 6O_2}" },
];

export const SYMBOL_PALETTE: { group: string; items: { label: string; insert: string }[] }[] = [
  {
    group: "Structure",
    items: [
      { label: "a/b", insert: "\\frac{a}{b}" },
      { label: "√", insert: "\\sqrt{x}" },
      { label: "xⁿ", insert: "x^{n}" },
      { label: "xₙ", insert: "x_{n}" },
      { label: "∑", insert: "\\sum_{i=1}^{n}" },
      { label: "∏", insert: "\\prod_{i=1}^{n}" },
      { label: "∫", insert: "\\int_{a}^{b}" },
      { label: "lim", insert: "\\lim_{x \\to 0}" },
      { label: "matrix", insert: "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}" },
      { label: "cases", insert: "\\begin{cases} a & x>0 \\\\ b & x\\le 0 \\end{cases}" },
    ],
  },
  {
    group: "Greek",
    items: [
      { label: "α", insert: "\\alpha" },
      { label: "β", insert: "\\beta" },
      { label: "γ", insert: "\\gamma" },
      { label: "Δ", insert: "\\Delta" },
      { label: "θ", insert: "\\theta" },
      { label: "λ", insert: "\\lambda" },
      { label: "μ", insert: "\\mu" },
      { label: "π", insert: "\\pi" },
      { label: "σ", insert: "\\sigma" },
      { label: "Ω", insert: "\\Omega" },
    ],
  },
  {
    group: "Relations",
    items: [
      { label: "≤", insert: "\\le" },
      { label: "≥", insert: "\\ge" },
      { label: "≠", insert: "\\neq" },
      { label: "≈", insert: "\\approx" },
      { label: "→", insert: "\\to" },
      { label: "⇒", insert: "\\Rightarrow" },
      { label: "∈", insert: "\\in" },
      { label: "∞", insert: "\\infty" },
      { label: "±", insert: "\\pm" },
      { label: "·", insert: "\\cdot" },
    ],
  },
];
