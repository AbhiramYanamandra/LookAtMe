import { Menu, X, Github, Linkedin, Mail } from 'lucide-react';

export const Contact = () => {
    return (
      <div id="contact" className="h-auto w-full bg-slate-900 py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl text-white font-bold mb-12">Get In Touch</h2>
          <div className="flex justify-center space-x-8">
            <a href="https://github.com/AbhiramYanamandra" className="text-gray-600 hover:text-gray-900">
              <Github size={24} />
            </a>
            <a href="https://www.linkedin.com/in/abhiram-y-a803b7246/" className="text-gray-600 hover:text-gray-900">
              <Linkedin size={24} />
            </a>
            <a href="mailto:ysabhiram@gmail.com" className="text-gray-600 hover:text-gray-900">
              <Mail size={24} />
            </a>
          </div>
        </div>
      </div>
    );
  };