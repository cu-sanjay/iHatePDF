import { Shield } from "lucide-react";

const steps = [
  {
    num: "01",
    title: "Upload",
    desc: "Select files from your device or drag-and-drop. Files stay local — nothing is sent to any server.",
  },
  {
    num: "02",
    title: "Configure",
    desc: "Choose your options: format, quality, page range, watermark text, or resume template.",
  },
  {
    num: "03",
    title: "Download",
    desc: "Processing happens instantly in your browser. Download the result immediately.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-14 bg-[#F5F5F5]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-0.5 bg-[#E63228]" />
            <span className="text-[#E63228] text-xs font-semibold uppercase tracking-widest">Process</span>
          </div>
          <h2 className="text-3xl font-bold font-heading text-[#0A0A0A]">How it works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#E0E0E0]">
          {steps.map((step, i) => (
            <div key={step.num} className="bg-white p-7 relative">
              <div className="absolute top-5 right-5 text-7xl font-extrabold text-[#F0F0F0] leading-none font-heading select-none">
                {step.num}
              </div>
              <div className="relative z-10">
                <div className="w-8 h-0.5 bg-[#E63228] mb-4" />
                <h3 className="text-lg font-bold text-[#0A0A0A] font-heading mb-2">{step.title}</h3>
                <p className="text-[#666] text-sm leading-relaxed">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 z-20 transform -translate-y-1/2">
                  <div className="w-6 h-0.5 bg-[#E63228]" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-[#E63228]" style={{borderLeftWidth: 6}} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-px bg-[#0A0A0A] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-shrink-0 w-10 h-10 border border-[#E63228] flex items-center justify-center">
            <Shield size={18} className="text-[#E63228]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-0.5">Private by design</h3>
            <p className="text-[#888] text-sm">
              All operations run entirely in your browser using JavaScript. No file is ever transmitted to any server.
              There is no backend that processes your PDFs. Your documents are yours alone.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
