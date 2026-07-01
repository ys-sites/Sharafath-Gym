# Writing Patterns — How Pixel-Perfect Specs Are Actually Written

This file documents the **writing-style conventions** that distinguish pixel-perfect specs from "good enough" specs. These are the patterns observed in `assets/gold-standard-kraken.md` and `assets/gold-standard-agentai.md`.

If you find yourself writing prose where you should be writing labeled code blocks — stop and re-read this file.

---

## Pattern 1 — Section H1 numbering

Every page section gets a numbered H1:

```markdown
# SECTION 1 — NAVBAR
# SECTION 2 — HERO
# SECTION 3 — LOWER PROOF SECTION
# SECTION 4 — LOGO STRIP
# SECTION 5 — SERVICES SECTION
```

The numbering is by visible page section, top to bottom. Sub-sections of complex sections (like the hero) use H2 with letter suffixes:

```markdown
## 2a. Hero ambient background
## 2b. Hero jellyfish image
## 2c. Hero headline + CTA
## 2d. Hero stat cards
```

The hero often has 5-13 sub-sections in dense specs. Do not under-decompose.

---

## Pattern 2 — Labeled code blocks (the most important pattern)

**Every visual property gets its own labeled `txt` code block.** Inline-code-in-prose is not enough. The spec is a copy-paste artifact, not an essay.

❌ Bad (inline class in prose):

> The navbar is positioned with `fixed top-3 left-0 right-0 z-50` and has horizontal padding of `px-4 md:px-6`.

✅ Good (labeled `txt` blocks):

```markdown
Position:

```txt
fixed top-3 left-0 right-0 z-50
```

Padding:

```txt
px-4 md:px-6
```
```

The label tells the rebuilder what the value controls. The block isolates the value for copy-paste. Together, they are scannable — the rebuilder can find any property in seconds.

Common labels in order of frequency: `Style:`, `Position:`, `Inner:`, `Style — [variant name]:`, `Tailwind:`, `Implementation:`, `Content:`, `Layout:`, `Wrapper:`.

---

## Pattern 3 — Implementation: blocks

After describing a component in prose + labeled `txt` blocks, often add a final `Implementation:` block with the actual JSX:

```markdown
Implementation:

```tsx
<motion.img
  src="/images/red-jellyfish.png"
  className="absolute left-[37%] top-[72px] z-[1] h-[720px] w-[720px] object-contain opacity-95"
  animate={{ y: [0, -18, 0], scale: [1, 1.025, 1] }}
  transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
/>
```
```

The `Implementation:` block is the "here's the actual code, copy-paste it" closer. Use it for non-trivial components — anything with motion, state, or compound styling. Do not use it for one-line buttons or static text.

---

## Pattern 4 — Background layer decomposition

Hero sections almost always have multiple stacked absolute background layers. **Decompose them.** Do not aggregate.

❌ Bad:

> The hero has a dark background with a violet glow and a dotted grid.

✅ Good:

```markdown
HERO BACKGROUND

Use black as base.

Add layered radial gradients:

```tsx
<div className="absolute inset-0 bg-[#030303]" />
<div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_16%,rgba(255,42,31,0.24),transparent_28%)]" />
<div className="noise-overlay" />
<div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[#030303]" />
```

Add subtle top vignette:

```tsx
<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.25)_55%,rgba(0,0,0,0.9)_100%)]" />
```
```

Each layer is its own line of JSX, in stacking order. The rebuilder can implement, reorder, or remove individual layers without touching the others.

---

## Pattern 5 — Hedging on ambiguity

When something in the image is unreadable, ambiguous, cropped, or could be interpreted multiple ways — **do not fabricate**. Mark it explicitly and offer the rebuilder the choice.

Examples from the gold standards:

> Body: `Copy Link or QR code and share it` *(this card is partially cut at the bottom of the screenshot; the body shown is what's visible — extend naturally with "…with your customers." if the user wants a complete sentence, otherwise keep verbatim)*

> Verbatim brand-name typo preserved: `Why Karken` (not "Kraken") in the nav. Use `Why Karken` only if reproducing the visible screenshot exactly; otherwise use `Why Kraken`.

> Repeated logo preserved: `LEGALZOOM` appears twice in the trust row. Keep verbatim, don't dedupe.

The pattern: state what is visible, flag the ambiguity, offer an interpretation, but let the rebuilder decide. Hedging language that works:

- "...if the user wants a complete sentence, otherwise keep verbatim"
- "...keep as-is, don't dedupe"
- "...only if reproducing the visible screenshot exactly"
- "...the screenshot does not reveal X behavior — implement as sensible default using the patterns above"
- "...partially cut at the bottom of the screenshot"
- "...if the user prefers Y, swap accordingly"

---

## Pattern 6 — Anti-patterns in VISUAL DETAILS

The `VISUAL DETAILS TO MATCH` section always includes anti-patterns — explicit lists of what NOT to do. This is what prevents the rebuilder from drifting into generic SaaS aesthetics.

✅ Good anti-patterns (specific, color-aware, intent-aware):

```markdown
- Avoid colorful gradients other than red.
- Avoid blue/purple SaaS colors.
- Avoid cartoonish AI illustrations.
- Avoid flat corporate design.
- Do not make the metric numbers thin/light — they should feel sharp and confident.
- Keep the palette tightly limited to black, purple, lavender, white, and gray.
- Do not use the dark gradient as a uniform color — preserve the radial purple atmosphere behind the hero.
- Do not make it cartoonish.
- The lighting should feel cinematic and volumetric.
```

❌ Bad anti-patterns (vague, generic):

```markdown
- Don't use ugly colors.
- Make sure it looks good.
- Don't make it boring.
```

Aim for **5-10 anti-patterns minimum** in every spec. They are the negative-space companion to the positive descriptions.

---

## Pattern 7 — Visual metaphor in the opening

The opening paragraph of every spec names the page's **visual soul** in one sentence. This is the metaphor the rebuilder must preserve above all else.

Examples:

> "The red jellyfish is the visual soul of the website. It represents intelligence, neural systems, flow, data, living automation, and AI agents."

> "The core visual metaphor is a set of hanging metallic crypto tokens / pendants suspended from hooks, glowing with purple neon symbols against a deep purple-black backdrop."

The metaphor sentence does three things:
1. Names the dominant visual element ("red jellyfish", "hanging crypto pendants")
2. Lists what it symbolizes ("intelligence, neural systems, flow")
3. Anchors the rebuilder's mental model

If you cannot name the visual metaphor in one sentence, the spec is missing something — go back and look at the image again.

---

## Pattern 8 — "should feel like" lists

The opening also often includes a "should feel like" list — 4-6 bullets of cultural / product references the design evokes. This calibrates the *register*.

Examples:

```markdown
The page should feel like a mix between:
- a high-end AI product studio
- a futuristic agency portfolio
- a cinematic SaaS landing page
- a premium dashboard interface
- an organic intelligence / neural network metaphor
```

```markdown
The page should feel like:
- a premium crypto infrastructure product (think Stripe-for-crypto)
- a neon purple blockchain interface
- a dark fintech SaaS landing page
- a cinematic product-launch teaser
```

These are not random adjectives. They are concrete product references the rebuilder recognizes. If the rebuilder thinks "I know what a high-end AI product studio looks like", they have the right mental anchor.

---

## Pattern 9 — Verbatim copy preservation

All visible copy from the image appears in the spec **exactly as written**, in the original language, including:

- Typos ("Why Karken")
- Repetitions (LEGALZOOM appears twice in the trust row)
- Punctuation quirks
- Line breaks (preserve them as `<br />` in the headline)
- Capitalization (ALL CAPS hero headlines, lowercase descript wordmark)

Never silently correct. If you suspect a typo is intentional or a repetition is meaningful, preserve it and flag it for the rebuilder.

---

## Pattern 10 — Branded color namespacing in Tailwind

Always namespace the brand's colors under a key in `tailwind.config.ts`:

```ts
colors: {
  redai: {
    DEFAULT: "#ff2a1f",
    dark: "#8b0505",
    soft: "rgba(255, 42, 31, 0.16)",
  },
  kraken: {
    DEFAULT: "#a855f7",
    dark: "#6b21a8",
    panel: "#0a0710",
  },
}
```

Then reference as `text-redai`, `bg-kraken-panel`, `border-redai-soft`. This makes the spec feel intentional and brand-aware rather than generic.

The namespace key is the brand name in lowercase, optionally suffixed: `redai` (red AI), `kraken`, `bloomai`. Do not use generic keys like `brand`, `theme`, `accent` — they erase the design's identity.

---

## Pattern 11 — Box-shadow named tokens

Always extract glow + glass shadows into named tokens in `tailwind.config.ts`:

```ts
boxShadow: {
  "red-glow": "0 0 40px rgba(255, 42, 31, 0.28), 0 0 120px rgba(255, 42, 31, 0.14)",
  "purple-glow": "0 0 40px rgba(168, 85, 247, 0.28), 0 0 120px rgba(168, 85, 247, 0.14)",
  "glass": "inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 80px rgba(0,0,0,0.55)",
  "glass-soft": "inset 0 1px 0 rgba(255, 255, 255, 0.075), 0 18px 60px rgba(0, 0, 0, 0.5)",
}
```

Then reference as `shadow-red-glow`, `shadow-glass`. This is cleaner than inline `shadow-[0_0_40px_rgba(...)]` everywhere and makes glow consistency easier to maintain.

---

## Pattern 12 — Italic serif accent detection

A near-universal pattern in this design vocabulary: **headings have one or two accent words rendered in italic serif** while the rest is in the sans display font.

Examples:
- "Get *Inspired* with Us" → `Inspired` is `font-serif italic`
- "I am Marcus Chen, *a self-taught director*" → italic phrase is `font-serif italic`
- "Innovating the spirit of *bloom AI*" → italic phrase is `font-serif italic`
- "Search has *changed.* Have you?" → `changed.` is `font-serif italic`
- "The platform for *meaningful* content" → `meaningful` is `font-serif italic`

Always scan headings for these accents. They are easy to miss on a quick read but central to the design language. When detected, call them out explicitly in the section spec:

```markdown
Headline:

```tsx
<h1 className="font-display text-white text-7xl tracking-tight">
  Innovating the spirit of <span className="font-serif italic text-white/80">bloom AI</span>
</h1>
```
```

If a design has no italic serif accents, it's worth noting — that's a deliberate stylistic choice (e.g. all-caps geometric specs like Kraken).

---

## Pattern 13 — Component tree complements file tree

Sections 9 (PAGE STRUCTURE) and 21 (COMPONENT TREE) both show hierarchies, but they are different.

**Section 9 — App Router file tree** is about file organization on disk:
```
app/
├── layout.tsx
├── page.tsx
├── globals.css
└── components/
    ├── navbar.tsx           // 'use client'
    └── hero.tsx             // 'use client'
```

**Section 21 — Component tree** is about React rendering hierarchy:
```
App
├── Navbar
└── HeroSection
    ├── HeroAmbientBackground
    ├── JellyfishImage
    └── HeroCopy
        ├── Badge
        ├── Headline
        └── CTAGroup
```

Include both. The file tree tells the dev where to put files. The component tree tells the dev how to compose components. They are not redundant — they answer different questions.

---

## Pattern 14 — JSON for spacing geometry

The `SPACING AND LAYOUT DETAILS` section uses a JSON block, not prose, to capture pixel geometry. JSON because:
- It is scannable
- It groups related values (`hero_position: { left, top, size }`)
- It enforces consistency (no "approximately 720px tall, around 700-720px wide")
- It is easy to diff against a Figma export

Always include it. Estimate values from the screenshot if exact pixels aren't available — approximate values are still much better than no values. The rebuilder will adjust.

---

## Pattern 15 — Length and density calibration

Every gold-standard spec is **800–1300 lines long**. If your output is significantly shorter, you skipped granularity. If it's significantly longer, you padded.

Common density killers (output too short):
- Inlining classes in prose instead of using labeled `txt` blocks
- Aggregating background layers instead of decomposing
- Writing 4-5 items in `VISUAL DETAILS TO MATCH` instead of 15-25
- Skipping sub-sections of the hero
- Omitting `EXACT VISUAL HIERARCHY` or `SPACING AND LAYOUT DETAILS`

Common padding killers (output too long):
- Repeating the same explanation in multiple sections
- Writing 30+ items in `VISUAL DETAILS TO MATCH` (15-25 is the sweet spot)
- Over-decomposing simple sections (a single button does not need 8 sub-blocks)
- Adding ASCII art or diagrams that don't aid reconstruction

When in doubt, open `assets/gold-standard-kraken.md` or `assets/gold-standard-agentai.md` and compare the equivalent section. The golds are the calibration tool.

---

## Pattern 16 — Common mistakes (good vs bad)

These are the eight failure modes that turn a near-pixel-perfect spec into a mediocre one. Each comes with a wrong example and a right one. Internalize the pattern, not just the example.

### Mistake 1 — Writing a description instead of a build instruction

❌ **Bad** (descriptive narration):
```
On voit une page sombre avec un titre et des cartes.
You can see a dark page with a title and some cards.
```

✅ **Good** (constructive instruction):
```
Create a dark hero panel with min-height 760px, rounded bottom corners
of 48px, a centered uppercase headline at top 445px, and a white pill
CTA below it.
```

The right output sounds like an architect's blueprint, not a museum audio guide.

### Mistake 2 — Missing technical values

❌ **Bad** (vague):
```
The headline is large.
```

✅ **Good** (specific Tailwind / CSS values):
```txt
font-heading text-[62px] font-medium uppercase leading-[1.03] tracking-[-0.045em] text-white
```

Every visual property gets concrete numbers. "Large" / "small" / "medium" are never enough.

### Mistake 3 — Forgetting assets

❌ **Bad** (asset waved away):
```
Use a background image.
```

✅ **Good** (asset specified for generation):
```
Main hero asset:
- Several metallic coin pendants hanging from hooks/strings
- Center coin has a large Bitcoin symbol
- Purple neon cracks and glowing details
- Dark cinematic lighting
- Transparent PNG/WebP preferred
- At least 1400px wide
- Suggested file: /public/images/hero-crypto-charms.png
```

The asset block must be detailed enough that a generative-image tool (Midjourney, DALL-E, Imagen) could produce a usable result from it alone.

### Mistake 4 — Forgetting responsive behavior

❌ **Bad**:
```
The page is responsive.
```

✅ **Good** (explicit breakpoint behavior, even when only desktop is shown):
```
Desktop is primary (the screenshot shows desktop only).

Tablet (768–1024px):
- Stack hero copy + visual into single column
- Reduce hero headline from text-7xl to text-5xl
- Right KPI cards collapse below hero, become a 2-up grid

Mobile (<768px):
- Hide floating KPI cards entirely
- Jellyfish becomes a background image at 50% opacity
- Stack stat cards 1-up
- Replace nav links with hamburger Menu icon from lucide-react
```

Even when the screenshot shows desktop only, infer reasonable mobile behavior and state it.

### Mistake 5 — Skipping visible copy

❌ **Bad**: "The hero has a heading and a CTA."

✅ **Good**: Extract every visible word verbatim, in order, including microcopy, footer text, button labels, badges. Group it in `COPYWRITING CONTENT`. If a typo is visible ("Why Karken"), preserve it. If a logo or word repeats, repeat it.

### Mistake 6 — Being critical or evaluative

❌ **Bad**:
```
The design is beautiful and modern. The use of glassmorphism is nice
but the contrast could be improved.
```

✅ **Good**: No judgment. Describe what is, not what should be. The user already saw the image — they are not asking for a review. They are asking for a blueprint.

If you find yourself writing "the design", "the use of", "the choice of" — stop. Rewrite as imperative ("Use…", "Place…", "Set…").

### Mistake 7 — Vague colors

❌ **Bad**:
```
The accent color is purple.
The background is dark.
```

✅ **Good** (specific values, multiple formats):
```css
--background: 270 48% 4%;       /* HSL shadcn convention */
--accent: 275 100% 68%;
--accent-soft: rgba(168, 85, 247, 0.18);
--accent-glow: rgba(168, 85, 247, 0.42);

/* In hex for namespace use */
--brand-purple: #b14cff;
--brand-bright: #d778ff;
```

Always commit to actual values. Approximate from the image; do not refuse to commit.

### Mistake 8 — No structure

❌ **Bad**: A long flowing paragraph mixing layout, color, and copy.

✅ **Good**: The 21-section structure, every time, in the same order, with labeled `txt` code blocks for every value. Predictable structure beats clever prose. The rebuilder must be able to scan the document and find any property in seconds.

---

## Pattern 17 — No preamble, no postscript

The spec file opens with the "Build a..." sentence and ends with `FINAL IMPLEMENTATION GOAL`. Nothing before, nothing after. No "Here is your spec:" header, no "Let me know if you'd like changes" footer, no meta-commentary.

The chat reply (separate from the spec file) is 3-6 lines. Not a summary of the spec. Just:
- Which sections were covered (or marked "Not visible")
- Any explicit assumption flagged in the spec
- Any decision the rebuilder will need to make

The file is the deliverable. The chat reply is a courtesy.
