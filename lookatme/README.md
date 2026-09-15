# lookatme — Abhiram Yanamandra's portfolio

Next.js 15 (App Router, JavaScript) portfolio: a black-and-blue landing page with a moving project carousel, a filterable project library, and one MDX case study per project.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

| Command            | What it does                                                             |
| ------------------ | ------------------------------------------------------------------------ |
| `npm run validate` | Validates every project file and prints what is featured, in the carousel, and drafted. |
| `npm test`         | Focused checks for content validation, filtering, sorting, and URL state. |
| `npm run lint`     | ESLint (`next lint`).                                                    |
| `npm run build`    | Production build. Fails if any project file is invalid.                  |
| `npm run check`    | validate → lint → test → build.                                          |
| `npm start`        | Serves the production build.                                             |

## Where things live

```
src/
  app/                     routes: / , /projects , /projects/[slug] , sitemap, 404
  components/
    site/                  SiteHeader, SiteFooter
    home/                  Hero, ProjectCarousel (client), HeroObject, Introduction, SelectedWork
    project/               cards, card visuals, filters/sort, quick facts, case-study MDX components
  content/
    projects/*.mdx         ONE FILE PER PROJECT — the single source of truth
    projects/_TEMPLATE.mdx copy this to add a project
    fields.js              engineering-field taxonomy
    profile.js             name, links, resume path, homepage copy
  lib/
    projects.js            loads + validates content (server only)
    project-queries.js     filtering, sorting, featured/hero/related selection
    site.js                site URL (NEXT_PUBLIC_SITE_URL)
  styles/                  home.css (approved landing-page styles), projects.css (library/case studies)
  fonts/                   bundled Geist, Geist Mono, Pacifico (+ licenses)
public/images/             project imagery and the portrait
public/resume.pdf          the resume
design/approved-landing-page/  (repo root) the approved design package the homepage reproduces
```

Homepage highlights, library cards, carousel objects, filters, counts, detail pages, metadata, and the sitemap are all derived from `src/content/projects/`. There is no second list to keep in sync.

## Adding a project

1. Copy `src/content/projects/_TEMPLATE.mdx` to `src/content/projects/<slug>.mdx`. The file name is the URL (`/projects/<slug>`): lowercase letters, numbers, and hyphens.
2. Fill in the frontmatter (see the template for every option) and write the case study below it in Markdown/MDX. Use `##` headings for sections; only write sections you can support.
3. Add images (next section) and reference them as `/images/...`.
4. Pick `fields`, an `order` (position in the "Recommended" sort), and optionally `featured` / `hero` placement.
5. Set `draft: false`, run `npm run validate`, preview with `npm run dev`, then deploy as usual.

Nothing else changes: no card, layout, route, or filter code.

### Adding images

Put files under `public/images/` and reference them by site-relative path. Dimensions are read automatically. Every image needs `alt` text. Use `fit: contain` for screenshots and diagrams and `fit: cover` for photos; `position` accepts any CSS `object-position`. Set `kind` (`screenshot`, `photo`, `render`, `diagram`, `illustration`) so the page labels what the image is. Extra evidence goes in `gallery:` or inline with `<Figure src alt caption kind />`.

### Selecting fields

`fields` takes ids from `src/content/fields.js` (`hardware`, `frontend`, `backend`, `cloud`, `embedded`, `automation`). A project may have several fields or none. Assign fields for the engineering work actually done; list tools in `technologies` instead. Filters and the homepage "Find work in your field" strip only show fields that have at least one published project.

### Changing homepage highlights

Set `featured: 1` for the large lead card and `featured: 2`, `3` for the supporting cards (ranks must be unique). `card.visual` picks the supporting-card graphic: `image` (default), `board` (cropped PCB), `stages` (five-stage illustration), `screenshot`. `card.action` sets the action label.

To put a project in the hero carousel, add a `hero:` block with a unique `order` and a `treatment`: `frame` (default framed cover), `print`, `screen`, `board`, `paper`, or `terminal` (text-only, uses `headline`/`lines`). New projects should normally use the default; bespoke treatments are optional.

### Changing the recommended order

Edit `order` (lower = earlier). "Newest"/"Oldest" use `date`; undated projects always sort after dated ones. Editing text never changes a project's position.

### Publishing a draft

Change `draft: true` to `draft: false`. Drafts are excluded from the library, homepage, detail routes (404), and sitemap. `status` (`complete`, `in-progress`, `paused`, `archived`) is separate: an in-progress project can be published.

### Adding a new field

Append to `FIELDS` in `src/content/fields.js` with a stable `id` (never rename ids once used), a `label`, and a `description`. It appears in filters as soon as a published project uses it.

### Updating profile information

Edit `src/content/profile.js`: name, email, GitHub, LinkedIn, portrait, introduction copy, hero labels, footer. The introduction heading, tagline, and side labels come from there too.

### Updating the resume

Replace `public/resume.pdf` (keep the name, or change `profile.resume`).

### Running validation and production checks

`npm run check` runs everything. Validation catches duplicate slugs, unknown fields, missing required metadata, invalid dates, missing images, malformed URLs, and duplicate featured/hero ranks, and fails the build.

## Motion system

Timings and easings live in `src/lib/motion.js` and `:root` in `src/app/globals.css`; a regression test keeps their values in sync. Styles are in `src/styles/motion.css`. The current behaviour is documented in `../design/MOTION-UPDATE.md`, which supersedes the earlier motion specification and recordings.

- **Scroll reveals:** add `data-reveal` to a section, heading, image, or card. Content is visible by default. A 260ms fade and 8px movement plays when it enters from either direction, re-arming only after it fully leaves the extended viewport. Above-the-fold content does not get a second entrance on navigation. New projects inherit card reveals, hover, and grid animation automatically.
- **Page transition:** `PageTransition` fades the destination's `<main>` in (260ms), without moving the page or header. Query-only changes animate the grid instead. Native anchor scrolling stays smooth; route changes use Next's scroll handling.
- **Page scrolling:** `SmoothScroll` uses Lenis to ease the actual window scroll position in both directions (`lerp: 0.12`). Touch stays native; keyboard, focus, anchors and navigation cancel leftover wheel momentum. Nested scroll areas remain independent. Enabling reduced motion destroys the scroller and restores native scrolling immediately.
- **Droplet entrance:** one timeline controls fall and impact; overlapping brush tips grow along the original lettering with balanced left/right timing. The name completes at 760ms; the carousel fades into its normal drift by 1080ms. Plays once per tab session. Reduced-motion and no-JS visitors see the finished name.
- Everything respects `prefers-reduced-motion`, including changes while the page is open.

## About page

The menu links to `/about` from every route, including mobile. The homepage retains its introduction and adds a `More about me` link. The standalone page reads profile information and populated project fields from the same content sources; it is included in the sitemap.

To check a production build without disturbing an existing dev server, run `NEXT_OUTPUT_DIR=.next-review npm run check`. To preview that build, use the same variable with `npm run start -- --port 3001`.

## Visual review aids

- Append `?entrance=1` to the homepage to replay the droplet entrance, or `?entrance=<ms>` to freeze it at that moment (development builds only).

- Append `?still=1&phase=0.27` to the homepage to pause the carousel at a given phase. Available in `npm run dev`, and in production builds only when built with `CAROUSEL_REVIEW=1`.
- `node scripts/screenshot.mjs [baseUrl] [outDir]` captures the same viewports/phases as `design/approved-landing-page/screenshots/README.md` (needs Playwright; set `CHROMIUM_PATH` to use a specific Chromium).

## Deployment notes

- Set `NEXT_PUBLIC_SITE_URL` (e.g. `https://example.com`) so the sitemap and Open Graph URLs are absolute. No domain is configured in this repository; without the variable they fall back to `http://localhost:3000`.
- Image optimisation uses Next's built-in loader; on hosts without it, add `images.unoptimized: true` in `next.config.mjs`.
