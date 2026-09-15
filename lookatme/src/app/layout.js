import { Suspense } from "react";
import localFont from "next/font/local";
import { profile } from "@/content/profile";
import { siteUrl, siteUrlConfigured } from "@/lib/site";
import "./globals.css";
import "@/styles/home.css";
import "@/styles/projects.css";
import "@/styles/about.css";
import "@/styles/motion.css";
import { ENTRANCE_STORAGE_KEY } from "@/lib/motion";
import { PageTransition } from "@/components/site/PageTransition";
import { RevealObserver } from "@/components/site/RevealObserver";

// The approved design uses the bundled Geist, Geist Mono, and Pacifico files
// (see src/fonts/). Loading them locally avoids substitutions.
const geistSans = localFont({
  src: "../fonts/geist.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "../fonts/geist-mono.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

const pacifico = localFont({
  src: "../fonts/pacifico.woff2",
  variable: "--font-pacifico",
  weight: "400",
  display: "swap",
});

export const metadata = {
  // metadataBase resolves relative Open Graph URLs. Set NEXT_PUBLIC_SITE_URL in
  // production; without it Next falls back to localhost (see README).
  ...(siteUrlConfigured ? { metadataBase: new URL(siteUrl) } : {}),
  title: {
    default: profile.siteTitle,
    template: `%s — ${profile.name}`,
  },
  description: profile.siteDescription,
  openGraph: {
    type: "website",
    siteName: profile.name,
    title: profile.siteTitle,
    description: profile.siteDescription,
    images: [{ url: profile.portrait.src, alt: profile.portrait.alt }],
  },
};

export const viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

// Runs before any content is painted: marks that JavaScript is available
// (scroll reveals only hide content once this is set) and, on a first visit
// in this tab, hides the wordmark so the droplet entrance can reveal it.
const bootstrap = `
(function(){
  var h=document.documentElement;h.classList.add('js');
  try{
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&location.pathname==='/'&&sessionStorage.getItem('${ENTRANCE_STORAGE_KEY}')!=='done'){h.classList.add('al-entrance-pending');}
  }catch(e){}
})();`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${pacifico.variable}`}
      // The bootstrap script adds classes before hydration; that is intended.
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: bootstrap }} />
        {children}
        <PageTransition />
        <Suspense fallback={null}>
          <RevealObserver />
        </Suspense>
      </body>
    </html>
  );
}
