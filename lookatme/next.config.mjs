/** @type {import('next').NextConfig} */
const nextConfig = {
  // Verify a production build without overwriting a running dev server.
  distDir: process.env.NEXT_OUTPUT_DIR || ".next",
  images: {
    // Qualities used by the portrait and project imagery.
    qualities: [75, 85],
  },
};

export default nextConfig;
