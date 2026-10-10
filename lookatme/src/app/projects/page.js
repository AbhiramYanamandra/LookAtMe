import { Suspense } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { AnimatedGrid } from "@/components/project/AnimatedGrid";
import { FilterChips } from "@/components/project/FilterChips";
import { LibraryHero } from "@/components/project/LibraryHero";
import { ShowcaseSection, SHOWCASE_SLUGS } from "@/components/project/ShowcaseSection";
import { ListView } from "@/components/project/ListView";
import { SortControl } from "@/components/project/SortControl";
import { RememberLibraryState } from "@/components/project/LibraryState";
import { getPublishedProjects, toSummary } from "@/lib/projects";
import { ALL_FIELDS, availableSorts, filterByField, filterByRange, populatedFields, resolveField, resolveSort, sortProjects } from "@/lib/project-queries";
import { describeRange, parseRange } from "@/lib/spectrum";
import { fieldLabel, getField } from "@/content/fields";
import { profile } from "@/content/profile";
import { libraryHref } from "@/lib/project-queries";
import { LayoutGrid, List } from "lucide-react";

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
  const view = first(params?.view) === "list" ? "list" : "grid";
  const range = parseRange(first(params?.range));
  const matches = sortProjects(filterByRange(filterByField(projects, field), range), sort);
  const isFiltered = field !== ALL_FIELDS || sort !== "recommended" || range !== null;
  // The three lead projects get their own showcase above the grid, unless the
  // visitor is filtering or sorting: then every match belongs in the results.
  const showShowcase = view === "grid" && !isFiltered;
  const results = showShowcase ? matches.filter((project) => !SHOWCASE_SLUGS.includes(project.slug)) : matches;
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
        <LibraryHero projects={projects} fields={fields} field={field} sort={sort} view={view} range={range} />

        {showShowcase && <ShowcaseSection projects={projects} />}

        <div className="pl-sticky">
          <div className="pl-toolbar" id="browse">
            <FilterChips fields={chipFields} total={projects.length} field={field} sort={sort} view={view} range={range} />
            <div className="pl-toolbar-end">
              <SortControl field={field} sort={sort} view={view} range={range} options={sortOptions} />
              <nav className="pl-view" aria-label="View">
                <Link href={libraryHref({ field, sort, range })} scroll={false} aria-current={view === "grid" ? "true" : undefined} aria-label="Grid view">
                  <LayoutGrid aria-hidden="true" />
                </Link>
                <Link href={libraryHref({ field, sort, view: "list", range })} scroll={false} aria-current={view === "list" ? "true" : undefined} aria-label="List view">
                  <List aria-hidden="true" />
                </Link>
              </nav>
            </div>
          </div>
        </div>

        <div className="pl-status" role="status" aria-live="polite">
          <span>
            {showShowcase ? <>The other <strong>{results.length}</strong> of {projects.length} projects</> : <>Showing <strong>{results.length}</strong> of {projects.length} projects</>}
            {activeField ? (
              <>
                {" "}
                in <strong>{activeField.label}</strong>
              </>
            ) : null}
            {range ? (
              <>
                {" "}
                · <strong>{describeRange(range)}</strong>
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

        {view === "list" ? (
          <ListView projects={results}>
            <div className="pl-empty">
              <p>No published projects in {fieldLabel(field)} yet.</p>
            </div>
          </ListView>
        ) : (
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
        )}
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
