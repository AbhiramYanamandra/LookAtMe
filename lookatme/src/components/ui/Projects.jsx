import { ProjectCard } from "./ProjectCard";

export const Project = () => {
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
      },
      {
        title: "Folder Sorter",
        description: "Sort your Folders with this python script",
        image: "/images/typemonke.jpeg",
        // color: "bg-green-300"
      },
      {
        title: "Tic-Tac-Toe",
        description: "Play one of the most popular games that is sure to cure boredom",
        image: "/images/typemonke.jpeg",
        // color: "bg-green-300"
      },
      {
        title: "Code Generator",
        description: "ADFGVX cipher generator, keep your secrets a secret",
        image: "/images/typemonke.jpeg",
        // color: "bg-green-300"
      },
      {
        title: "Number Guessing Game",
        description: "Try and guess what number I am thinking of",
        image: "/images/typemonke.jpeg",
        // color: "bg-green-300"
      },
    ];
  
    return (
      <section id="projects" className="h-screen w-full py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-6xl font-bold text-bold mb-12">
            My Projects
          </h2>
          <h3 className="text-4xl font-bold text-bold mb-12">
            Meesa Loves Making Things. Here's some of them: 
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <ProjectCard key={index} {...project} />
            ))}
          </div>
        </div>
      </section>
    );
};