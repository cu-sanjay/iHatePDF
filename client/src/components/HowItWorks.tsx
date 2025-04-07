import { Upload, Cog, Download, Shield } from "lucide-react";

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-12 sm:py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-heading text-gray-900 mb-4 dark:text-white">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
            FileWizard processes your files directly in your browser, ensuring privacy and fast results
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-primary mb-4 dark:bg-blue-900">
              <Upload size={24} />
            </div>
            <h3 className="text-xl font-semibold font-heading text-gray-900 mb-2 dark:text-white">
              1. Upload
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Upload your files securely through drag-and-drop or file selector
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-secondary mb-4 dark:bg-green-900">
              <Cog size={24} />
            </div>
            <h3 className="text-xl font-semibold font-heading text-gray-900 mb-2 dark:text-white">
              2. Process
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Choose your options and let our tools process your files directly in your browser
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-accent mb-4 dark:bg-purple-900">
              <Download size={24} />
            </div>
            <h3 className="text-xl font-semibold font-heading text-gray-900 mb-2 dark:text-white">
              3. Download
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Download your converted or compressed files to your device immediately
            </p>
          </div>
        </div>

        <div className="mt-16 max-w-4xl mx-auto bg-gray-50 rounded-xl p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-start">
            <div className="min-w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-primary mr-4 dark:bg-blue-900">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="text-xl font-semibold font-heading text-gray-900 mb-2 dark:text-white">
                100% Secure and Private
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                All processing is done locally in your browser. Your files never leave your device and aren't uploaded to any server. We have no access to your files, ensuring complete privacy and security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
