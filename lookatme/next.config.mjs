/** @type {import('next').NextConfig} */
const nextConfig = {
  // Verify a production build without overwriting a running dev server.
  distDir: process.env.NEXT_OUTPUT_DIR || ".next",
  images: {
    // Qualities used by the portrait and project imagery.
    qualities: [75, 85],
  },
  async redirects() {
    return [
      // The page outgrew "about" once it carried work history; keep the old
      // URL working for anything already pointing at it.
      { source: "/about", destination: "/background", permanent: true },
      // `/experience/<slug>` pages exist, so a visitor trimming the URL back
      // lands somewhere real instead of a 404.
      { source: "/experience", destination: "/background#experience-heading", permanent: false },
    ];
  },
};

export default nextConfig;
