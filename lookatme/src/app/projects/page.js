import { Suspense } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { AnimatedGrid } from "@/components/project/AnimatedGrid";
import { FilterChips } from "@/components/project/FilterChips";
import { LibraryOverview } from "@/components/project/LibraryOverview";
import { SortControl } from "@/components/project/SortControl";
import { RememberLibraryState } from "@/components/project/LibraryState";
import { getPublishedProjects, toSummary } from "@/lib/projects";
import { ALL_FIELDS, availableSorts, filterByField, populatedFields, resolveField, resolveSort, sortProjects } from "@/lib/project-queries";
import { fieldLabel, getField } from "@/content/fields";
import { profile } from "@/content/profile";

export const metadata = {
  title: "Projects",
  description: `Every published project by ${profile.name}, browsable by engineering field.`,
  alternates: { canonical: "/projects" },
};

function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProjectsPage({ searchParams }) {
  const params = await searchParams;
  const projects = getPublishedProjects().map(toSummary);
  const field = resolveField(first(params?.field));
  // Pass the collection so a sort it cannot perform falls back instead of
  // reporting an order change that never happened.
  const sort = resolveSort(first(params?.sort), projects);
  const sortOptions = availableSorts(projects);
  const fields = populatedFields(projects);
  const results = sortProjects(filterByField(projects, field), sort);
  const isFiltered = field !== ALL_FIELDS || sort !== "recommended";
  const activeField = field === ALL_FIELDS ? null : getField(field);
  // A field with no published projects is still a reachable URL. Give it a
  // chip so the toolbar shows which filter is on; without it the empty grid
  // appears with nothing selected.
  const chipFields =
    activeField && !fields.some((item) => item.id === field)
      ? [...fields, { id: field, label: activeField.label, count: 0 }]
      : fields;

  return (
    <>
      <SiteHeader />
      <main className="pl-page">
        <Suspense fallback={null}>
          <RememberLibraryState />
        </Suspense>
        <div className="pl-intro">
          <div>
            <span className="al-mono">[ Project library ]</span>
            <h1>Everything I’ve built.</h1>
            <p>
              Web applications, hardware, and digital systems, filed by the engineering field the work belongs to.
              Start with the overview, or <a href="#browse">jump to the full list</a> and filter by field.
            </p>
          </div>
        </div>

        <LibraryOverview projects={projects} fields={fields} />

        <div className="pl-toolbar" id="browse">
          <FilterChips fields={chipFields} total={projects.length} field={field} sort={sort} />
          <SortControl field={field} sort={sort} options={sortOptions} />
        </div>

        <div className="pl-status" role="status" aria-live="polite">
          <span>
            Showing <strong>{results.length}</strong> of {projects.length} projects
            {activeField ? (
              <>
                {" "}
                in <strong>{activeField.label}</strong>
              </>
            ) : null}
            {sort !== "recommended" ? <> · sorted by {sortLabel(sort)}</> : null}
          </span>
          {isFiltered && (
            <Link href="/projects" scroll={false}>
              Reset filters
            </Link>
          )}
        </div>

        <AnimatedGrid projects={results}>
          <div className="pl-empty">
            <p>No published projects in {fieldLabel(field)} yet.</p>
            <p>
              <Link href="/projects" scroll={false}>
                Show all projects
              </Link>
            </p>
          </div>
        </AnimatedGrid>
      </main>
      <div className="pl-page">
        <SiteFooter />
      </div>
    </>
  );
}

function sortLabel(sort) {
  return { newest: "newest", oldest: "oldest", title: "title" }[sort] ?? sort;
}
