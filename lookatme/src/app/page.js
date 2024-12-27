import { FeaturedWork } from "@/components/ui/Featured";
import { Hero } from "@/components/ui/hero";
import { Navigation } from "@/components/ui/navigation";
import { Project } from "@/components/ui/Projects";
import { Contact } from "@/components/ui/contact";

export default function Home() {
  return (
    <div id="home" className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <FeaturedWork />
      <Project />
      <Contact />
      <footer className="bg-slate-900 py-8">
        <div className="max-w-6xl mx-auto px-4 text-white text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Abhiram Yanamandra. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
