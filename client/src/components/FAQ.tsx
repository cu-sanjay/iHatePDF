import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    id: "q1",
    question: "Is iHatePDF really free?",
    answer:
      "Yes, completely. No hidden fees, no subscription, no account required. Every tool is accessible without any payment.",
  },
  {
    id: "q2",
    question: "Do my files get uploaded anywhere?",
    answer:
      "No. All processing runs entirely in your browser using JavaScript libraries. Your files never leave your device. We have zero access to your documents.",
  },
  {
    id: "q3",
    question: "What's the maximum file size?",
    answer:
      "It depends on your device's available memory. Most tools handle files up to 100MB comfortably. For best performance, we recommend files under 50MB.",
  },
  {
    id: "q4",
    question: "Does the LaTeX Resume tool support full LaTeX?",
    answer:
      "The LaTeX Resume tool supports the common subset used in resume templates: \\section, \\subsection, \\textbf, \\textit, \\begin{itemize}, \\item, \\hrule, and basic text content. Full pdflatex compilation is not possible in the browser.",
  },
  {
    id: "q5",
    question: "Why can't Protect PDF add real password encryption?",
    answer:
      "Browser-based JavaScript cannot implement the full AES-256 PDF encryption standard without a backend. The Protect PDF tool adds strong visual protection overlays and document restriction metadata. For real password encryption, you'd need a server-side tool.",
  },
  {
    id: "q6",
    question: "Which browsers are supported?",
    answer:
      "All modern browsers: Chrome, Firefox, Safari, Edge. Some features (like WebP export) may not work in older Safari versions. For best results, use an up-to-date Chromium-based browser.",
  },
];

const FAQ = () => {
  const [openId, setOpenId] = useState<string>("q1");

  return (
    <section id="faq" className="py-14 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-0.5 bg-[#E63228]" />
            <span className="text-[#E63228] text-xs font-semibold uppercase tracking-widest">FAQ</span>
          </div>
          <h2 className="text-3xl font-bold font-heading text-[#0A0A0A]">Frequently asked questions</h2>
        </div>

        <div className="max-w-3xl">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className={`border-b border-[#E0E0E0] ${openId === faq.id ? "border-l-2 border-l-[#E63228]" : ""}`}
            >
              <button
                className="w-full flex items-center justify-between py-4 px-4 text-left hover:bg-[#FAFAFA] transition-colors focus:outline-none"
                onClick={() => setOpenId(openId === faq.id ? "" : faq.id)}
              >
                <span className={`text-sm font-semibold pr-4 ${openId === faq.id ? "text-[#E63228]" : "text-[#0A0A0A]"}`}>
                  {faq.question}
                </span>
                <span className="flex-shrink-0 text-[#0A0A0A]">
                  {openId === faq.id ? <Minus size={14} /> : <Plus size={14} />}
                </span>
              </button>
              {openId === faq.id && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-[#555] leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
