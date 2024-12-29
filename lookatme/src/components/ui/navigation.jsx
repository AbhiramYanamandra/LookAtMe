import React from 'react';
import { Button } from "@/components/ui/button";

export const Navigation = () => {
  return (
    <nav className="w-full py-6 px-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <div className="text-2xl font-bold border-2 border-black p-2">
            <a href="#home">AY</a>
          </div>
          <div className="space-x-8">
            {['Projects', 'Extras', 'Media'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-2xl relative group inline-block font-bold"
              >
                <span className="relative z-10">{item}</span>
                <span className="absolute left-0 bottom-1 w-full h-2 bg-blue-500 group-hover:w-full group-hover:h-full group-hover:bottom-0 transition-all duration-300 ease-out -z-1" />
              </a>
            ))}
          </div>
        </div>
        <Button variant="outline" className="border-2 border-black px-8 py-6 font-bold text-2xl hover:text-white hover:bg-black">
          <a href="#contact">Contact Me</a>
        </Button>
      </div>
    </nav>
  );
};
