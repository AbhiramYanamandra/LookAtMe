import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { profile } from "@/content/profile";
import { libraryHref } from "@/lib/project-queries";

/** Browse-by-field strip that follows the project story. */
export function FieldDiscovery({ fields, total }) {
  return (
    <section className="al-work al-work-strip" aria-label="Browse projects">
      <div className="al-field-discovery" data-reveal="sequence">
        <span>{profile.work.discovery}</span>
        <nav className="al-field-actions" aria-label="Browse projects by field">
          {/* Each field states its own size, the way the library chips do:
              the taxonomy tells you how much is behind it before you go. */}
          {fields.map((field, index) => (
            <Link key={field.id} href={libraryHref({ field: field.id })} style={{ "--seq": index }}>
              {field.label}
              <span className="al-field-count">{field.count}</span>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          ))}
          <Link href="/projects" style={{ "--seq": fields.length }}>
            All projects
            {typeof total === "number" && <span className="al-field-count">{total}</span>}
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </section>
  );
}
