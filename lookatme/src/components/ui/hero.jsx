export const Hero = () => {
    return (
      <div className="flex-1 px-6 flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-black mb-6 transition-colors duration-300 hover:border-blue-700">
            <img
              src="/images/me.jpeg"
              alt="Abhiram Yanamandra"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Hey, I'm <span className="text-blue-700">Abhiram Yanamandra</span>.
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-medium mb-4">
            Software Developer · Builder · CS Student
          </p>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mb-8 leading-relaxed">
            I build things I wish existed — from productivity tools to games to full-stack apps.
            Always learning, always shipping.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-black text-white font-bold text-lg rounded-none hover:bg-blue-700 transition-colors duration-300"
            >
              View Resume
            </a>
            <a
              href="#projects"
              className="px-8 py-4 border-2 border-black font-bold text-lg hover:bg-black hover:text-white transition-colors duration-300"
            >
              See My Work
            </a>
          </div>
        </div>
      </div>
    );
  };
