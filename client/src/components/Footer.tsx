import { Link } from "wouter";
import { Github, Twitter, Facebook, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <span className="text-2xl font-bold font-heading">
                File<span className="text-primary">Wizard</span>
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              Free online tools for all your file conversion needs. Process PDFs,
              images, and documents directly in your browser without sacrificing
              privacy.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://github.com/cu-sanjay"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-lg mb-4">Tools</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/pdf-to-image"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  PDF to Image
                </Link>
              </li>
              <li>
                <Link
                  href="/image-to-pdf"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Image to PDF
                </Link>
              </li>
              <li>
                <Link
                  href="/compress-pdf"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Compress PDF
                </Link>
              </li>
              <li>
                <Link
                  href="/resume-builder"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Resume Builder
                </Link>
              </li>
              <li>
                <Link
                  href="/merge-pdfs"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Merge PDFs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-lg mb-4">About</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/#how-it-works"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="/#faq"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400">
            Designed and Developed by{" "}
            <a
              href="https://github.com/cu-sanjay"
              className="text-primary hover:text-blue-400 transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sannjay
            </a>
          </p>
          <p className="text-gray-500 text-sm mt-2">
            &copy; {new Date().getFullYear()} FileWizard. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
