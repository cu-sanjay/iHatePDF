import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const quickTools = [
  { label: "Merge PDFs", href: "/merge-pdfs", accent: true },
  { label: "Split PDF", href: "/split-pdf", accent: false },
  { label: "Compress", href: "/compress-pdf", accent: false },
  { label: "PDF → Image", href: "/pdf-to-image", accent: false },
  { label: "Watermark", href: "/watermark-pdf", accent: false },
  { label: "LaTeX Resume", href: "/latex-resume", accent: true },
];

const Hero = () => {
  return (
    <section className="bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 min-h-[420px]">
          <div className="lg:col-span-3 flex flex-col justify-center py-14 lg:pr-12 lg:border-r lg:border-[#E7D7D3]">
            <div className="inline-flex items-center gap-2 mb-5">
              <div className="w-6 h-0.5 bg-[#E63228]" />
              <span className="text-[#E63228] text-xs font-semibold uppercase tracking-widest">100% Browser-Based · Zero Upload</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-[#0A0A0A] leading-[1.05] mb-5">
              PDF tools that<br />
              <span className="text-[#E63228]">actually work.</span>
            </h1>
            <p className="text-[#333] text-lg max-w-xl mb-8 leading-relaxed">
              Merge, split, compress, convert, watermark, and protect PDFs. Build resumes from LaTeX. All in your browser — your files never leave your device.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#tools"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#E63228] text-white font-semibold hover:bg-[#c4231a] transition-colors text-sm"
              >
                Browse All Tools <ArrowRight size={16} />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#D9D9D9] text-[#0A0A0A] font-semibold hover:border-[#E63228] hover:text-[#E63228] transition-colors text-sm"
              >
                How It Works
              </a>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col justify-center py-10 lg:pl-10">
            <p className="text-[#555] text-xs font-semibold uppercase tracking-widest mb-4">Quick Access</p>
            <div className="grid grid-cols-2 gap-2">
              {quickTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={`group flex items-center justify-between px-3 py-3 border transition-colors ${
                    tool.accent
                ? "border-[#E63228] bg-[#FFF5F3] hover:bg-[#FDEAE7] text-[#0A0A0A]"
                : "border-[#E7E7E7] hover:border-[#E63228] text-[#0A0A0A] hover:bg-[#FFF5F3]"
                  }`}
                >
                  <span className="text-sm font-medium">{tool.label}</span>
                  <ArrowRight size={13} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-[#E7D7D3] grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-[#0A0A0A]">9</div>
                <div className="text-[#555] text-xs mt-0.5">Tools</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0A0A0A]">0</div>
                <div className="text-[#555] text-xs mt-0.5">Uploads</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0A0A0A]">Free</div>
                <div className="text-[#555] text-xs mt-0.5">Forever</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
