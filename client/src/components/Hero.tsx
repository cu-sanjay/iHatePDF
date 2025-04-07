import { Link } from "wouter";

const Hero = () => {
  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 dark:text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold font-heading text-gray-900 mb-6 dark:text-white">
            Free Online File Conversion Tools
          </h1>
          <p className="text-xl text-gray-600 mb-8 dark:text-gray-300">
            Convert, compress, and enhance your files with ease. No account required.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="#tools"
              className="px-8 py-3 rounded-lg bg-primary text-white font-medium hover:bg-blue-600 transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              Get Started
            </a>
            <a
              href="#how-it-works"
              className="px-8 py-3 rounded-lg bg-white text-primary border border-primary font-medium hover:bg-gray-50 transition-colors duration-300 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-500 dark:hover:bg-gray-700"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
