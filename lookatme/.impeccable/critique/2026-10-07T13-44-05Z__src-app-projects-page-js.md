---
target: projects page
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
target_identity: "file:/Users/ysabhiram/Desktop/Personal_Projects/LookAtMe/lookatme/src/app/projects/page.js"
target_fingerprint: "sha256:b2cae24c6d92ffb0ab5f9b25ff5765a5c82cd0df6e2bd92d883a7e0a03d21e60"
target_path: /Users/ysabhiram/Desktop/Personal_Projects/LookAtMe/lookatme/src/app/projects/page.js
timestamp: 2026-10-07T13-44-05Z
slug: src-app-projects-page-js
---
Method: dual-agent (A: design review, isolated · B: detector + browser evidence, isolated).

# Critique: Project Library — src/app/projects/page.js

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Status line prints "· sorted by newest" when the order did not change |
| 2 | Match System / Real World | 2 | Card badges use a vocabulary absent from the filter chips |
| 3 | User Control and Freedom | 3 | URL state + Reset; active chip is a no-op, not a deselect |
| 4 | Consistency and Standards | 2 | Two taxonomies; h1/h2 full Instrument Blue on static text vs Blue-Is-Live rule |
| 5 | Error Prevention | 3 | Unknown ?field= falls back safely; date sorts offered on a dateless dataset |
| 6 | Recognition Rather Than Recall | 3 | Chip counts + field echo; overview goes stale after filtering |
| 7 | Flexibility and Efficiency | 2 | No multi-select, no search, no technology filter |
| 8 | Aesthetic and Minimalist Design | 2 | Overview is a complete second index: 337px desktop / 709px mobile |
| 9 | Error Recovery | 3 | Empty state honest; never names an adjacent field with results |
| 10 | Help and Documentation | 3 | Field descriptions are real docs; "Recommended" never explained |
| **Total** | | **25/40** | **Acceptable** |

All ten heuristics apply (Operate-mode index).

## Design Specificity Verdict

The content model is authored for this product; the composition is not. Genuinely specific: card.action-driven link names, dashed empty state, Pacifico placeholder initial, mono chip counts, the "Smaller builds" group. But the page shape is the stock filterable-portfolio index. A PCB and a web app occupy the same 391x411 box at identical weight, so the range PRODUCT.md calls "the argument" is asserted by adjacency, never staged. The Spec Annotations — the one component nothing else on the web has — are explicitly opted out of here, the page where the hiring manager decides what to read.

Deterministic scan: component tree CLEAN (0 findings, exit 0) across src/app/projects and src/components/project, verified three ways. URL mode: 13 findings desktop / 12 mobile / 5 empty, all warnings — undersized-ui-text x8 (10px card badges, REAL), dark-glow x2 (one is the logo focus ring, partial false positive), kicker-above-heading x2 (FALSE POSITIVE — the Bracket Rule is the committed world), line-length x1 (2-line sample). projects.css carries 62 advisories (42 font-size, 19 color) = the known token drift already recorded as a Don't. side-tab warning at projects.css:524 is the <Note> component — FALSE POSITIVE, documented signature component.

No browser overlay was injected; evidence is scripted Playwright measurement, not a [Human] overlay tab.

## Overall Impression

Technically strong, strategically confused. Zero console errors, zero horizontal overflow, zero contrast failures, valid heading outline, no unnamed controls, correct aria-live, excellent reduced-motion path. What is wrong is editorial: eight projects presented as eight equal things, twice, with a sort control that lies, when five of eight are stubs.

## What's Working

1. The filter toolbar is the one region built to standard and it measured clean — every chip, the select, Reset filters and Show all projects at exactly 44px at both viewports.
2. Honest absence implemented as a system: dashed border for genuine emptiness, Pacifico initial + NO IMAGE YET, synthetic "Cloud 0" chip so the toolbar always shows which filter produced the result.
3. Real progressive enhancement, verified both ways: no-JS serves all 8 cards at opacity 1 with identical document height; reduced-motion measured before scrolling shows 0 of 13 reveals hidden, transition none, getAnimations() = 0.

## Priority Issues

### [P0] Two sort options do nothing, and the status line certifies that they did
Verified rendered order: recommended / newest / oldest are byte-identical; title A-Z genuinely differs. No published project has a date. The status line still renders "· sorted by newest" and surfaces Reset filters. 2 of 4 options inert (not 3 of 4).
Fix: derive options from data in project-queries.js; if no dates exist render only Recommended and Title A-Z. Never print "sorted by X" unless order changed.
Command: /impeccable harden src/lib/project-queries.js

### [P1] A card gives no signal whether there is a write-up behind the link
All eight cards identical in size/weight/affordance. Five of eight clicks land on a stub. The <Note> honesty signal only appears after the click.
Fix: populate the currently-dead .pl-card-meta row with a mono write-up reading; make the grid heterogeneous (3 substantiated at full size, 5 stubs compact).
Command: /impeccable layout src/components/project/ProjectCard.jsx

### [P1] The overview is a second complete index, and it ignores the filter
LibraryOverview renders from the unfiltered array. On ?field=cloud the heading still reads "8 projects across 3 fields." and lists all eight, 400px above the dashed empty box. Costs 337px desktop / 709px mobile. Mobile toolbar starts at 1108px; empty state at 1380px.
Fix: delete it and move field descriptions into the toolbar, or demote to one row of field tiles mirroring the active filter.
Command: /impeccable distill src/components/project/LibraryOverview.jsx

### [P1] Two taxonomies on one page, and the chips reach half the library
Chips use field labels; badges use WEB APPLICATION / DIGITAL SYSTEMS / CIPHER TOOL / GAME. Only 3x3 Macropad matches. 4 of 8 published projects have fields: [] and are unreachable by any chip = 50% coverage, unstated.
Fix: render the field label in FieldBadge always, demote badge to the mono meta row, add an "Unfiled 4" chip or assign fields.
Command: /impeccable clarify src/components/project/CardBody.jsx

### [P2] The real evidence does not survive the thumbnail
190px band: Presto renders 356x155 (UI at ~4px type), processor.png becomes grey noise and is the only pure-white area on a page whose DESIGN.md says don't use white. Neither carries the reference-material disclosure PRODUCT.md requires. Measured: macropad.png serves natural 298x194 into a 325x239 box (CardVisuals.jsx:16 hardcodes width={298}); every card image declares a width/height ratio that mismatches its rendered box (typemonke 1:1 into 2.31:1) so CLS reservation is wrong.
Fix: optional focal region on cover; REFERENCE DIAGRAM mono line; fix macropad width/sizes.
Command: /impeccable polish src/components/project/CardVisuals.jsx

## Persona Red Flags

Alex (power user): ?sort=newest returns Recommended order while the status line claims otherwise; single-select chips; no search or technology filter despite technologies in the model; active chip is a no-op; Reset clears field and sort together.

Jordan (first-timer): "Recommended" never explained; "Smaller builds" has no chip; "Showing 8 of 8 projects" teaches the status line is noise before it carries signal; DIGITAL SYSTEMS under the Hardware filter makes the filter look unreliable.

Riley (stress tester): well defended (Cloud 0 chip, ?field= fallback, ?sort=garbage normalises) but the "empty" page still lists all eight projects 400px above the dashed box; the empty state never names a field that does have results; ?sort=newest normalises while claiming otherwise.

Casey (mobile 390): 709px of overview before the first card; 4,885px page; Presto illegible at ~330px; toolbar stacks to 194px (2.4x desktop); four of the last five cards are NO IMAGE YET. Credit: all toolbar controls meet 44px.

Riya (hiring manager, 5 minutes — derived from PRODUCT.md audience): arrives to answer "can he build?", gets a table of contents then a grid where a nine-key PCB and a tic-tac-toe exercise are the same size. If her second click is a stub she closes the tab, and the two projects that would have convinced her are never read.

## Minor Observations

- 36 of 41 interactive elements under 44x44 outside the toolbar; header nav links 16.5px tall on mobile (37% of minimum); footer links 18px.
- No skip link anywhere (WCAG 2.4.1). First filter chip is tab 17; the overview consumes stops 7-16.
- Every project reachable twice by keyboard; 8 projects produce 24 tab stops.
- .pl-card-visual--placeholder is aria-hidden on the whole container, so NO IMAGE YET is invisible to screen readers — the honesty commitment is sighted-only.
- Placeholder initial measures 3.00:1, exactly on the large-text threshold, zero headroom (decorative/aria-hidden).
- "8 projects across 3 fields." sits above four overview cards.
- .pl-overview-grid renders a trailing 0px track at desktop.
- .pl-grid fixed repeat(3,1fr) leaves an empty third column when filtered to Hardware Engineering.
- Next.js warns presto.png is LCP without priority (desktop only).
- Active chips use aria-current="true"; "page" would be more precise.
- Presto's screenshot contains a saturated purple button — the most chromatic pixel on a single-ink page.

## Questions to Consider

1. If five of eight projects are stubs, why does the default sort show all eight at equal size?
2. Is the field taxonomy the browsing spine, or an argument about range doing a filing job it cannot do at 8 items?
3. Why is the identity thinnest exactly where the decision is made?
4. What breaks if you delete the overview, the sort control, and the status line?
5. Name the one moment on this page where conviction is produced. I count one — the macropad render — and it is produced by a photograph.
