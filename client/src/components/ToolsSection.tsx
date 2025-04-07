import { Link } from "wouter";
import { FileText, Image, FileDown, UserRound, IterationCcw, Scissors } from "lucide-react";

const tools = [
  {
    id: "pdf-to-image",
    title: "PDF to Image",
    description: "Convert PDF documents to JPG, PNG, or other image formats with high quality.",
    icon: <Image className="text-primary text-xl" />,
    iconBg: "bg-blue-100",
    headerBg: "bg-primary",
    link: "/pdf-to-image",
    linkText: "text-primary",
    linkHover: "hover:text-blue-700",
  },
  {
    id: "image-to-pdf",
    title: "Image to PDF",
    description: "Turn your JPG, PNG, or other image formats into PDF documents quickly.",
    icon: <FileText className="text-secondary text-xl" />,
    iconBg: "bg-green-100",
    headerBg: "bg-secondary",
    link: "/image-to-pdf",
    linkText: "text-secondary",
    linkHover: "hover:text-green-700",
  },
  {
    id: "compress-pdf",
    title: "PDF Compression",
    description: "Reduce PDF file size while maintaining quality for easier sharing.",
    icon: <FileDown className="text-accent text-xl" />,
    iconBg: "bg-purple-100",
    headerBg: "bg-accent",
    link: "/compress-pdf",
    linkText: "text-accent",
    linkHover: "hover:text-purple-700",
  },
  {
    id: "resume-builder",
    title: "Resume Builder",
    description: "Create professional resumes with customizable templates and easy editing.",
    icon: <UserRound className="text-yellow-500 text-xl" />,
    iconBg: "bg-yellow-100",
    headerBg: "bg-yellow-500",
    link: "/resume-builder",
    linkText: "text-yellow-500",
    linkHover: "hover:text-yellow-600",
  },
  {
    id: "merge-pdfs",
    title: "Merge PDFs",
    description: "Combine multiple PDF files into a single document quickly and easily.",
    icon: <IterationCcw className="text-red-500 text-xl" />,
    iconBg: "bg-red-100",
    headerBg: "bg-red-500",
    link: "/merge-pdfs",
    linkText: "text-red-500",
    linkHover: "hover:text-red-600",
  },
  {
    id: "split-pdf",
    title: "Split PDF",
    description: "Extract pages or split PDF documents into multiple files as needed.",
    icon: <Scissors className="text-indigo-500 text-xl" />,
    iconBg: "bg-indigo-100",
    headerBg: "bg-indigo-500",
    link: "/split-pdf",
    linkText: "text-indigo-500",
    linkHover: "hover:text-indigo-600",
  },
];

const ToolsSection = () => {
  return (
    <section id="tools" className="py-12 sm:py-16 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-heading text-gray-900 mb-4 dark:text-white">
            Our Tools
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
            Choose from our wide range of file conversion and editing tools
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden dark:bg-gray-800"
            >
              <div className={`h-3 ${tool.headerBg}`}></div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-lg ${tool.iconBg} flex items-center justify-center mr-4`}>
                    {tool.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{tool.title}</h3>
                </div>
                <p className="text-gray-600 mb-6 dark:text-gray-300">{tool.description}</p>
                <Link
                  href={tool.link}
                  className={`inline-flex items-center ${tool.linkText} font-medium ${tool.linkHover}`}
                >
                  Use Tool <span className="ml-2">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
