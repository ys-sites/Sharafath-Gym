---
name: hyliox-pixel-perfect
description: Translate a UI screenshot (landing page, app screen, dashboard, mockup) into a pixel-faithful, developer-ready reconstruction prompt for AI coding agents (Cursor, v0.dev, Lovable, Codex, Claude Code) targeting Next.js 16 App Router + Tailwind + shadcn/ui + Framer Motion. Output is a long Markdown spec (~1000 lines) using a fixed 21-section template — tech stack, page direction, design tokens, Tailwind config, fonts, CSS utilities, assets, responsive rules, page structure, section breakdown, animations, visual hierarchy, layout JSON, component tree, copywriting, visual details to match, final goal. Trigger on "/hyliox-pixel-perfect", "/pixel-perfect", "fais le prompt gagnant", "transforme cette image en prompt", "rebuild this UI", "clone this design", "pixel-perfect spec", or any UI image with reconstruction intent. Multilingual chat reply, spec file in English. Do NOT use for design critique or aesthetic feedback — fidelity reconstruction only.
---

# Hyliox Pixel Perfect

Translate UI screenshots into long, dense, prescriptive build specs for frontend agents. Optimized for **maximum fidelity**, not brevity.

## Philosophy

This skill produces a fixed 21-section spec, ~1000 lines long, copy-paste ready for Cursor / v0 / Lovable / Codex / Claude Code. It is **prescriptive, not adaptive**: the same 21 sections appear in every output, in the same order. If a section has no content for a given image (e.g. no animations visible), explicitly state "Not visible in this screenshot — implement as static" rather than skipping it. Predictable structure beats variable cleverness.

The skill is reverse-engineered from two gold-standard outputs (`assets/gold-standard-kraken.md` and `assets/gold-standard-agentai.md`). When in doubt about format, length, or granularity, **read the gold standards first**. They are the ground truth.

**Fidelity over interpretation.** Describe what is in the image. Do not invent sections, copy, features, or improvements. If the image shows three feature cards, describe three. If a logo is repeated in the brand row, repeat it. If there is a typo in the nav ("Why Karken"), preserve it (and offer the rebuilder the choice to correct).

**Granularity over prose.** Every visual property — position, size, color, padding, font weight — gets its own labeled `txt` code block. Inline-code-in-prose is not enough. The spec is a copy-paste artifact, not an essay.

## Default tech stack

- **Next.js 16.2** (App Router + Turbopack) + React 19 + TypeScript
- **Tailwind CSS** (config in `tailwind.config.ts`)
- **shadcn/ui** primitives where useful
- **Framer Motion** (`motion/react`)
- **lucide-react** for icons
- Static assets in `/public/images/` and `/public/icons/`
- CSS variables in HSL format (shadcn convention: `0 0% 100%` raw, no `hsl()` wrapper inside the variable)

**Note on adaptation from the gold standards.** The two gold-standard examples target React + Vite. This skill outputs **Next.js 16 App Router** instead. The conversion rules are simple but must be applied consistently:

- `index.css` → `app/globals.css`
- Asset paths reference `/public/...` from `<Image>` or `<img>` as root-relative URLs (`/images/foo.png`)
- Components that use Framer Motion, React hooks (`useState`, `useEffect`, `useScroll`, `useInView`), event handlers, `<video>` controls, or browser APIs (`hls.js`) must declare `'use client'` at the top
- Pure layout / static content components stay as Server Components (no `'use client'`)
- Page structure shows the App Router file tree (`app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/components/...`)
- Use `next/image` for static images with known dimensions; use raw `<img>` for GIFs, dynamic, or animated content

Everything else (CSS utilities, glass families, fadeUp helper, animation patterns, layered backgrounds, fine-border trick) transfers identically.

## Workflow

When the skill triggers, execute these steps in order. Do not skip steps.

### Step 1 — Read the references and one gold standard

Before writing anything, load:

1. `references/section-templates.md` — the 21-section template with role, content rules, and format for each section
2. `references/idiom-library.md` — canonical CSS snippets (glass family, fine-border, layered backgrounds, fadeUp, floating motion)
3. `references/writing-patterns.md` — labeled-code-block pattern, hedging on ambiguity, anti-patterns format
4. **One gold standard** as a concrete reference for length, density, and tone:
   - If the input image is dark/cinematic/agency-style → `assets/gold-standard-agentai.md`
   - If the input is product/SaaS/fintech/payments → `assets/gold-standard-kraken.md`
   - If unsure → `assets/gold-standard-kraken.md` (more diverse section coverage)

These files are large. Read them once at the start; do not re-read mid-generation.

### Step 2 — Analyze the image

Before writing, internally inventory:

- **Classification** along three axes (interface type, art direction, mood register) — see the "Pre-write" section in `references/section-templates.md` for the full label vocabulary. The classification drives font preset, design tokens direction, and the opening's "should feel like" list.
- **Brand name and logo** (visible in nav)
- **Visual metaphor** that defines the page (Kraken: hanging crypto pendants. AgentAI: red bioluminescent jellyfish. Always try to name the visual soul of the page in one sentence.)
- **Section list** top to bottom (navbar, hero, proof, logo strip, services, etc.)
- **Color palette** — primary background, accent color(s), card surface
- **Typography pairing** — display sans for headings, body sans for copy, optional serif for italic accents
- **All visible copy** — extracted verbatim including typos and repetitions
- **Glass / blur / noise / grain** treatments
- **Animation cues** — anything that implies motion (floating elements, halo glows, hover affordances)

If anything is partially obscured or unreadable, plan to flag it in the spec with hedging language ("…with your customers" — extend if user wants a complete sentence, otherwise keep verbatim).

### Step 3 — Write the spec to a file

Produce the spec as a single Markdown file at `/mnt/user-data/outputs/<slug>-spec.md`, where `<slug>` is kebab-case derived from the brand visible in the image (e.g. `kraken-spec.md`, `agentai-spec.md`, `bloom-spec.md`). Fall back to `ui-rebuild-spec.md` only if no brand is identifiable.

The file follows the **fixed 21-section template** from `references/section-templates.md`. Length target: **800–1300 lines**. Shorter than 800 means you skipped granularity; longer than 1300 means you padded with redundancy.

### Step 4 — Present the file and reply concisely in chat

Call `present_files` with the spec path. The chat reply is **3–6 lines maximum**:
- Which sections were covered (or which were marked "Not visible in this screenshot")
- Any uncertainty or assumption flagged in the spec
- Any explicit decision the rebuilder will need to make (e.g. typo preservation, repeated logos)

Do not duplicate the spec in chat. Do not summarize it. The file is the deliverable.

## Hard rules of fidelity

These are non-negotiable. They override convenience, brevity, and politeness.

**Verbatim copy.** Every visible word in the image — headings, buttons, labels, footer, microcopy — appears in the spec exactly as written, in the original language, including typos, punctuation quirks, and repeated content. When a typo is preserved, optionally offer the rebuilder the choice ("Use `Why Karken` only if reproducing the visible screenshot exactly; otherwise use `Why Kraken`").

**Anti-patterns explicit.** The `VISUAL DETAILS TO MATCH` section always includes a list of anti-patterns: what to avoid, what NOT to do, color directions to skip. Example: "Avoid blue, green, orange, or multicolor gradients. Keep the palette tightly limited to black, purple, lavender, white, and gray. Do not make it cartoonish."

**No invention.** Do not add sections, features, social proof, testimonials, or any content not visible in the image. If the image ends mid-section (cropped at the bottom), describe only what is visible and note the truncation.

**Hedging on the unreadable.** When text is cut off, partially obscured, or genuinely ambiguous, do not fabricate. Mark it: "this card is partially cut at the bottom of the screenshot; the body shown is what's visible — extend naturally with '…' if the user wants a complete sentence, otherwise keep verbatim."

**Layered backgrounds decomposed.** Every complex background gets broken into N explicit absolute layers (base color, radial gradients, noise overlay, vignette, etc.) with their stacking order. Do not aggregate ("dotted-grid + violet-glow + pixel-floor"); list each layer with its own snippet.

**Glass family naming.** Do not impose a single name like "liquid-glass". Name the glass utilities by their use in the image: `.glass-nav`, `.glass-card`, `.glass-card-soft`, `.glass-pill`, `.glass-panel`. The image guides the naming.

**Branded color namespace.** When the design has a strong brand palette, namespace the Tailwind extension: `colors: { kraken: { black, panel, purple, ... } }` or `colors: { redai: { DEFAULT, dark, soft } }`. This makes the spec feel intentional rather than generic.

**Box-shadow as named tokens.** Define `boxShadow: { 'red-glow': '...', 'glass': '...' }` in the Tailwind config rather than inline `shadow-[...]` strings everywhere. Then reference as `shadow-red-glow`.

## When to consult the gold standards mid-generation

If you are about to write a section and you're not sure how dense, granular, or formatted it should be — **stop and re-read the equivalent section in the matching gold standard**. The gold defines the bar. Examples:

- About to write the HERO section but unsure how many sub-sections (2a, 2b, 2c)? Look at how the matching gold structures its hero.
- About to write `SPACING AND LAYOUT DETAILS` but unsure which keys belong in the JSON? Copy the structure from the gold and adapt the values to your image.
- About to write `VISUAL DETAILS TO MATCH` but only have 5 items? The golds have 15-25. Find more.

The golds are the calibration tool. Use them.

## Format checklist before delivery

Before calling `present_files`, scan the draft once:

- [ ] Length is 800–1300 lines (shorter = under-spec'd; longer = padded)
- [ ] Opens with "Build a..." sentence stating tech stack and core aesthetic
- [ ] All 21 sections present in order, even if some say "Not visible in this screenshot"
- [ ] Visual metaphor stated in the opening or `GLOBAL PAGE DIRECTION`
- [ ] Tech stack adapted to Next.js 16 App Router (not Vite)
- [ ] `'use client'` reminders on animated/interactive components
- [ ] All visible copy extracted verbatim, in original language
- [ ] Italic serif accents in headings detected and called out
- [ ] CSS utilities named after their use, not after a generic "liquid-glass"
- [ ] Branded color namespace in Tailwind config
- [ ] Box-shadow named tokens in Tailwind config
- [ ] Backgrounds decomposed into N absolute layers (not aggregated)
- [ ] Every visual property in its own labeled `txt` code block (Style:, Position:, Implementation:)
- [ ] `EXACT VISUAL HIERARCHY` ranks elements by visual weight (numbered list)
- [ ] `SPACING AND LAYOUT DETAILS` includes a JSON block with pixel geometry
- [ ] `VISUAL DETAILS TO MATCH` includes anti-patterns ("Avoid X, do not Y")
- [ ] `COPYWRITING CONTENT` regroups all copy in a scannable block
- [ ] Hedging applied to any cropped, ambiguous, or unreadable content
- [ ] No critique, no improvement suggestions, no preamble
- [ ] Spec written to `/mnt/user-data/outputs/<slug>-spec.md`
- [ ] Chat reply is 3–6 lines maximum
