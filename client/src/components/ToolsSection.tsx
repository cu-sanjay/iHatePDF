import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const tools = [
  {
    id: "merge-pdfs",
    title: "Merge PDFs",
    description: "Combine multiple PDF files into one document. Drag-and-drop reordering.",
    tag: "Combine",
    link: "/merge-pdfs",
    featured: false,
  },
  {
    id: "split-pdf",
    title: "Split PDF",
    description: "Extract specific pages or split a PDF into multiple files. Custom page ranges.",
    tag: "Extract",
    link: "/split-pdf",
    featured: false,
  },
  {
    id: "compress-pdf",
    title: "Compress PDF",
    description: "Reduce PDF size while keeping quality. Low / medium / high compression.",
    tag: "Reduce Size",
    link: "/compress-pdf",
    featured: false,
  },
  {
    id: "pdf-to-image",
    title: "PDF to Image",
    description: "Convert PDF pages to JPG, PNG, or WebP. Custom quality and page range.",
    tag: "Convert",
    link: "/pdf-to-image",
    featured: false,
  },
  {
    id: "image-to-pdf",
    title: "Image to PDF",
    description: "Turn JPG, PNG, or WebP images into a PDF. Supports multi-image, rotation.",
    tag: "Convert",
    link: "/image-to-pdf",
    featured: false,
  },
  {
    id: "watermark-pdf",
    title: "Watermark PDF",
    description: "Add diagonal text watermarks to every page. Custom text, opacity, and size.",
    tag: "Annotate",
    link: "/watermark-pdf",
    featured: false,
  },
  {
    id: "lock-pdf",
    title: "Protect PDF",
    description: "Add visual protection overlays and document restriction metadata to PDFs.",
    tag: "Security",
    link: "/lock-pdf",
    featured: false,
  },
  {
    id: "latex-resume",
    title: "LaTeX Resume",
    description: "Write your resume in LaTeX. Three templates included. Export directly to PDF.",
    tag: "Create",
    link: "/latex-resume",
    featured: true,
  },
  {
    id: "resume-builder",
    title: "Resume Builder",
    description: "Build a professional resume with a form-based editor. Download as PDF.",
    tag: "Create",
    link: "/resume-builder",
    featured: false,
  },
];

const ToolsSection = () => {
  return (
    <section id="tools" className="py-14 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-0.5 bg-[#E63228]" />
              <span className="text-[#E63228] text-xs font-semibold uppercase tracking-widest">Toolkit</span>
            </div>
            <h2 className="text-3xl font-bold font-heading text-[#0A0A0A] leading-tight">
              {tools.length} tools, zero friction
            </h2>
          </div>
          <p className="hidden md:block text-[#333] text-sm max-w-xs text-right">
            All processing runs in your browser. No uploads, no accounts, no waiting.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#E0E0E0]">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.link}
              className={`group flex flex-col bg-white p-5 hover:bg-[#F5F5F5] transition-colors relative overflow-hidden ${
                tool.featured ? "ring-2 ring-[#E63228] ring-inset z-10" : ""
              }`}
            >
              {tool.featured && (
                <div className="absolute top-0 right-0 bg-[#E63228] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                  New
                </div>
              )}
              <div className="flex items-start justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E63228] border border-[#E63228] px-1.5 py-0.5">
                  {tool.tag}
                </span>
              </div>
              <h3 className="text-base font-semibold text-[#0A0A0A] mb-1.5 group-hover:text-[#E63228] transition-colors">
                {tool.title}
              </h3>
              <p className="text-[#666] text-sm leading-relaxed flex-1 mb-3">{tool.description}</p>
              <div className="flex items-center gap-1 text-[#0A0A0A] text-xs font-semibold group-hover:gap-2 transition-all">
                <span>Open tool</span>
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-px bg-[#E0E0E0]">
          {[
            { value: "100%", label: "Client-side processing" },
            { value: "0 MB", label: "Data ever uploaded" },
            { value: "Free", label: "No account required" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#FFF9F8] px-5 py-4 flex items-center gap-4">
              <span className="text-2xl font-bold text-[#E63228] font-heading">{stat.value}</span>
              <span className="text-xs text-[#0A0A0A] leading-tight">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
