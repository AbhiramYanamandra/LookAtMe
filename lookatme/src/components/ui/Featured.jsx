const FeaturedCard = ({ title, tag, description, image }) => (
  <div className="bg-white rounded-2xl shadow-md hover:shadow-[0_20px_50px_rgba(255,255,255,0.15)] hover:-translate-y-3 transition-all duration-300 cursor-pointer flex flex-col">
    <div className="w-full h-52 overflow-hidden rounded-t-2xl bg-gray-100">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover"
      />
    </div>
    <div className="p-5 flex flex-col flex-1">
      <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-1">{tag}</span>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);

export const FeaturedWork = () => {
    const projects = [
      {
        title: "Presto",
        tag: "Web App",
        description: "A presentation builder inspired by Slides.com — create and share beautiful slide decks in the browser.",
        image: "/images/presto.png",
      },
      {
        title: "3x3 Macropad",
        tag: "Hardware",
        description: "A custom-built 9-key macropad with per-key RGB and fully programmable layers.",
        image: "/images/macropad.png",
      },
      {
        title: "5-Stage Pipeline Processor",
        tag: "Hardware",
        description: "A pipelined MIPS-style processor with Fetch, Decode, Execute, Memory, and Writeback stages — extended to support the Branch Not Equal (BNE) instruction.",
        image: "/images/processor.png",
      },
    ];

    return (
      <section id="featured-work" className="w-full bg-slate-900 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-2">
            Featured Work
          </h2>
          <p className="text-gray-400 text-center mb-12">A few things I'm proud of</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <FeaturedCard key={index} {...project} />
            ))}
          </div>
        </div>
      </section>
    );
};
