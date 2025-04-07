import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "./ui/theme-provider";
import { Sun, Moon, Menu, X } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm dark:bg-gray-900 dark:border-b dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
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
            <Link href="/" className="text-2xl font-bold font-heading text-gray-900 dark:text-white">
              File<span className="text-primary">Wizard</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="/#tools"
              className={`font-medium ${
                location === "/#tools"
                  ? "text-primary"
                  : "text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
              }`}
            >
              Tools
            </a>
            <a
              href="/#how-it-works"
              className={`font-medium ${
                location === "/#how-it-works"
                  ? "text-primary"
                  : "text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
              }`}
            >
              How It Works
            </a>
            <a
              href="/#faq"
              className={`font-medium ${
                location === "/#faq"
                  ? "text-primary"
                  : "text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
              }`}
            >
              FAQ
            </a>
          </nav>

          <div className="flex items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary focus:outline-none"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              className="md:hidden p-2 rounded-full text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary focus:outline-none"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-3">
              <a
                href="/#tools"
                className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Tools
              </a>
              <a
                href="/#how-it-works"
                className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="/#faq"
                className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
