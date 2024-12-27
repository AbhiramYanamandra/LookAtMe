import { ProjectCard } from "./ProjectCard";

export const FeaturedWork = () => {
    const projects = [
      {
        title: "TypeMonke",
        description: "Learning to type fast with the monke",
        image: "/images/typemonke.jpeg",
        // color: "bg-green-300"
      },
      {
        title: "Expensify",
        description: "Expensify helps you track you monthly purchases",
        image: "/api/placeholder/600/300",
        // color: "bg-purple-300"
      },
      {
        title: "Trust",
        description: "Learn  how to invest with the latest AI",
        image: "/api/placeholder/600/300",
        // color: "bg-purple-300"
      }
    ];
  
    return (
      <section id="featured-work" className="h-auto w-full bg-slate-900 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Featured Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <ProjectCard key={index} {...project} />
            ))}
          </div>
        </div>
      </section>
    );
};