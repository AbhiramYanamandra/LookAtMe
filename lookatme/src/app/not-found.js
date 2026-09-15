import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="nf-page">
        <h1>Lost?</h1>
        <p>That page doesn’t exist — or the project you’re after isn’t published yet.</p>
        <nav className="al-field-actions" aria-label="Where to go next" style={{ justifyContent: "center" }}>
          <Link href="/">Home ↗</Link>
          <Link href="/projects">All projects ↗</Link>
        </nav>
      </main>
      <div className="pl-page">
        <SiteFooter />
      </div>
    </>
  );
}
