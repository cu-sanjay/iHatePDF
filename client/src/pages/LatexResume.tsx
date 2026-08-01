import BackToTools from "@/components/BackToTools";
import { useState, useCallback } from "react";
import { jsPDF } from "jspdf";
import { Download, Copy, FileText, ChevronDown, RefreshCw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { downloadFile } from "@/lib/fileUtils";

const TEMPLATES: Record<string, { name: string; code: string }> = {
  classic: {
    name: "Classic",
    code: `\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{hyperref}

\\begin{document}

\\begin{center}
{\\LARGE \\textbf{Your Full Name}}\\\\[4pt]
your.email@example.com $\\cdot$ +1 (555) 000-0000 $\\cdot$ City, Country\\\\
\\href{https://linkedin.com/in/yourprofile}{linkedin.com/in/yourprofile}
\\end{center}

\\hrule
\\vspace{6pt}

\\section*{Summary}
Results-driven software engineer with 5+ years of experience building scalable web applications. Proficient in TypeScript, React, and Node.js. Passionate about developer tooling and performance optimization.

\\hrule
\\section*{Experience}

\\textbf{Senior Software Engineer} \\hfill Jan 2022 -- Present\\\\
\\textit{Acme Corp, San Francisco, CA}
\\begin{itemize}
  \\item Led migration of monolith to microservices, reducing deployment time by 60\\%
  \\item Architected real-time data pipeline processing 10M events/day using Kafka
  \\item Mentored a team of 4 junior engineers through weekly code reviews
\\end{itemize}

\\textbf{Software Engineer} \\hfill Jun 2019 -- Dec 2021\\\\
\\textit{Startup Inc, New York, NY}
\\begin{itemize}
  \\item Built customer-facing dashboard serving 50K+ daily active users
  \\item Reduced API response time by 40\\% through query optimization and caching
  \\item Integrated Stripe payment processing and reduced churn by 15\\%
\\end{itemize}

\\hrule
\\section*{Education}

\\textbf{B.S. Computer Science} \\hfill 2015 -- 2019\\\\
\\textit{State University, City, State}\\\\
GPA: 3.8/4.0 $\\cdot$ Dean's List 4 semesters

\\hrule
\\section*{Skills}
\\textbf{Languages:} TypeScript, JavaScript, Python, Go\\\\
\\textbf{Frameworks:} React, Next.js, Node.js, Express, FastAPI\\\\
\\textbf{Infrastructure:} AWS, Docker, Kubernetes, Terraform\\\\
\\textbf{Databases:} PostgreSQL, Redis, MongoDB

\\end{document}`,
  },
  minimal: {
    name: "Minimal",
    code: `\\documentclass[10pt,a4paper]{article}
\\usepackage[margin=0.8in]{geometry}

\\begin{document}

{\\huge \\textbf{Your Name}}\\\\[2pt]
{\\small your.email@example.com $\\cdot$ +1 (555) 000-0000 $\\cdot$ yourwebsite.com}

\\vspace{8pt}
\\hrule
\\vspace{6pt}

\\section*{Work Experience}

\\textbf{Job Title}, Company Name \\hfill 2022 -- Present
\\begin{itemize}
  \\item Key achievement or responsibility
  \\item Another key achievement with measurable impact
  \\item Third responsibility or skill demonstrated
\\end{itemize}

\\textbf{Previous Role}, Previous Company \\hfill 2020 -- 2022
\\begin{itemize}
  \\item Key achievement
  \\item Another achievement
\\end{itemize}

\\hrule
\\section*{Education}
\\textbf{Degree Name}, University Name \\hfill 2016 -- 2020

\\hrule
\\section*{Technical Skills}
\\textbf{Core:} Skill 1, Skill 2, Skill 3, Skill 4\\\\
\\textbf{Tools:} Tool 1, Tool 2, Tool 3

\\end{document}`,
  },
  academic: {
    name: "Academic / CV",
    code: `\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=1in]{geometry}

\\begin{document}

\\begin{center}
{\\Large \\textbf{Dr. Your Name}}\\\\[4pt]
Department of Computer Science $\\cdot$ Your University\\\\
your.email@university.edu $\\cdot$ scholar.google.com/yourprofile
\\end{center}

\\hrule
\\section*{Research Interests}
Machine learning, distributed systems, programming language theory, and formal verification.

\\hrule
\\section*{Education}

\\textbf{Ph.D. Computer Science} \\hfill 2018 -- 2023\\\\
\\textit{Top University, City, Country}\\\\
Thesis: "Title of Your Doctoral Thesis"\\\\
Advisor: Prof. Advisor Name

\\textbf{B.S. Computer Science (Honors)} \\hfill 2014 -- 2018\\\\
\\textit{Another University, City, Country}\\\\
GPA: 3.95/4.0

\\hrule
\\section*{Selected Publications}
\\begin{itemize}
  \\item \\textbf{Your Name}, Co-Author. "Paper Title." \\textit{Conference/Journal Name}, 2023.
  \\item \\textbf{Your Name}, Co-Author, Co-Author. "Another Paper." \\textit{Top Venue}, 2022.
  \\item \\textbf{Your Name}, Advisor. "Workshop Paper." \\textit{Workshop Name}, 2021.
\\end{itemize}

\\hrule
\\section*{Awards \\& Honors}
\\begin{itemize}
  \\item Best Paper Award, Conference Name, 2023
  \\item Fellowship Name, 2020 -- 2022
  \\item Graduate Research Grant, 2019
\\end{itemize}

\\hrule
\\section*{Teaching}
\\textbf{Teaching Assistant}, Algorithms (CS301) \\hfill Fall 2021\\\\
\\textbf{Teaching Assistant}, Data Structures (CS201) \\hfill Spring 2020

\\end{document}`,
  },
};

function parseLatexToPdf(latex: string, doc: jsPDF) {
  let content = latex;
  const docStart = content.indexOf("\\begin{document}");
  if (docStart !== -1) content = content.slice(docStart + 16);
  const docEnd = content.indexOf("\\end{document}");
  if (docEnd !== -1) content = content.slice(0, docEnd);

  const cleanInline = (text: string) =>
    text
      .replace(/\\textbf\{([^}]*)\}/g, "$1")
      .replace(/\\textit\{([^}]*)\}/g, "$1")
      .replace(/\\emph\{([^}]*)\}/g, "$1")
      .replace(/\\href\{[^}]*\}\{([^}]*)\}/g, "$1")
      .replace(/\\url\{([^}]*)\}/g, "$1")
      .replace(/\\LARGE\s*/g, "")
      .replace(/\\Large\s*/g, "")
      .replace(/\\large\s*/g, "")
      .replace(/\\small\s*/g, "")
      .replace(/\{([^{}]*)\}/g, "$1")
      .replace(/\\\\/g, " ")
      .replace(/\\cdot/g, "·")
      .replace(/\\%/g, "%")
      .replace(/\\hfill/g, "  ")
      .replace(/~~/g, " ")
      .replace(/~/g, " ")
      .replace(/---/g, "—")
      .replace(/--/g, "–")
      .replace(/\\\[[\s\S]*?\\\]/g, "")
      .replace(/\$[^$]*\$/g, "")
      .trim();

  const lines = content.split("\n");
  const pageH = 297;
  const pageW = 210;
  const lm = 18;
  const rm = pageW - lm;
  const maxW = rm - lm;
  let y = 20;

  const newPage = () => { doc.addPage(); y = 20; };
  const checkPage = (needed = 8) => { if (y + needed > pageH - 15) newPage(); };

  let inCenter = false;
  let inItemize = false;
  let inAbstract = false;
  let skipEnv = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (!trimmed) { y += 3; continue; }
    if (trimmed.startsWith("%")) continue;
    if (trimmed.startsWith("\\usepackage") || trimmed.startsWith("\\documentclass") || trimmed.startsWith("\\geometry")) continue;
    if (trimmed.startsWith("\\vspace")) { y += 4; continue; }
    if (trimmed.startsWith("\\newpage")) { newPage(); continue; }

    if (trimmed === "\\begin{center}") { inCenter = true; continue; }
    if (trimmed === "\\end{center}") { inCenter = false; y += 2; continue; }
    if (trimmed === "\\begin{abstract}") { inAbstract = true; continue; }
    if (trimmed === "\\end{abstract}") { inAbstract = false; y += 3; continue; }

    if (trimmed === "\\begin{itemize}" || trimmed === "\\begin{enumerate}") { inItemize = true; continue; }
    if (trimmed === "\\end{itemize}" || trimmed === "\\end{enumerate}") { inItemize = false; y += 2; continue; }

    if (trimmed.match(/^\\begin\{(?!document|center|itemize|enumerate|abstract)/)) { skipEnv = true; continue; }
    if (trimmed.match(/^\\end\{(?!document|center|itemize|enumerate|abstract)/)) { skipEnv = false; continue; }
    if (skipEnv) continue;

    if (trimmed === "\\hrule" || trimmed === "\\hline") {
      checkPage(5);
      doc.setDrawColor(10, 10, 10);
      doc.setLineWidth(0.3);
      doc.line(lm, y, rm, y);
      y += 4;
      continue;
    }

    const secMatch = trimmed.match(/^\\section\*?\{([^}]*)\}/);
    if (secMatch) {
      checkPage(12);
      y += 2;
      const title = cleanInline(secMatch[1]).toUpperCase();
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(10, 10, 10);
      doc.text(title, lm, y);
      y += 5;
      continue;
    }

    const subsecMatch = trimmed.match(/^\\subsection\*?\{([^}]*)\}/);
    if (subsecMatch) {
      checkPage(8);
      const title = cleanInline(subsecMatch[1]);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(10, 10, 10);
      doc.text(title, lm, y);
      y += 5;
      continue;
    }

    if (inItemize && trimmed.startsWith("\\item")) {
      checkPage(6);
      const txt = cleanInline(trimmed.replace(/^\\item\s*/, ""));
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      const split = doc.splitTextToSize("• " + txt, maxW - 8);
      doc.text(split, lm + 5, y);
      y += split.length * 4.5;
      continue;
    }

    if (inCenter) {
      const txt = cleanInline(trimmed);
      if (!txt) continue;
      // detect large names
      const isName = trimmed.includes("\\LARGE") || trimmed.includes("\\huge") || trimmed.includes("\\Huge");
      if (isName) {
        checkPage(10);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(10, 10, 10);
        doc.text(txt, pageW / 2, y, { align: "center" });
        y += 8;
      } else {
        checkPage(6);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        doc.text(txt, pageW / 2, y, { align: "center" });
        y += 5;
      }
      continue;
    }

    // detect bold inline lines (company/title lines)
    const isBoldLine = trimmed.startsWith("\\textbf{") || (trimmed.includes("\\textbf{") && trimmed.length < 100);
    const hasHfill = trimmed.includes("\\hfill");

    if (hasHfill) {
      checkPage(6);
      const parts = trimmed.split("\\hfill");
      const left = cleanInline(parts[0]);
      const right = cleanInline(parts[1] || "");
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(10, 10, 10);
      doc.text(left, lm, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(right, rm, y, { align: "right" });
      y += 5;
      continue;
    }

    const txt = cleanInline(trimmed);
    if (!txt) continue;

    checkPage(6);
    if (inAbstract || (!isBoldLine && !inCenter)) {
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
    } else {
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(10, 10, 10);
    }

    const split = doc.splitTextToSize(txt, maxW);
    doc.text(split, lm, y);
    y += split.length * 4.5 + 0.5;
  }
}

const LatexResume = () => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("classic");
  const [code, setCode] = useState(TEMPLATES.classic.code);
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const handleTemplateSelect = (key: string) => {
    setSelectedTemplate(key);
    setCode(TEMPLATES[key].code);
    setShowTemplates(false);
  };

  const handleDownloadTex = useCallback(() => {
    const blob = new Blob([code], { type: "text/plain" });
    downloadFile(blob, "resume.tex", "text/plain");
    toast({ title: "Downloaded", description: "resume.tex saved to your device." });
  }, [code, toast]);

  const handleRefreshPreview = useCallback(() => {
    setIsRefreshing(true);
    requestAnimationFrame(() => setIsRefreshing(false));
    toast({ title: "Preview refreshed", description: "Your resume preview has been updated." });
  }, [toast]);

  const handleExportPdf = useCallback(async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      parseLatexToPdf(code, doc);
      const blob = doc.output("blob");
      downloadFile(blob, "resume.pdf", "application/pdf");
      toast({ title: "Exported", description: "resume.pdf downloaded successfully." });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Export failed", description: "Could not parse your LaTeX. Check the syntax." });
    } finally {
      setIsExporting(false);
    }
  }, [code, toast]);

  return (
    <section className="bg-[#F5F5F5] min-h-[80vh] py-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-0.5 bg-[#E63228]" />
              <span className="text-[#E63228] text-xs font-semibold uppercase tracking-widest">Create</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0A0A0A] font-heading">LaTeX Resume</h1>
            <p className="text-[#666] text-sm mt-0.5">Write or edit LaTeX, then export to PDF or download the source</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowTemplates(!showTemplates)}
                className="border-[#D0D0D0] text-[#0A0A0A] hover:bg-[#F0F0F0] rounded-none text-sm font-medium"
              >
                <FileText size={14} className="mr-1.5" />
                {TEMPLATES[selectedTemplate].name}
                <ChevronDown size={13} className="ml-1.5" />
              </Button>
              {showTemplates && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-[#E0E0E0] z-20 min-w-[150px] shadow-lg">
                  {Object.entries(TEMPLATES).map(([key, t]) => (
                    <button
                      key={key}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#F5F5F5] transition-colors ${selectedTemplate === key ? "text-[#E63228] font-semibold" : "text-[#0A0A0A]"}`}
                      onClick={() => handleTemplateSelect(key)}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={handleDownloadTex}
              className="border-[#D0D0D0] text-[#0A0A0A] hover:bg-[#F0F0F0] rounded-none text-sm font-medium"
            >
              <Download size={14} className="mr-1.5" /> .tex
            </Button>

            <Button
              variant="outline"
              onClick={handleRefreshPreview}
              disabled={isRefreshing}
              className="border-[#D0D0D0] text-[#0A0A0A] hover:bg-[#F0F0F0] rounded-none text-sm font-medium"
            >
              <RefreshCw size={14} className={`mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh Preview
            </Button>

            <Button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="bg-[#E63228] text-white hover:bg-[#c4231a] rounded-none text-sm font-semibold"
            >
              <Download size={14} className="mr-1.5" />
              {isExporting ? "Exporting..." : "Export PDF"}
            </Button>
          </div>
        </div>

        <Alert className="bg-[#FFFAF5] border border-[#E63228]/30 mb-4">
          <AlertDescription className="text-xs text-[#555] leading-relaxed">
            <strong className="text-[#0A0A0A]">LaTeX subset supported:</strong>{" "}
            <code className="font-mono bg-[#F0F0F0] px-1 py-0.5 text-[10px]">\section</code>,{" "}
            <code className="font-mono bg-[#F0F0F0] px-1 py-0.5 text-[10px]">\subsection</code>,{" "}
            <code className="font-mono bg-[#F0F0F0] px-1 py-0.5 text-[10px]">\textbf</code>,{" "}
            <code className="font-mono bg-[#F0F0F0] px-1 py-0.5 text-[10px]">\textit</code>,{" "}
            <code className="font-mono bg-[#F0F0F0] px-1 py-0.5 text-[10px]">itemize</code>,{" "}
            <code className="font-mono bg-[#F0F0F0] px-1 py-0.5 text-[10px]">\hrule</code>,{" "}
            <code className="font-mono bg-[#F0F0F0] px-1 py-0.5 text-[10px]">\hfill</code> and basic text.
            For full compilation, download .tex and use pdflatex locally.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <div className="bg-white/90 backdrop-blur-sm border border-[#E0E0E0] rounded-xl shadow-sm overflow-hidden">
            <div className="bg-[#0A0A0A] px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#E63228]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#444]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#444]" />
              </div>
              <span className="text-[#666] text-xs font-mono ml-2">resume.tex</span>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(code); toast({ title: "Copied to clipboard" }); }}
              className="text-[#666] hover:text-white text-xs flex items-center gap-1 transition-colors"
            >
              <Copy size={12} /> Copy
            </button>
            </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="w-full min-h-[560px] p-5 font-mono text-[13px] leading-relaxed text-[#0A0A0A] bg-[#FFFDFD] border-0 outline-none resize-y focus:bg-white transition-colors"
            style={{ tabSize: 2 }}
            placeholder="Write your LaTeX resume here..."
          />
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-[#E0E0E0] rounded-xl shadow-sm overflow-hidden">
            <div className="bg-[#0A0A0A] px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye size={14} className="text-white" />
                <span className="text-white text-xs font-semibold uppercase tracking-widest">Preview</span>
              </div>
              <span className="text-[#E63228] text-xs">{selectedTemplate}</span>
            </div>
            <div className="p-4 min-h-[560px] bg-[#FFFDFD]">
              <div className="border border-[#E0E0E0] bg-white p-4 sm:p-6 shadow-sm">
                <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-[#0A0A0A] font-mono overflow-auto max-h-[520px]">
{code}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[#aaa] text-xs mt-2 text-right">
          Lines: {code.split("\n").length} · Characters: {code.length}
        </p>
      </div>
    </section>
  );
};

export default LatexResume;
