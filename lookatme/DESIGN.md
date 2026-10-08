---
name: Abhiram Yanamandra — Portfolio
description: Instrument Blue on pure black — a drafting system, hand-signed.
colors:
  instrument-blue: "#1685ff"
  instrument-blue-soft: "#82b8ff"
  instrument-blue-hover: "#afc7ff"
  void-black: "#000000"
  near-black: "#050505"
  surface: "#080d16"
  surface-raised: "#070e19"
  control-surface: "#0b1a2e"
  border: "#1b3559"
  border-soft: "#192436"
  border-control: "#24538b"
  separator: "#223651"
  text-card: "#b1bfd5"
  text-intro: "#bcc9dd"
  text-control: "#88bcff"
  text-muted: "#8192ae"
  text-faint: "#647b9f"
  text-emphasis: "#d4e1ff"
  badge-bg: "#0b2342"
  badge-text: "#80bbff"
  badge-border: "#173d6a"
typography:
  signature:
    fontFamily: "Pacifico, cursive"
    fontSize: "20cqw"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.055em"
  display:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "clamp(46px, 5.5vw, 76px)"
    fontWeight: 450
    lineHeight: 1.04
    letterSpacing: "-0.055em"
  headline:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "clamp(30px, 3.5vw, 46px)"
    fontWeight: 450
    lineHeight: 1.12
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "29px"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.8px"
  body:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.07em"
rounded:
  xs: "4px"
  sm: "5px"
  md: "6px"
  lg: "8px"
  xl: "10px"
  xxl: "12px"
  pill: "20px"
  full: "50%"
spacing:
  xs: "8px"
  sm: "12px"
  md: "20px"
  lg: "24px"
  gutter: "34px"
  xl: "46px"
  xxl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.instrument-blue}"
    textColor: "{colors.void-black}"
    rounded: "{rounded.md}"
    padding: "12px 18px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.instrument-blue-hover}"
  logo-tile:
    backgroundColor: "{colors.instrument-blue}"
    textColor: "{colors.near-black}"
    rounded: "{rounded.lg}"
    size: "42px"
  chip:
    backgroundColor: "{colors.control-surface}"
    textColor: "{colors.text-control}"
    rounded: "{rounded.sm}"
    padding: "10px 13px"
    height: "44px"
  chip-hover:
    textColor: "{colors.instrument-blue}"
  chip-active:
    backgroundColor: "{colors.instrument-blue}"
    textColor: "{colors.near-black}"
  select:
    backgroundColor: "{colors.control-surface}"
    textColor: "{colors.text-control}"
    rounded: "{rounded.sm}"
    padding: "10px 32px 10px 13px"
    height: "44px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-card}"
    rounded: "{rounded.xxl}"
    padding: "24px"
  badge:
    backgroundColor: "{colors.badge-bg}"
    textColor: "{colors.badge-text}"
    rounded: "{rounded.xs}"
    padding: "4px 7px"
  note:
    backgroundColor: "{colors.control-surface}"
    textColor: "#a4b9d8"
    rounded: "{rounded.md}"
    padding: "14px 16px"
---

# Design System: Abhiram Yanamandra — Portfolio

## Overview

**Creative North Star: "The Signed Blueprint"**

This is an engineering drawing rendered in blue on black, and then signed by hand across the middle of it. Every surface behaves like a sheet of drafting paper that has been annotated: bracketed mono callouts sit in the margins (`[ Hi, I'm Abhiram. ]`, `[ Selected engineering work ]`), counts and field names are set in monospace at annotation scale, and borders are hairlines rather than frames. Against that discipline, one element is unmistakably human — the Pacifico wordmark, tilted −5°, glowing, laid over the whole hero. The tension between the drafted and the drawn is the entire identity. Blue is both the drafting ink and the light source; it is the only chroma in the system.

The mood is **handmade** and **technical, unembellished**. Nothing here is decorative for its own sake: the mono layer carries real information (field counts, image kind, project status), the glow marks things that are live, and the tilted objects are tilted because a hand placed them. The system reads as instrumentation that someone built rather than a template someone filled. That combination is also the argument the portfolio is making — a person who works from circuits to interfaces — so the visual world and the product claim are the same claim.

Depth works on two tracks that never mix. Interface state is communicated with soft blue light, atmospheric and blurred. Physical objects — a portrait, a PCB, a printed sheet, a terminal — are pasted down with a hard, zero-blur offset shadow, as if stuck to the black. A card glowing and a card pasted down mean two different things, and the system never blurs that distinction.

**Key Characteristics:**

- Pure black ground (`#000000`), never a light surface; the whole system is `color-scheme: dark`.
- Exactly one chroma: Instrument Blue. Every other value is a blue-leaning neutral.
- A bracketed monospace annotation layer running across every surface at 9–11px.
- One signature typeface, used exactly twice in the entire system.
- Two depth languages with strictly assigned jobs: glow for state, hard offset for objects.
- Tilt belongs to hand-placed objects only; interface chrome stays square to the grid.

## Colors

A monochrome blue system: one saturated accent against a black ground, with every neutral pulled toward blue so nothing reads as true gray.

### Primary

- **Instrument Blue** (`#1685ff`): the oscilloscope-trace blue that carries the entire system. It marks links, active filter chips, the logo tile, card titles, case-study headings, focus rings, and the hover border on every interactive surface. It is also the light source — every glow in the system is this hue at low alpha. Because it is the only chroma, its appearance is always meaningful.
- **Instrument Blue Soft** (`#82b8ff`): secondary action text and card-level affordance labels, where full-strength blue would over-signal.
- **Instrument Blue Hover** (`#afc7ff`): the lightened state for navigation links and the primary button on hover. Blue gets *lighter* on hover, never darker — the metaphor is a light source being turned up.

### Neutral

- **Void Black** (`#000000`): the page ground on every route. Not a dark gray; the true zero.
- **Near Black** (`#050505`): the header's gradient scrim, and the text color printed *onto* blue fills (logo tile, active chip, primary button). Blue surfaces always carry near-black type, never white.
- **Surface** (`#080d16`) and **Surface Raised** (`#070e19`): the barely-lifted panel tones for cards and field tiles. The lift is roughly two percent of luminance — felt, not seen.
- **Control Surface** (`#0b1a2e`): the slightly warmer blue-black behind filter chips, the sort select, and inline notes. Controls sit on a different tone than content cards, which is how the library separates chrome from work.
- **Border** (`#1b3559`), **Border Soft** (`#192436`), **Separator** (`#223651`), **Border Control** (`#24538b`): the hairline vocabulary. Four weights of the same idea, ordered from most structural (control outlines) to most incidental (section rules). Every one is 1px.
- **Text Card** (`#b1bfd5`), **Text Intro** (`#bcc9dd`), **Text Control** (`#88bcff`), **Text Muted** (`#8192ae`), **Text Faint** (`#647b9f`): the readable ladder. Body copy sits at the top, annotation metadata at the bottom. Each step down is both darker and bluer.
- **Text Emphasis** (`#d4e1ff`): near-white, reserved for `<strong>` inside prose and for sub-headings in case studies. This is the brightest text in the system and the closest it comes to white.
- **Badge** (`#0b2342` / `#80bbff` / `#173d6a`): the three-part field-badge recipe — deep fill, bright type, mid border.

### Named Rules

**The Single Ink Rule.** Instrument Blue is the only chroma in the system. There is no success green, no warning amber, no per-field color coding. If a state needs to be distinguished, it is distinguished by weight, fill, border, or annotation — never by introducing a second hue.

**The Blue-Is-Live Rule.** Blue means *something is active or reachable here*. It is never applied as decoration, never used to fill an area for visual interest, and never applied to static text that cannot be acted on. Card titles are blue because the whole card is a link.

**The Blue Carries Black Rule.** Any surface filled with Instrument Blue takes near-black type (`#050505`), never white. This holds for the logo tile, the active chip, and the primary button, and it is what keeps the accent reading as emitted light rather than painted plastic.

## Typography

**Display Font:** Geist (with Arial, sans-serif) — bundled locally at `src/fonts/geist.woff2`, variable weight 100–900.
**Body Font:** Geist (same family; the system is a single sans used across the full weight range).
**Label/Mono Font:** Geist Mono (with ui-monospace, monospace) — the annotation layer.
**Signature Font:** Pacifico (with cursive) — the hand.

**Character:** A neutral, slightly technical grotesque doing all the structural work, undercut by a monospace annotation layer that makes every surface feel measured and labeled. Headings run at unusually light weights (450–500) with aggressive negative tracking (−0.04em to −0.055em), which keeps large type quiet and wide rather than loud and tight. Then one script face, used almost never, carries the entire human register of the system.

### Hierarchy

- **Signature** (Pacifico, 400, `20cqw`, line-height 1.5, −0.055em): the hero wordmark. Sized in container query units so it scales with the hero rather than the viewport, rotated −5°, and lit with a blue text-shadow. It appears in exactly one other place — see The One Signature Rule.
- **Display** (450, `clamp(46px, 5.5vw, 76px)`, line-height 1.04, −0.055em): page-level `h1`. Set with `text-wrap: balance` and capped near 620px so it breaks into deliberate lines rather than filling the column.
- **Headline** (450, `clamp(30px, 3.5vw, 46px)`, line-height 1.12, −0.04em): major section headings. Frequently written as two short lines with an explicit `<br />` ("Different fields. / Shared curiosity.") — the break is authored, not accidental.
- **Title** (500, 29px on the homepage lead card / 24px in the library grid, line-height 1.1, −0.8px): card titles. Always Instrument Blue, always the link target.
- **Body** (400, 15px in case studies / 14px in intros / 13px on cards, line-height 1.75–1.8): prose. Long-form reading is capped at 680px; intro columns at 400–490px. Line height is generous for the size — this system reads slowly on purpose.
- **Label** (400, 9–11px, uppercase, +0.04em to +0.08em, Geist Mono): the annotation layer. Field counts, image kinds, status, captions, eyebrow text, carousel footnotes. Available globally as `.al-mono`.

### Named Rules

**The Bracket Rule.** Editorial mono labels are wrapped in square brackets with a space inside each bracket: `[ Selected engineering work ]`, `[ What I build ]`, `[ Get in touch ]`. The brackets are the annotation mark of the system — they say *this is a note about the page, not content on it*. Mono used for data rather than commentary (counts, dimensions, treatment names) is written bare, without brackets.

**The One Signature Rule.** Pacifico appears exactly twice in the entire system: the hero wordmark, and the oversized initial inside the placeholder tile of a project that has no imagery. Both are moments where a human hand stands in for something that isn't there — a logo, or a missing picture. Spending the script anywhere else devalues both.

**The Light Heading Rule.** Headings get lighter as they get larger. Display and Headline sit at 450, Title at 500, and body `<strong>` at 500. Nothing in this system is bold. Scale and tracking create hierarchy; weight does not.

## Layout

A centered single-column document model with one consistent gutter. Pages cap at **1280px** (`.ab-page`, `.pl-page`) and narrow to **1120px** for case studies (`.pl-page--narrow`); the page gutter is **34px** on every route and matches the hero's internal inset, so the wordmark, the navigation, and the body grid all align to the same edge. Long-form prose is capped at **680px**; intro and lead paragraphs at **400–620px**.

Content grids are three columns of `minmax(0, 1fr)` at a 20px gap (library grid, about-page field tiles). The homepage featured grid is deliberately asymmetric — `1.18fr 1fr` with the lead card spanning two rows — so the primary project is larger than its supports rather than merely first. Vertical rhythm comes from section padding (42–64px) with a 1px top border on each new section; the border, not whitespace alone, is what separates sections.

The hero is a fixed **720px** block with `container-type: inline-size`, which is what allows the wordmark to size in `cqw` and stay proportional to the hero rather than the window.

**Responsive behavior** collapses at **700px**, the dominant breakpoint: multi-column grids become single column, the header's static variant takes over, and side-rail labels drop. Secondary adjustments happen at 900px (field tiles tighten), 520px, and 470px.

**Observed gap:** the stylesheets contain fourteen distinct `max-width` breakpoints (1146px, 1050px, 950px, 850px, 800px, 750px, 650px, 542px, 499px, 470px, and others) that were tuned per-component rather than chosen as a scale. New work should land on 700px / 900px / 520px and resist adding a fifteenth.

### Named Rules

**The Single Gutter Rule.** Every route uses the same 34px page gutter and the same 1280px cap. A surface that needs more room narrows its *content* (680px prose, 400px intro), never its gutter.

**The Hairline Rule.** Sections are separated by a 1px border, not by whitespace alone. The rule is the drafting line; removing it and padding instead breaks the blueprint metaphor.

## Elevation & Depth

This system runs **two depth languages with strictly assigned jobs**, and the separation is doctrine. Surfaces are otherwise flat — tonal layering (`#000000` → `#080d16` → `#0b1a2e`) does nearly all the structural work, and the lift between steps is deliberately almost invisible.

**Glow communicates state.** Soft, large-radius, zero-offset blue light at very low alpha. It appears on the wordmark, the logo tile, and card hover — things that are live, focused, or emitting.

**Hard offset communicates objecthood.** Zero-blur shadows at a fixed offset, as if the element were a physical print stuck to the black. It appears on the portrait and on the hero carousel pieces — things that are supposed to read as objects you could pick up.

### Shadow Vocabulary

**Glow — state:**
- **Wordmark glow** (`text-shadow: 0 0 35px #1685ff32, 0 0 100px #0879ff12`): two-stage halo, tight and wide, for the signature only.
- **Logo glow** (`box-shadow: 0 0 26px #1685ff30`): the header tile's ambient light.
- **Card glow** (`box-shadow: 0 0 27px #1685ff14`): the hover and `:focus-within` response on project cards, paired with a border shift to full blue. Transitions over 180ms.

**Hard offset — objects:**
- **Portrait paste** (`box-shadow: 8px 8px 0 #1685ff`): the heaviest offset in the system, in full accent blue, under a −3° tilted portrait. The single loudest gesture on any page.
- **Object paste** (`box-shadow: 3px 5px 0 <tone>`, e.g. `#1f2c40`, `#192820`, `#717c6b`): carousel treatments, each keyed to its own material tone rather than to blue.
- **Object paste, lit** (`box-shadow: 7px 7px 0 #1685ff, 0 12px 35px #0007`): the print treatment, which takes both an accent offset and a deep ambient drop.

**Ambient drop** (`0 16px 35px #0009`, `0 12px 30px #0009`) is used under photographic imagery only, to separate a photo from the black behind it. It is not a depth signal; it is a contrast fix.

**The signature conducts.** Every few seconds a pulse of light travels the wordmark along its authored pen path (`src/lib/wordmark-path.js`) in the exact order the hand wrote the name — the same skeleton the droplet entrance paints along. Three additive passes: a `0.24em` blue atmosphere, a `0.085em` conducting blue, and a `0.036em` white-hot core, with a tight `0.15em` head bloom laid down *first* so the filament draws on top of it rather than being swallowed by it. The core must be near-white: the lettering is already solid Instrument Blue, so more blue on blue reads as a glow rather than as current.

This is the system's one place where the two halves of the product meet in a single mark — the name is handwriting and a conductor at once. It is a heartbeat, not an animation: one `1150ms` traverse every seven seconds, plus one on pointer arrival with a `3200ms` cooldown, and **nothing runs at all in between** — no rAF, no canvas work. It is silent under reduced motion, while the hero is offscreen, while the tab is hidden, during the droplet entrance, and below `900px`, where the wordmark is small enough that a carousel object covers the whole traverse.

**The light has a position.** On the homepage hero, a 760px radial pool of Instrument Blue (`#1685ff2b` falling to transparent at 72%, `mix-blend-mode: screen`) tracks the pointer and washes across the signature — the wordmark brightens where the visitor is actually looking. It sits above the wordmark and below the carousel objects, so it illuminates the lettering without touching the artefacts. Position updates are unthrottled by transition (a lagging light reads as a blob, not as light); only opacity eases, over 420ms. It is pointer-only (`hover: hover and pointer: fine`), never appears under reduced motion, and stays dark while the droplet entrance is still playing — the entrance is the page's one authored moment and nothing may compete with it.

### Named Rules

**The Glow/Paste Rule.** A card never gets an offset shadow; an object never glows. If a new element is interface, it communicates with light. If it is meant to read as a physical artifact, it gets pasted down. Mixing the two makes both meaningless. The rule holds through state as well as at rest: the hovered portrait lifts 2px toward the light and its hard shadow lengthens (`7px 7px 0` → `10px 10px 0`) because that is what a pasted print does — it never picks up a glow on the way.

**The Flat-Until-Touched Rule.** Interface surfaces are flat at rest — background tone plus a 1px border, nothing more. Shadow is a response to hover or focus, never a resting decoration.

## Shapes

Soft-but-small corners throughout, scaled to the element rather than to a global radius token. Controls take **5px** (chips, select, noscript button), inline content takes **6px** (notes, imagery, the primary button), panels take **10px** (field tiles, the portrait), and cards take **12px** — the largest radius a rectangular surface is allowed. Imagery inside cards drops to **4px**, so the picture always reads as sitting *inside* a container rather than becoming the container. The logo tile is **8px** at 42px square. The only circles are the carousel's small round controls (`50%`); the only pill is the pause control (`20px`).

Borders are the dominant form language: every container, control, badge, and note carries a 1px hairline, and the empty state carries a 1px *dashed* border — the system's one dashed line, marking absence. Fills are nearly always paired with a border of a related tone rather than used alone.

The system's two signature deformations are both rotations: the wordmark at **−5°** and the portrait at **−3°**. Card imagery additionally takes a subtle 3D tilt (`perspective(900px) rotateY(-5deg) rotateX(3deg)`), which is why screenshots inside cards read as held at an angle rather than scanned flat.

### Named Rules

**The Tilt Rule.** Only hand-placed objects rotate — the signature, the portrait, imagery inside a card. Interface chrome (headers, cards, chips, inputs, grids) stays square to the grid. A rotated button would be a costume; a rotated photograph is a gesture.

**The Dashed-Means-Absent Rule.** Dashed borders mean *nothing is here yet*. The empty library state is the only place the system uses one, and that exclusivity is what makes it legible.

## Components

Components should feel **confident and tactile** — generous targets, decisive weights, and a physical response to press. Every control in the system now runs a **44px minimum target** and compresses with `scale(.98)` on `:active`, over the 100ms press token. The about-page links and the library controls (filter chips, sort select, noscript button) both meet this standard; build new controls to it.

### Buttons

- **Shape:** gently rounded (6px radius).
- **Primary:** Instrument Blue fill with near-black type at 550 weight, `12px 18px` padding, `min-height: 44px`. Used for the single most important action on a surface — "Explore my work", "Say hello".
- **Hover / Focus:** background lightens to Instrument Blue Hover (`#afc7ff`). Focus is handled globally: a 2px Instrument Blue outline at 3px offset with a 3px radius, applied via `:focus-visible` on every interactive element in the system.
- **Active:** `scale(.98)` — the press is felt, not just seen.
- **Text link (secondary):** no fill, no border, inline-flex with a 10px gap to a 15px `ArrowUpRight` icon. The arrow, not a border, is what marks it as an action.

### Chips

- **Style:** Control Surface fill (`#0b1a2e`), 1px Border Control outline (`#24538b`), Text Control type (`#88bcff`) at 12px, 5px radius, `10px 13px` padding and a 44px minimum height, laid out in an 8px-gap wrap.
- **Count:** each chip carries a monospace count in Text Faint (`#6f86ad`) at 10px, separated by a 7px gap — the chip states both what it filters and how much exists.
- **Hover:** border and text both go full Instrument Blue; the fill does not change.
- **Active:** `scale(.98)`.
- **Selected** (`aria-current="true"`): inverts completely — Instrument Blue fill, near-black type at 500 weight, and the count drops to `#050505cc` so it stays subordinate inside the inverted chip while holding 4.8:1.
- **Unpopulated field:** a field reachable by URL but with no published projects still renders its own chip, at count 0, in the selected state. The toolbar always shows which filter produced the current result.
- **Pending:** an `is-pending` class fills the chip optimistically while results load, so the control responds before the navigation completes.

### Cards / Containers

- **Corner Style:** 12px, with `overflow: hidden` so imagery is clipped to the corner.
- **Background:** Surface (`#080d16`), with the visual area taking a radial gradient from a lifted blue (`#163a75` on the homepage, `#12305f` in the library) down to near-black at 80% — a soft pool of light behind the artifact.
- **Border:** 1px Border (`#1b3559`) at rest, Instrument Blue on hover or `:focus-within`.
- **Shadow Strategy:** none at rest; Card glow on hover. See Elevation & Depth.
- **Internal Padding:** 24px body, 18–25px visual area.
- **Anatomy:** visual → field badge → title → summary → a bottom action row separated by a 1px Separator rule and pushed to the bottom with `margin-top: auto`, so action rows align across a grid regardless of summary length.

### Inputs / Fields

- **Style:** the sort select matches the chip exactly — Control Surface fill, Border Control outline, 5px radius — with `appearance: none` and a hand-authored inline SVG chevron in `#88bcff` positioned 10px from the right edge. Right padding is 28px to clear it.
- **Focus:** the global `:focus-visible` ring (2px Instrument Blue, 3px offset).
- **Hover:** border goes Instrument Blue; fill is unchanged.
- **Progressive enhancement:** the control is a real GET form with a `<noscript>` submit button. It works without JavaScript, and that is a property of the design, not just the code.

### Navigation

- **Style:** the `ay.` logo tile (42px square, Instrument Blue fill, near-black type at 650 weight, −1.5px tracking, 8px radius, ambient blue glow) at left; four links at 13px / 450 weight with a 29px gap at right.
- **Overlay variant** (homepage): absolutely positioned over the hero with a `linear-gradient(#050505e6, transparent)` scrim, so the navigation is legible over the wordmark without a solid bar.
- **Static variant** (every other route): relative, Void Black background, 1px Border Soft bottom rule.
- **Hover:** link text lightens to Instrument Blue Hover.
- **Contact link:** distinguished by a 1px Instrument Blue bottom border and a trailing 13px arrow icon — the only navigation item with a rule under it.

### Field Chip (navigational)

The browse-by-field control, shared by the homepage discovery strip and the library toolbar — identical in both, because it is one control. Chip styling as above, plus a monospace count in Text Faint and a 13px `ArrowUpRight`. Every field states how much is behind it before the visitor commits to the click; the taxonomy annotates its own size.

### Field Badge

Uppercase mono at 10px with +0.04em tracking, in the three-part badge recipe (deep fill `#0b2342`, bright type `#80bbff`, mid border `#173d6a`), 4px radius, `4px 7px` padding. It names the engineering field, which is the system's primary taxonomy — so it sits above the title, not below it.

### Spec Annotations (signature component)

The homepage's selected-work cards are plates on a drawing. On pointer hover or keyboard focus, four 1px corner crop marks strike out from their corners (14px on the lead card, 10px on the narrow support columns), a dimension line with end ticks draws from the centre, and a monospace reading arrives last — staggered 0 / 60 / 140ms, so the card is *drawn* rather than switched on.

**The reading must be true.** It states the artefact's real pixel dimensions and image kind, both taken from the content model (`cover.width`, `cover.height`, `cover.kind`) — `2940×1154 · Screenshot`, `2542×1662 · Render`. Where there is no cover image, it states something else verifiable about the visual (`5 stages`). An annotation that lies is worse than no annotation, on a site whose entire argument is that its claims are checkable.

The narrow support columns (116px) carry crop marks and the reading only; there is no width to run a dimension line across. Under reduced motion the annotations still appear — they carry information — and only the drawing-in is dropped. They are opt-in per visual (`annotated`), so the project library, which reuses the same visual components at a different size, does not get them.

### Experience Timeline (signature component)

The record of paid work on `/about`, newest first. A two-column row per role: the dated span in the left margin as monospace annotation (`Jan 2026 — Feb 2026`), the role in the right column, separated by the system's 1px hairline.

**Weight follows evidence, and the design enforces it.** An engineering role carries its organisation at 21px in Instrument Blue with a trailing `ArrowUpRight`, its summary, and its stack as Field Badge chips, linking into a full write-up. A service role (`kind: service`) drops to 17px in Text Card, loses the link and the stack, and its summary sits in Text Muted. Nothing is padded to match its neighbour — the same rule the project library follows, and the reason a lifeguard job can sit honestly beside a telemetry platform without either one lying about its size.

The heading carries no count. A hardcoded "Four roles" goes stale the moment a fifth is added.

**Education reuses this component's language rather than inventing a second one** — the same two-column date/content grid directly below the timeline, so `/background` reads as one continuous record instead of two stacked lists. One mark appears, the honours thesis, and it is set as a Field Badge chip beside a link to the project it produced. A mark that cannot be followed to something on this site is a number asking to be averaged; a mark that links to a case study is evidence.

### Note (signature component)

A restrained inline callout (`<Note>` in MDX) for caveats and open items: Control Surface fill, 1px Border Control outline, and a **3px Instrument Blue left border**, 6px radius, 13px type at 1.65 line-height.

This component exists to state what a case study does *not* yet cover, and it is load-bearing for the product's credibility — it is what lets a thin project be honest instead of padded. Preserve it. It is the only element in the system with an asymmetric border.

### Placeholder Tile (signature component)

The visual shown for a project with no imagery: a radial-gradient pool, an uppercase mono label in `#6d88b4`, and the project's initial set in **Pacifico at 44px in `#2d5f9e`** — a deep, recessive blue that sits well below the content around it, but still clearly legible. Recessive is the intent; invisible is a defect, and the tile must read as deliberately empty rather than broken.

This is the system's honest stand-in. It is quiet by design: it must never be mistaken for a real artifact, and it must never be replaced with decorative or generated imagery.

## Do's and Don'ts

### Do:

- **Do** keep Instrument Blue (`#1685ff`) as the only chroma. Differentiate state through fill, border weight, type weight, or annotation.
- **Do** put near-black (`#050505`) type on any blue fill, and lighten blue on hover rather than darkening it.
- **Do** wrap editorial mono labels in brackets with inner spaces — `[ Like this ]` — and leave data-bearing mono bare.
- **Do** follow The Glow/Paste Rule: interface communicates with light, objects are pasted down with a zero-blur offset.
- **Do** build new controls to the about-page standard — 44px minimum target, 550 weight, `scale(.98)` on `:active` — and raise the 35px library controls to meet it.
- **Do** use the 34px gutter and the 1280px cap on every route; narrow the content, never the gutter.
- **Do** separate sections with a 1px hairline rule.
- **Do** keep headings light (450–500). Create hierarchy with scale and negative tracking.
- **Do** reserve dashed borders for genuine absence, and reserve Pacifico for the wordmark and the placeholder initial.
- **Do** keep every control working without JavaScript, as the filter chips and sort form currently do.
- **Do** let the content model write card action labels (`card.action`, else `Explore <title>`). A hardcoded label applied across a grid will eventually describe something that isn't there, and it makes every link on the page share one screen-reader name.
- **Do** theme the browser's own surfaces from the palette — `::selection` is Instrument Blue with near-black type, matching every other blue fill.

### Don't:

- **Don't** introduce a second accent color — no success green, no warning amber, no per-field color coding. *(Confirmed prohibition.)*
- **Don't** fake substance. No decorative placeholder imagery, no generated screenshots, no mock dashboards standing in for projects that have none. A thin project gets the Placeholder Tile and a `<Note>` saying what isn't written. *(Confirmed prohibition.)*
- **Don't** give a card an offset shadow or an object a glow.
- **Don't** rotate interface chrome. Tilt belongs to the signature, the portrait, and card imagery.
- **Don't** use blue on static text that cannot be acted on.
- **Don't** set anything bold. Nothing in this system exceeds 550 weight except the 650 logo tile.
- **Don't** add a new breakpoint. Land on 700px / 900px / 520px.
- **Don't** hardcode new hex literals. The library and case-study stylesheets already carry roughly a dozen (`#24538b`, `#0b1a2e`, `#88bcff`, `#6f86ad`, `#d4e1ff`, and others) that bypass the token block in `globals.css`; they are documented in the frontmatter above and should be promoted to CSS custom properties rather than extended.
- **Don't** use white. The brightest text in the system is `#d4e1ff`, and it is reserved for emphasis.
- **Don't** set an arrow as a text glyph (`↗`) in interface chrome. Links and controls use the drawn `ArrowUpRight` at 13–16px. The one exception is deliberate: the hero carousel objects carry `↗` as a *printed mark* on the artefact itself — a footnote on a paper object, a tagline on a print — where it is typography, not an icon.
- **Don't** add a second focal moment to the homepage. The droplet entrance is the authored sequence; the pointer light and the conducting pulse are supporting state — one responds to the visitor, the other rests between beats, and neither competes for the arrival.
- **Don't** let an idle effect hold a rAF loop. Both hero effects cost nothing when nothing is happening: the light is pointer-driven, the pulse schedules a timer and releases the frame loop the moment a traverse ends.
- **Don't** run an effect where it cannot be seen. Below `900px` the conducting pulse is disabled outright rather than drawn behind an opaque carousel object.
- **Don't** let an annotation state anything that isn't checkable. Spec readings come from the content model — real pixel dimensions, the real image kind. A plausible-looking invented measurement (`86mm`) would undermine the one thing this site is selling.
- **Don't** let a card's frame crop its own artefact. A screenshot clipped by its container reads as a mistake, not as a crop; contain the plate and let the frame grow instead.
