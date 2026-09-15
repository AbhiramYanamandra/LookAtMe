import { profile } from "@/content/profile";

export function SiteFooter() {
  return (
    <footer className="al-contact" data-reveal="draw">
      <a href={`mailto:${profile.email}`}>
        {profile.footer.invitation} &nbsp; {profile.email} ↗
      </a>
      <div className="al-contact-links">
        <a href={profile.github} target="_blank" rel="noopener noreferrer">
          GitHub ↗
        </a>
        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn ↗
        </a>
      </div>
      <span>© {new Date().getFullYear()} {profile.name}</span>
    </footer>
  );
}
