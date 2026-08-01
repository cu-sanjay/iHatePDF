import { Link } from "wouter";
import { Github } from "lucide-react";

const tools = [
  { label: "PDF to Image", href: "/pdf-to-image" },
  { label: "Image to PDF", href: "/image-to-pdf" },
  { label: "Compress PDF", href: "/compress-pdf" },
  { label: "Merge PDFs", href: "/merge-pdfs" },
  { label: "Split PDF", href: "/split-pdf" },
  { label: "Watermark PDF", href: "/watermark-pdf" },
  { label: "Protect PDF", href: "/lock-pdf" },
  { label: "LaTeX Resume", href: "/latex-resume" },
  { label: "Drop Vault", href: "/drop" },
  { label: "Resume Builder", href: "/resume-builder" },
];

const Footer = () => {
  return (
    <footer className="bg-white text-[#0A0A0A] border-t-2 border-[#E63228]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 3h13.5L28 11.5V29a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" fill="#0A0A0A"/>
                <path d="M19.5 3L28 11.5h-8.5V3z" fill="#F4E7E5"/>
                <line x1="11" y1="15" x2="21" y2="25" stroke="#E63228" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="21" y1="15" x2="11" y2="25" stroke="#E63228" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              <span className="text-lg font-bold font-heading">
                i<span className="text-[#E63228]">Hate</span>PDF
              </span>
            </div>
            <p className="text-[#333] text-sm leading-relaxed mb-4">
              All PDF processing happens in your browser. Your files never leave your device. No accounts, no tracking, no fees.
            </p>
            <a
              href="https://github.com/cu-sanjay"
              className="inline-flex items-center gap-1.5 text-[#333] hover:text-[#E63228] text-sm transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={15} />
              <span>cu-sanjay</span>
            </a>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#E63228] mb-3">PDF Tools</h4>
            <ul className="space-y-1.5">
              {tools.slice(0, 5).map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="text-[#333] hover:text-[#E63228] text-sm transition-colors">
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#E63228] mb-3">More Tools</h4>
            <ul className="space-y-1.5">
              {tools.slice(5).map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="text-[#777] hover:text-white text-sm transition-colors">
                    {t.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="/#how-it-works" className="text-[#333] hover:text-[#E63228] text-sm transition-colors">How It Works</a>
              </li>
              <li>
                <a href="/#faq" className="text-[#333] hover:text-[#E63228] text-sm transition-colors">FAQ</a>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
