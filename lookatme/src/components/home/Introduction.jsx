import Image from "next/image";
import Link from "next/link";
import { profile } from "@/content/profile";
import { LineReveal } from "@/components/site/LineReveal";

/** Stationary portrait beside the personal introduction. */
export function Introduction() {
  return (
    <section className="al-introduction" id="about" aria-labelledby="about-heading">
      <figure className="al-portrait" data-reveal="mask-up">
        <span className="al-portrait-frame">
        <Image
          src={profile.portrait.src}
          alt={profile.portrait.alt}
          width={profile.portrait.width}
          height={profile.portrait.height}
          // The frame is 182×215 with object-fit: cover, which crops the 3:2
          // source to its height; request enough pixels for that crop on 2× screens.
          sizes="330px"
          quality={85}
        />
        </span>
        <figcaption>{profile.intro.caption}</figcaption>
      </figure>
      <div className="al-profile-copy" data-reveal="copy" data-reveal-delay="90">
        <span className="al-mono">{profile.intro.label}</span>
        <LineReveal as="h2" id="about-heading" text={profile.intro.heading} />
        <p className="al-intro-text">
          I’m <strong>{profile.name}</strong>. {profile.intro.lead}
        </p>
        <div className="al-intro-links">
          <Link href="/about">More about me ↗</Link>
          <a href={profile.github} target="_blank" rel="noopener noreferrer">
            GitHub ↗
          </a>
          <a href={profile.resume} target="_blank" rel="noopener noreferrer">
            View resume ↗
          </a>
        </div>
      </div>
    </section>
  );
}
