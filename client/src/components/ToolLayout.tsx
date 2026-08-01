import React from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

interface ToolLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  category: string;
}

const ToolLayout: React.FC<ToolLayoutProps> = ({ children, title, description, category }) => {
  return (
    <section className="py-8 sm:py-10 bg-[#F5F5F5] min-h-[70vh]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link 
            href="/#tools" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8A8A8E] hover:text-[#E63228] transition-colors mb-6 group"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
            Back to All Tools
          </Link>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-0.5 bg-[#E63228]" />
            <span className="text-[#E63228] text-xs font-semibold uppercase tracking-widest">{category}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] font-heading">{title}</h1>
          <p className="text-[#666] text-sm mt-1">{description}</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm border border-[#E0E0E0] rounded-2xl overflow-hidden shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToolLayout;
