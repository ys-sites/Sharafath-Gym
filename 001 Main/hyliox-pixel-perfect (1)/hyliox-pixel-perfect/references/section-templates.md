# Section Templates — The Fixed 21-Section Spec Structure

This file defines the **prescriptive template** for every spec produced by `hyliox-pixel-perfect`. Every output uses these 21 sections in this exact order. If a section has no content for a given image, write the heading and a single line: "Not visible in this screenshot — implement as static / omit / use sensible default."

For length, density, and tone calibration on any individual section, consult the matching section in `assets/gold-standard-kraken.md` or `assets/gold-standard-agentai.md`.

---

## Pre-write — Classify the image first

Before writing the opening paragraph, classify the image along three axes. This isn't output — it's mental setup. Pick the one to three labels that fit best from each list. They drive the vocabulary in the opening, the tech stack hints, the font preset, and the design tokens.

### Axis 1 — Type of interface

Pick one to two labels:

- landing page
- dashboard
- mobile app
- e-commerce
- SaaS
- portfolio
- fintech
- AI agency
- Web3 / crypto
- marketplace
- onboarding
- pricing page
- hero section only
- editorial / magazine
- documentation site
- admin panel

### Axis 2 — Art direction

Pick one to three labels:

- dark luxury
- glassmorphism
- brutalist
- editorial
- cyberpunk
- minimal SaaS
- fintech premium
- organic AI
- futuristic
- soft pastel
- clean corporate
- 3D immersive
- cinematic
- bioluminescent
- monochrome
- maximalist
- neumorphism
- vaporwave
- swiss / grid
- print-inspired

### Axis 3 — Mood register

Pick one to two labels:

- premium / aspirational
- playful / friendly
- serious / institutional
- raw / underground
- technical / engineering-led
- editorial / magazine-quality
- conversion-focused / sales-y

### Font preset hints by classification

Once classified, suggest a Google Fonts pairing matching the genre. These are starting points — the actual fonts visible in the image always win:

**Modern SaaS / fintech / AI agency / dashboard:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
```

**Editorial luxury / cinematic / dark premium:**
```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Barlow:wght@300;400;500;600&display=swap');
```

**Tech brutalist / cyberpunk / Web3:**
```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
```

**Editorial / magazine / print-inspired:**
```css
@import url('https://fonts.googleapis.com/css2?family=PP+Editorial+New&family=Inter:wght@400;500;600&display=swap');
```

**Organic AI / bioluminescent / display headers:**
```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');
```

If none of the presets fit the visible typography, identify the actual fonts from the image (or close substitutes available on Google Fonts) and use those.

### Design tokens hints by classification

The classification also seeds the color palette direction:

- **dark luxury / editorial** → black / cream / gold accents, deep neutrals
- **fintech premium / SaaS** → near-black or off-white base, blue or violet accent
- **AI agency / cyberpunk** → pure black, vivid neon accent (red, electric blue, magenta, purple)
- **organic AI / bioluminescent** → deep dark base, glowing accent that feels "alive" (red, violet, teal)
- **Web3 / crypto** → dark purple-black, lavender / magenta / violet accents
- **clean corporate / minimal SaaS** → off-white base, subtle gray scale, single brand accent
- **soft pastel / playful** → warm off-white, multiple muted accents
- **brutalist** → high-contrast black/white, no accent or single saturated accent

Use these as direction, not prescription. The image's actual colors always win.

---

## 0 — Opening paragraph (no heading)

The very first lines of the file, before any `# H1`. Three to four sentences:

1. **The build sentence**: `Build a [adjective(s)] [page type] for [brand], matching the provided screenshot as closely as possible.`
2. **The aesthetic sentence**: a dense list of the design's visual language — backgrounds, accent color, typography, key UI elements. Use a long bolded phrase for the design language: `**dark, cinematic, premium, conversion-focused**`.
3. **(Optional) "should feel like" list**: 4-6 bullets of cultural / product references the design evokes ("a high-end AI product studio", "a futuristic agency portfolio", "a cinematic SaaS landing page").
4. **The visual metaphor sentence**: name the visual soul of the page in one line. Examples: "The red jellyfish is the visual soul of the website. It represents intelligence, neural systems, flow, data, living automation, and AI agents." / "The core visual metaphor is a set of hanging metallic crypto tokens / pendants suspended from hooks, glowing with purple neon symbols."

This opening sets the rebuilder's mental model. Skipping it makes everything that follows feel arbitrary.

---

## 1 — TECH STACK

Heading: `# TECH STACK`

Show the dependency JSON, then the recommended libraries as a bulleted list, then the icons used from `lucide-react` as a flat list.

```json
{
  "next": "^16.2.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "tailwindcss": "^3.4.13",
  "shadcn/ui": "latest",
  "motion": "^12.35.0",
  "lucide-react": "latest"
}
```

Then list the icons by name. Always extract the actual icons used in the spec.

---

## 2 — GLOBAL PAGE DIRECTION

Heading: `# GLOBAL PAGE DIRECTION`

Three to five paragraphs / bulleted lists describing:

- **Page format**: single-page landing? long vertical? short hero-only?
- **Screenshot interpretation**: what does the screenshot show vs imply ("the screenshot shows the top hero and the beginning of the services section, but the page should feel like the beginning of a longer website")
- **Visual ingredients list** (bullets): "black page background", "white high-contrast headings", "translucent dark glass cards", "subtle white borders", "red ambient glows", "rounded pills", "dense but precise UI details"
- **What the layout is NOT**: "should not feel like a generic SaaS landing page. It should feel more like a premium AI agency interface with cinematic art direction"

This section is where you tell the rebuilder the *mood*, not just the classes.

---

## 3 — GLOBAL DESIGN TOKENS

Heading: `# GLOBAL DESIGN TOKENS`

A `:root { ... }` CSS block with all design tokens in shadcn HSL convention (raw values, no `hsl()` wrapper inside the variable). Always include:

- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--border`, `--input`, `--ring`
- `--radius`

Then a second block of **brand-specific values** with explicit names — these often go beyond shadcn:

```css
--red: #ff2a1f;
--red-dark: #8b0505;
--red-soft: rgba(255, 42, 31, 0.16);
--red-glow: rgba(255, 42, 31, 0.42);
--glass-bg: rgba(18, 18, 18, 0.68);
--glass-border: rgba(255, 255, 255, 0.12);
```

Use precise hex / rgba values where the brand has them. Do not stay abstract.

For Next.js, place this block in `app/globals.css`.

---

## 4 — TAILWIND CONFIG

Heading: `# TAILWIND CONFIG`

A `theme.extend` block in `tailwind.config.ts` showing four common extensions:

```ts
theme: {
  extend: {
    fontFamily: {
      heading: ["Inter Tight", "Inter", "sans-serif"],
      body: ["Inter", "sans-serif"]
    },
    colors: {
      // Branded namespace — use the brand name as key
      kraken: {
        DEFAULT: "#a855f7",
        dark: "#6b21a8",
        // ...
      }
    },
    borderRadius: {
      "4xl": "2rem",
      "5xl": "2.5rem"
    },
    boxShadow: {
      // Always extract glow + glass into named tokens
      "purple-glow": "0 0 40px rgba(168, 85, 247, 0.28), ...",
      "glass": "inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 80px rgba(0,0,0,0.55)"
    }
  }
}
```

The branded color namespace is what makes the spec feel intentional. Do not skip it.

---

## 5 — FONTS

Heading: `# FONTS`

Specify primary (sans for body) + display (sans for headlines) + optional accent (italic serif for emphasis words).

Show:
1. The Google Fonts `<link>` URL or `@import url(...)`
2. The Tailwind `fontFamily` extension (already shown in section 4 — repeat here for clarity)
3. **Font usage table**: which Tailwind class (`font-heading`, `font-body`, `font-serif`) maps to which use case (hero headline, section heading, body text, button label, micro-label)
4. **Typography feel paragraph**: 3-5 adjectives describing the typography's personality ("clean", "tight", "minimal", "premium", "not overly bold")
5. Concrete class snippets for the three or four key typography uses — hero heading, body, metric, micro label

Always scan headings for italic serif accent words. Pattern: a single word in a heading uses `font-serif italic` while the rest uses the sans display. Examples: "Get *Inspired* with Us", "I am Marcus Chen, *a self-taught director*", "Innovating the spirit of *bloom AI*". This is a near-universal pattern — call it out when present.

---

## 6 — GLOBAL CSS UTILITIES

Heading: `# GLOBAL CSS UTILITIES`

Define reusable classes under `@layer components` in `app/globals.css`. Name each utility after its **use in the image**, not after a generic style name.

Common utilities to include when the image evidences them — see `references/idiom-library.md` for full canonical snippets:

- `.glass-card`, `.glass-card-soft`, `.glass-pill`, `.glass-nav`, `.glass-panel` — glass family
- `.fine-border` (or `.fine-purple-border`, `.fine-red-border`) — gradient border via mask-composite trick
- `.dotted-grid` — subtle radial-gradient dot pattern background
- `.noise-overlay` — fractal SVG noise or radial-gradient color noise
- `.[color]-glow` — soft radial halo behind hero elements (e.g. `.violet-glow`, `.red-glow`)
- `.[color]-button` — gradient pill button with shadow
- `.pixel-[color]-floor` — voxel/pixelated gradient ground (rare, but present in some specs)

Always copy the full CSS from `idiom-library.md`. Do not summarize. The rebuilder needs the actual rules.

---

## 7 — ASSETS REQUIRED

Heading: `# ASSETS REQUIRED`

For every image, video, GIF, logo, or icon visible in the screenshot, document:

1. **Asset description** — 4-8 lines describing what the asset shows, its style, mood, format
2. **Suggested filename / path** — `/public/images/red-jellyfish.png`, `/public/icons/kraken-mark.svg`, `/public/logos/legalzoom.svg`
3. **Recommended dimensions** — at least height; width if known
4. **Format hints** — "transparent PNG/WebP preferred", "SVG", "looping MP4"

For videos/HLS streams, note the URL (if visible/known) and any technical requirements (`hls.js` with Safari fallback for `.m3u8` URLs).

For logos in trust rows, list each logo by brand name in left-to-right order. Preserve repetitions verbatim ("LEGALZOOM appears twice — keep as-is").

Group assets by purpose: hero visuals, decorative orbs/glows, photos, logos, icons, textures.

---

## 8 — RESPONSIVE RULES

Heading: `# RESPONSIVE RULES`

Three subsections: Desktop (primary), Tablet, Mobile. For each, specify:

- Layout shifts (hero content stacks, columns collapse, sidebars hide)
- Component changes (navbar collapses to hamburger, KPI cards hide, jellyfish becomes background)
- Sizing changes (hero heading drops from `text-7xl` to `text-4xl`)
- What to keep / remove

End with a breakpoints block:

```
mobile: below 768px
tablet: 768–1024px
desktop: 1024px+
```

If the image only shows desktop, state explicitly: "Desktop is primary. Implement mobile/tablet as sensible defaults using the patterns above; the screenshot does not reveal mobile behavior."

---

## 9 — PAGE STRUCTURE

Heading: `# PAGE STRUCTURE`

Show two things:

1. **App Router file tree**:
```
app/
├── layout.tsx       // fonts, metadata, <html lang="en" className="dark">
├── page.tsx         // composes the sections
├── globals.css      // tokens + @layer components
└── components/
    ├── navbar.tsx           // 'use client' (interactive)
    ├── hero.tsx             // 'use client' (motion, video)
    ├── proof-section.tsx    // 'use client' (motion)
    └── ...
```

2. **`page.tsx` JSX skeleton**:
```tsx
// app/page.tsx
export default function Page() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground font-body">
      <Navbar />
      <main>
        <HeroSection />
        <ProofSection />
        <LogoStrip />
        <ServicesSection />
      </main>
    </div>
  );
}
```

Mark which components need `'use client'` (anything with motion, hooks, or interactivity).

---

## 10–17 — SECTION-BY-SECTION (one section heading per visible page section)

Headings: `# SECTION 1 — NAVBAR`, `# SECTION 2 — HERO`, `# SECTION 3 — PROOF SECTION`, etc. Number them sequentially based on the page's actual sections.

For complex sections like the hero, use sub-sections: `## 2a. Hero ambient background`, `## 2b. Hero product image`, `## 2c. Hero headline + CTA`. The hero in a complex landing can have 5-13 sub-sections. Do not under-decompose.

For each section / sub-section, the rhythm is:

```
Layout

Position:

```txt
fixed top-3 left-0 right-0 z-50
```

Inner:

```txt
glass-pill rounded-full h-14 pl-2 pr-2 flex items-center justify-between
```

Content (left cluster, gap-1):

- Brand pill: small Kraken glyph (16×16) + "Kraken" label
- Nav links: Explore, Prices, Why Karken (verbatim — preserve typo)

Style — brand pill:

```txt
flex items-center gap-2 h-10 px-4 rounded-full bg-white/[0.04] border border-white/10
```

Style — nav link:

```txt
h-10 px-4 rounded-full text-white/80 text-sm hover:text-white hover:bg-white/5 transition-colors
```

Implementation:

```tsx
<a className="h-10 px-4 rounded-full text-white/80 text-sm hover:text-white hover:bg-white/5 transition-colors">
  Explore
</a>
```
```

Notice the pattern: short labeled prose (`Position:`, `Inner:`, `Style — X:`, `Implementation:`) + a `txt` or `tsx` code block per value. **Never inline a class string in prose**. Each visual property gets its own block.

For each section, document:
- Layout (position, sizing, padding, grid/flex)
- Background layers (decompose stacked layers — see `idiom-library.md`)
- Content (verbatim copy, in original order)
- Typography (size, weight, leading, tracking, color, italic accents)
- Components (icons by name from lucide-react, image dimensions + paths, button labels)
- Effects (glass class, glow, border, shadow)
- Interactions (hover scale, color transition)
- Animation entrance (`fadeUp(i * 0.1)`, `BlurText`, scroll-linked reveal — see `idiom-library.md`)
- Mark `'use client'` if the section uses motion/hooks

Sub-sections of the hero typically include: ambient background, product image/video, headline + CTA, micro-annotations, stats cards, KPI cards, social icon stack, scroll indicator, manifesto text, floor/fade. Decompose as the image demands.

---

## 18 — ANIMATION SYSTEM

Heading: `# ANIMATION SYSTEM`

Cover six categories — each with a labeled snippet:

1. **Global entrance animation** for most sections (the `fadeUp` + blur pattern):
```tsx
initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
viewport={{ once: true, margin: "-80px" }}
transition={{ duration: 0.7, ease: "easeOut" }}
```

2. **Hero sequence**: ordered list of which elements appear in which order (badge → headline → subtext → CTA → stat cards → manifesto)

3. **Hero focal element motion** (jellyfish, coin, orb, etc.) — slow infinite floating:
```tsx
animate={{ y: [0, -18, 0], scale: [1, 1.025, 1] }}
transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
```

4. **Floating side cards** (KPI cards, badges) — gentle infinite y-offset, often staggered:
```tsx
animate={{ y: [0, -8, 0] }}
transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
```

5. **Button hover**:
```tsx
hover:scale-[1.025] hover:shadow-[0_0_45px_rgba(255,42,31,0.45)] transition-all duration-300
```

6. **Card hover**:
```tsx
hover:border-red-500/25 hover:bg-white/[0.06] transition-all duration-300
```

If the image evidences scroll-linked reveals (text appearing word-by-word as the user scrolls), add a 7th category for that — see `idiom-library.md`.

---

## 19 — EXACT VISUAL HIERARCHY

Heading: `# EXACT VISUAL HIERARCHY`

A numbered list ranking the page's elements by visual weight, from most dominant to least. Examples:

```
1. Red glowing jellyfish
2. Hero headline: "Your AI Sprint Team On Demand"
3. Red CTA: "View Pricing Plans"
4. Right KPI cards: 230+ and 400+
5. Manifesto text with red accent words
6. Left stat cards: 3M+, 95%, 88%
7. Project card: "Based in Montreal, Canada"
8. Huge 120+ social proof
9. Testimonial card
10. Logo strip
11. Services section heading
```

End with a sentence on what should remain dominant: "Make sure the jellyfish remains the strongest visual element without making the text unreadable."

This section forces the rebuilder to preserve the page's visual rhythm. Without it, generic rebuilds give every element equal weight and lose the design's intent.

---

## 20 — SPACING AND LAYOUT DETAILS

Heading: `# SPACING AND LAYOUT DETAILS`

A JSON block with desktop pixel geometry. Always include the major numbers — page max width, hero min height, top padding, column widths, key element positions, card heights, gaps. Example:

```json
{
  "page_max_width": "1280px",
  "navbar_top": "12px",
  "hero_min_height": "900px",
  "hero_top_padding": "110px",
  "left_column_width": "5/12",
  "right_visual_width": "7/12",
  "jellyfish_position": {
    "left": "37%",
    "top": "72px",
    "size": "720px"
  },
  "right_kpi_cards": {
    "right": "0px",
    "top": "58px",
    "width": "205px"
  },
  "manifesto": {
    "right": "20px",
    "bottom": "72px",
    "width": "560px"
  },
  "stat_cards": {
    "columns": 3,
    "gap": "12px",
    "height": "92px"
  },
  "proof_section_gap": "24px",
  "project_card_height": "345px",
  "testimonial_card_height": "145px"
}
```

Estimate values from the screenshot. Don't refuse to commit — the rebuilder will adjust. Approximate values are still much better than no values.

---

## 21 — COMPONENT TREE

Heading: `# COMPONENT TREE`

ASCII tree of the React component hierarchy. Decompose deep where useful (Hero often has 8-10 sub-children).

```
App
├── Navbar
├── HeroSection
│   ├── HeroAmbientBackground
│   ├── JellyfishImage
│   ├── HeroCopy
│   │   ├── Badge
│   │   ├── Headline
│   │   ├── MicroAnnotation
│   │   ├── Subtext
│   │   ├── CTAGroup
│   │   └── HeroStats
│   ├── FloatingKpiCards
│   ├── SocialIconStack
│   ├── ScrollIndicator
│   └── ManifestoText
├── ProofSection
│   ├── ProjectLocationCard
│   └── SocialProofColumn
│       ├── TrustedText
│       ├── StarRating
│       ├── BigMetric
│       └── TestimonialCard
├── LogoStrip
└── ServicesSection
    ├── ServicesIntro
    └── StrategyMappingCard
```

This complements (not replaces) the file tree in section 9. Section 9 is about file organization; this is about React rendering hierarchy.

---

## 22 — COPYWRITING CONTENT

Heading: `# COPYWRITING CONTENT`

All visible copy from the screenshot, regrouped by section in the order it appears. This is **redundant** with the per-section copy already shown — do it anyway. The rebuilder uses this as a scannable copy reference.

Format:

```
Navbar
AgentAI
Home
Services
Works
About
Contact
Menu

Hero

Badge:
AI Chain Agency

Headline:
Your AI
Sprint Team
On Demand

Subtext:
From discovery to deployment, we plug into your stack to prototype, validate, and launch AI experiences your users actually love.

Buttons:
Explore Service
View Pricing Plans
```

Etc. for every section. Preserve typos, repetitions, line breaks, capitalization.

---

## 23 — VISUAL DETAILS TO MATCH

Heading: `# VISUAL DETAILS TO MATCH`

A bulleted list of fidelity guardrails. Two sub-categories:

**Important details from the screenshot** (15-25 items):
- "The page background is almost pure black."
- "The red jellyfish is extremely luminous and dominates the hero."
- "The hero headline is large, white, left-aligned, and tightly stacked."
- "The red is vivid and slightly neon, not burgundy."
- "Cards have very subtle borders and dark glass backgrounds."
- "The navigation is small and pill-shaped."
- "The active nav item is red."
- "The 120+ metric is very large and white."
- "All elements feel aligned, intentional, and premium."

**Anti-patterns / things to avoid** (5-10 items):
- "Avoid colorful gradients other than red."
- "Avoid blue/purple SaaS colors."
- "Avoid cartoonish AI illustrations."
- "Avoid flat corporate design."
- "Do not make the metric numbers thin/light — they should feel sharp and confident."

These items capture what the Tailwind classes alone cannot — the *feel*, the brand voice in colors, the things to NOT do. This is the section that turns a good spec into a pixel-perfect spec. Do not skip it. Do not write fewer than 15 items in the first sub-category, and do not write fewer than 5 in the second.

---

## 24 — FINAL IMPLEMENTATION GOAL

Heading: `# FINAL IMPLEMENTATION GOAL`

One paragraph (3-6 sentences) describing what the final result should *feel like* when implemented. Not what it *is* — what it *evokes*. This is the closing emotional pitch.

Example:

> The final result should visually recreate the screenshot as a polished React landing page. It should feel like a premium AI agency website where the design communicates speed, intelligence, trust, and execution. The red jellyfish should create a memorable, cinematic identity. The glass cards and KPI modules should make the agency feel technical and productized. The copy should make the offer clear: AgentAI is an on-demand AI sprint team that designs, prototypes, validates, and deploys AI systems with real user experience at the center.

This bookends the opening paragraph. Where the opening sets the mental model, this closes it.

---

# Final notes on length and density

The spec must be **800–1300 lines**. Both gold standards exceed 1100 lines. If your output is significantly shorter, you skipped granularity somewhere — most often by:

- Inlining classes in prose instead of using labeled `txt` blocks
- Aggregating background layers instead of decomposing them
- Writing 4-5 items in `VISUAL DETAILS TO MATCH` instead of 15-25
- Skipping sub-sections of complex sections like the hero
- Omitting `EXACT VISUAL HIERARCHY` or `SPACING AND LAYOUT DETAILS` because "the image speaks for itself"

If your output is much longer than 1300 lines, you are padding — most often by:

- Repeating the same explanation in multiple sections
- Writing 30+ items in `VISUAL DETAILS TO MATCH` (15-25 is the sweet spot)
- Over-decomposing simple sections
- Adding ASCII art or diagrams that don't help reconstruction

The gold standards are calibrated. Use them as your length and density anchor.
