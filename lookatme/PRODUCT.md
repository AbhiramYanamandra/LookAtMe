# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary:** technical recruiters and engineering hiring managers evaluating Abhiram Yanamandra for software and hardware roles. This is one audience at two reading speeds, and both must be served by the same material:

- *The skim.* Arrives from a résumé link, LinkedIn, or GitHub — often with the résumé open alongside. Forms a verdict in well under a minute.
- *The deep read.* Opens an actual project and judges whether the engineering is real.

**Secondary, confirmed as present but not designed for first:** grad school and research readers, peer engineers, and anyone who finds the site publicly.

## Product Purpose

A personal portfolio whose job is **conviction, not conversion**. A successful visit ends with the visitor believing Abhiram can actually build — across both software and hardware. Contact, résumé downloads, and name recall are welcome outcomes but are not the measure of success. The measure is belief earned from the work shown.

This matters for every future decision: the site is not optimizing a funnel. It is assembling an argument.

## Positioning

Range that is actually demonstrated. One engineer whose work runs from circuit boards and a five-stage pipelined processor through to browser applications — *from circuits to interfaces*. Plenty of portfolios claim full-stack; this one claims a span across hardware, embedded, and web, and the claim is only as good as the artifacts behind it.

*Derived from the user's own authored copy in `src/content/profile.js` and from the field taxonomy they confirmed as binding, rather than stated directly in the interview. Correct this section if the intended position is narrower.*

## Operating Context

- Visitors arrive from a résumé link, LinkedIn, or GitHub more than from search.
- Routes: `/` (home), `/about`, `/projects` (filterable library), `/projects/<slug>` (case study), plus `sitemap` and a 404.
- The library is browsed by engineering field through `?field=<id>` URLs. Sort options are **derived from the data**: date sorts are offered only when projects actually carry dates, so the control can never report an order change that did not happen. No published project currently has a date, so only Recommended and Title A–Z appear.
- `public/resume.pdf` is the live résumé, linked from the about page.
- Authoring is a file workflow: add one MDX file under `src/content/projects/`, run `npm run validate`, preview with `npm run dev`, deploy. `npm run check` runs validate → lint → test → build, and invalid content fails the build.

## Capabilities and Constraints

**Binding — confirmed by the user:**

- **One MDX file per project** under `src/content/projects/` is the single source of truth. Homepage highlights, hero carousel objects, library cards, filters, counts, detail pages, metadata, and the sitemap all derive from it. No second list exists, and none may be introduced.
- **The engineering-field taxonomy** in `src/content/fields.js` is the browsing model. Current ids: `research`, `ml`, `fpga`, `hardware`, `frontend`, `backend`, `cloud`, `embedded`, `automation`. Ids are stable and must never be renamed once a project uses one; change `label` instead. Filters and the homepage field strip show only fields with at least one published project.

- **One MDX file per role** under `src/content/experience/` is the parallel collection for work history. Same shape, same validator, same build gate. A role's write-up page exists only when the file has a body (`hasStory` is derived, never declared), so a role is never linked to an empty page.

**Content model facts:**

- `fields` describes the engineering work performed; `technologies` lists tools. These stay separate.
- `draft: true` hides a project everywhere — library, homepage, detail route (404s), and sitemap. `status` (`complete` / `in-progress` / `paused` / `archived`) is independent of publication; an in-progress project can be published.
- Every image requires `alt` text; content validation enforces it. `kind` (`screenshot` / `photo` / `render` / `diagram` / `illustration`) labels what an image actually is.

**Technical:**

- Next.js 15 App Router, JavaScript (not TypeScript), React 19, Tailwind 3 plus hand-written per-surface CSS, MDX content. Geist, Geist Mono, and Pacifico are bundled locally with licenses.
- Image optimisation uses Next's built-in loader; hosts without it need `images.unoptimized: true`.

**Not pinned — open to future decisions:**

- `prefers-reduced-motion` support and keyboard accessibility are implemented across every surface today, but were not selected as binding. Treat as existing behavior to preserve by default, not as a stated requirement.
- The current visual identity (black with electric blue `#1685ff`, the `ay.` wordmark, the droplet entrance, the documented motion system) is the incumbent implementation and was **explicitly not selected as binding**. It is design authority for refinement work, and open to replacement if a redesign is requested.

**Undecided — do not invent:**

- No production domain. `NEXT_PUBLIC_SITE_URL` is unset, so the sitemap and Open Graph URLs fall back to `http://localhost:3000`.

## Brand Commitments

Name: **Abhiram Yanamandra**. Wordmark in use: `ay.` Contact: `ysabhiram@gmail.com`, plus GitHub and LinkedIn as recorded in `src/content/profile.js`.

**Voice**, as authored by the user in the existing copy: first person, plain, understated, curiosity-forward — *"Curious about how things work, and what I can make with them."* Short declaratives. No superlatives, no seniority claims, no sales language.

**An honesty convention already exists in the content and must be preserved.** Case studies use a `<Note>` component to state plainly what has *not* been written up yet, and captions disclose when an image is reference material rather than the project's own output. Even the strongest project (Presto) carries a note saying the editor breakdown and stack are still to be written. This refusal to overclaim is a real commitment of the product, not an oversight to clean up.

No binding aesthetic direction, palette, typeface, or visual reference was given.

## Evidence on Hand

**Work history** — four roles, recorded on `/background`: Lightspeed Photonics (test engineering intern, Jan 2026 – Feb 2026), UNSW Redback Racing (telemetry and firmware, Sep 2023 – Jun 2025), Belgravia Leisure (lifeguard, Sep 2022 – May 2023), Singapore Armed Forces (training clerk, Jan 2020 – Jan 2022).

**The career evidence database** at `Jobplicator_Career_Evidence_Database_v1.0.json` is the source of truth for project and role write-ups. Every one of its 62 evidence items is user-verified and carries a `claim_restriction`; several are explicitly **restricted and must never be used**: the Redback lap-time causality claim, Lightspeed's "+20% accuracy / 5 engineers / production adoption", any cloud/DevOps experience claim, and any smartwatch low-power optimisation claim. Team results must not be presented as sole ownership.

**Real and substantiated:**

- `public/resume.pdf` — the live résumé.
- **Education:** UNSW Sydney, Bachelor of Engineering (Honours) in Computer Engineering, honours thesis 89 HD. Published coursework is every course marked 80 or above, taken verbatim from the official academic statement: COMP6080 (91 HD), COMP1531 (89 HD), ELEC2133 (85 HD), DESN2000 (84 DN), DESN1000 (81 DN), COMP3121 (80 DN).
- **The official UNSW academic statement resolved three things the evidence database had wrong or unverified.** WAM is **72.125**, not the 70.0 the database carried (still not published). The database's "Engineering Design / DESN1000 | 92 HD" is wrong — the transcript marks it **81 DN**. The database's "Database Systems / COMP3311 | 92 HD" is not supported at all: COMP3311 appears as a **transfer credit from UTS with no numeric mark**. Treat the transcript as canonical over the database for any academic claim.
- **Open question on the degree period.** The site states `Mar 2022 — 2026` under UNSW Sydney, but the UNSW undergraduate record begins **Term 1 2023**; the earlier study is transfer credit from the University of Technology Sydney. The span is defensible as total time in the degree but is not UNSW-only. Left as the user wrote it pending their decision.
- `public/images/me.jpeg` — portrait.
- Four project images: `macropad.png` (PCB render), `processor.png`, `presto.png` (actual application screenshot), `typemonke.jpeg`.
- **Presto** — browser-based presentation builder, frontend; real screenshot of a signed-in session.
- **3×3 Macropad** — nine-key PCB with per-key RGB and programmable layers, hardware; full PCB render.
- **Five-stage processor** — pipelined MIPS-style datapath extended to support Branch Not Equal, hardware.
- **Folder Sorter** — a real, modest Python automation script.

**Absences that future work must not fabricate:**

- **Five of the eight published projects are placeholders**, by the user's own statement: Code Generator, Number Guessing Game, Tic-Tac-Toe, TypeMonke, and Folder Sorter. Only Presto, the 3×3 Macropad, and the Five-stage processor carry substantiated write-ups. Each is a one-line summary with a stub body and, in most cases, no imagery, fields, technologies, or date. Real case studies and imagery are planned. Design must hold that gap honestly rather than dress it up or imply depth that does not exist.
- `expensify.mdx` and `trust.mdx` are drafts with no verified stack, field, imagery, or detail; their own file comments say so.
- **No testimonials, employers, clients, press, metrics, user counts, awards, or employment dates exist anywhere in the repository.** None may be invented.
- Two covers are explicitly labeled as reference material rather than the project's own output: `processor.png` is a reference diagram of the standard five-stage architecture (not Abhiram's schematic or a simulation capture), and the macropad caption notes that the carousel and homepage card use a tight CSS crop of the same render. Captions must keep saying so.

## Product Principles

1. **Evidence over assertion.** The site's only job is belief, so every claim must be traceable to an artifact on the page. Where there is no artifact, say less rather than more.
2. **Serve the skim and the deep read with the same material.** A recruiter's forty seconds and a hiring manager's five minutes are the same audience at two depths. Never make one of those reads cost the other.
3. **Range is the argument.** Hardware sitting next to web is the point, not an inconsistency to tidy away. The field taxonomy carries that argument and stays the navigational spine.
4. **Content authors the interface.** A new project must land fully formed through a single MDX file. Any design that needs hand-tuning per project is wrong.
5. **Honest placeholders.** A thin project should read as *not written up yet* — never as a finished small thing. Five of the eight published projects are currently in that state, and pretending otherwise damages the exact belief the site exists to produce.

## Accessibility & Inclusion

No product-specific standard was established in the interview. The existing implementation is the current floor and should not regress: `prefers-reduced-motion` honored across all animation (including when toggled while the page is open), visible focus rings, labeled sections via `aria-labelledby`, and alt text enforced by content validation.
