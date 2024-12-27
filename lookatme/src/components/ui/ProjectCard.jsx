import { Card } from "@/components/ui/card";

export const ProjectCard = ({ title, description, image, color }) => {
  return (
    <Card className={`overflow-hidden ${color}`}>
      <div className="p-4">
        {/* <img 
          src={image} 
          alt={title}
          className="w-full rounded-lg mb-4"
        /> */}
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-lg">{description}</p>
      </div>
    </Card>
  );
};