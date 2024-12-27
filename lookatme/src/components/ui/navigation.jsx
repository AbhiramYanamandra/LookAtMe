import React from 'react';
import { Button } from "@/components/ui/button";

export const Navigation = () => {
  return (
    <nav className="w-full py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <div className="text-2xl font-bold border-2 border-black p-2">
            <a href="#home">AY</a>
          </div>
          <div className="space-x-6">
            <a href="#projects" className="hover:text-blue-700">Projects</a>
            <a href="#extras" className="hover:text-blue-700">Extras</a>
            <a href="#media" className="hover:text-blue-700">Media</a>
          </div>
        </div>
        <Button variant="outline" className="border-2 border-black px-6 py-2 font-medium">
          <a href="#contact">Contact Me</a>
        </Button>
      </div>
    </nav>
  );
};