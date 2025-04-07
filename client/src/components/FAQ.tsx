import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    id: "faq1",
    question: "Is FileWizard really free to use?",
    answer:
      "Yes, FileWizard is completely free to use. We don't have any hidden fees or subscription plans. All our tools are accessible without any payment requirements.",
  },
  {
    id: "faq2",
    question: "How secure is my data when using FileWizard?",
    answer:
      "FileWizard processes all files directly in your browser. Your files never leave your device or get uploaded to any server. This ensures complete privacy and security for all your documents.",
  },
  {
    id: "faq3",
    question: "What's the maximum file size I can process?",
    answer:
      "The maximum file size depends on your device's memory and processing power. Generally, most tools can handle files up to 100MB, but this may vary. For optimal performance, we recommend files under 50MB.",
  },
  {
    id: "faq4",
    question: "Do I need to create an account to use FileWizard?",
    answer:
      "No, FileWizard doesn't require any account creation or login. You can use all our tools without registration, making it quick and convenient to process your files.",
  },
  {
    id: "faq5",
    question: "Which file formats are supported?",
    answer:
      "FileWizard supports a wide range of file formats. For images, we support JPG, PNG, WebP, GIF, and TIFF. For documents, we support PDF, DOCX, and more. Check each specific tool for format compatibility details.",
  },
];

const FAQ = () => {
  const [openFaq, setOpenFaq] = useState("faq1");

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? "" : id);
  };

  return (
    <section id="faq" className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-heading text-gray-900 mb-4 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
            Find answers to common questions about our file conversion tools
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="border border-gray-200 rounded-lg overflow-hidden dark:border-gray-700"
              >
                <button
                  className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 focus:outline-none transition-colors duration-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                  onClick={() => toggleFaq(faq.id)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {faq.question}
                    </h3>
                    {openFaq === faq.id ? (
                      <ChevronUp className="text-gray-500 dark:text-gray-400" size={16} />
                    ) : (
                      <ChevronDown className="text-gray-500 dark:text-gray-400" size={16} />
                    )}
                  </div>
                </button>
                {openFaq === faq.id && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    <p className="text-gray-600 dark:text-gray-300">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
