# Idiom Library — Canonical CSS Snippets and Patterns

This file contains the reusable CSS, Tailwind, and motion patterns that appear across pixel-perfect specs. Copy them verbatim when the input image evidences the corresponding visual effect. Adapt color values, blur amounts, and opacity to match the image — but keep the structural pattern intact.

For Next.js 16 App Router, all `@layer components` blocks below go into `app/globals.css`.

---

## Glass family

The two gold standards do **not** use a generic name like "liquid-glass". Instead, they name each glass utility after its **use in the image**. Pick names that describe where the class is applied: `.glass-nav`, `.glass-card`, `.glass-card-soft`, `.glass-pill`, `.glass-panel`. This makes the spec feel intentional.

Two structural patterns are common:

### Pattern A — Linear-gradient glass (subtle, used on cards)

```css
@layer components {
  .glass-card {
    background:
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.075) 0%,
        rgba(255, 255, 255, 0.025) 100%
      );
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      0 24px 80px rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }
}
```

### Pattern B — Radial-highlight glass (richer, used on focal cards)

```css
@layer components {
  .glass-card-soft {
    background:
      radial-gradient(circle at 50% 0%, rgba(255,255,255,0.08), transparent 38%),
      rgba(12, 12, 12, 0.76);
    border: 1px solid rgba(255, 255, 255, 0.105);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.075),
      0 18px 60px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }
}
```

### Pattern C — Saturated glass pill (used on floating navbars)

```css
@layer components {
  .glass-pill {
    background: rgba(18, 14, 28, 0.72);
    backdrop-filter: blur(18px) saturate(140%);
    -webkit-backdrop-filter: blur(18px) saturate(140%);
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      0 10px 40px -10px rgba(0, 0, 0, 0.6);
  }
}
```

**Naming rule**: if the glass appears on the navbar → `.glass-nav` or `.glass-pill`. On feature cards → `.glass-card`. On a hero featured card → `.glass-card-soft`. On a small badge → `.glass-badge`. On a large container → `.glass-panel`. Always reflect the use.

---

## Fine border (mask-composite gradient border)

A thin gradient border that fades from a bright top to dim middle to colored bottom. Made with `::before` pseudo-element and the `mask-composite: exclude` trick. This is **the** premium border idiom — it transforms generic glass into something that feels designed.

```css
@layer components {
  .fine-border {
    position: relative;
  }
  .fine-border::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.22),
      rgba(255, 255, 255, 0.04) 45%,
      rgba(255, 42, 31, 0.18)        /* accent tint at bottom — change to brand color */
    );
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
}
```

Apply on any glass card by adding both classes: `class="glass-card fine-border ..."`.

For different accents, name accordingly: `.fine-purple-border`, `.fine-red-border`. Adjust the bottom gradient stop's color.

The padding (`padding: 1px` or `padding: 1.4px`) controls the border thickness. The `mask-composite: exclude` part is what makes the gradient render as a border outline rather than a filled rectangle. Do not omit it.

---

## Layered backgrounds

Hero sections in this design vocabulary almost always have **multiple stacked absolute background layers**. Decompose them. Do not aggregate. The pattern:

```tsx
<section className="relative min-h-[900px] overflow-hidden">
  {/* Layer 1: base color */}
  <div className="absolute inset-0 bg-[#030303]" />

  {/* Layer 2: ambient radial gradients (color glow) */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_16%,rgba(255,42,31,0.24),transparent_28%),radial-gradient(circle_at_72%_34%,rgba(160,0,0,0.18),transparent_32%),radial-gradient(circle_at_48%_68%,rgba(255,42,31,0.08),transparent_36%)]" />

  {/* Layer 3: noise / grain overlay */}
  <div className="noise-overlay" />

  {/* Layer 4: bottom fade to page background */}
  <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[#030303]" />

  {/* Layer 5: vignette */}
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.25)_55%,rgba(0,0,0,0.9)_100%)]" />

  {/* Content above */}
  <div className="relative z-10">
    {/* ... */}
  </div>
</section>
```

Always describe each layer with its purpose ("base color", "ambient radial glow", "noise overlay", "bottom fade", "vignette"). The rebuilder can then implement each layer independently and reorder if needed.

---

## Noise overlays

Two flavors. Pick based on what the image shows.

### Color noise (radial-gradient, lightweight)

```css
@layer components {
  .noise-overlay {
    pointer-events: none;
    position: absolute;
    inset: 0;
    opacity: 0.18;
    mix-blend-mode: screen;
    background-image:
      radial-gradient(circle at 20% 30%, rgba(255, 42, 31, 0.14), transparent 20%),
      radial-gradient(circle at 70% 15%, rgba(255, 42, 31, 0.22), transparent 26%),
      radial-gradient(circle at 80% 55%, rgba(120, 0, 0, 0.16), transparent 28%);
  }
}
```

### Fractal SVG noise (true grain texture)

```css
.bg-noise {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E");
  opacity: 0.15;
  mix-blend-mode: overlay;
}
```

Tune `baseFrequency` (0.85–0.9) and `numOctaves` (3–4) to match the grain coarseness. Apply at low opacity (0.1–0.2).

---

## Glow utilities

Soft radial halos placed behind hero focal elements (jellyfish, hero coin, orb).

```css
@layer components {
  .red-glow {
    background: radial-gradient(60% 50% at 50% 45%, rgba(255, 42, 31, 0.55) 0%, rgba(255, 42, 31, 0) 60%);
    filter: blur(40px);
  }
  .violet-glow {
    background: radial-gradient(60% 50% at 50% 45%, rgba(168, 85, 247, 0.55) 0%, rgba(168, 85, 247, 0) 60%);
    filter: blur(40px);
  }
}
```

Place absolutely behind the hero image: `<div className="absolute left-[45%] top-[130px] z-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-red-500/20 blur-[110px]" />`. For very tight halos, prefer `bg-[color]/N blur-[Npx]` inline; for diffuse atmospheres, use the named utility above.

---

## Branded gradient buttons

Pill button with vertical gradient and named glow shadow.

```css
@layer components {
  .red-button {
    background: linear-gradient(180deg, #ff382d 0%, #e3150b 100%);
    box-shadow:
      0 0 30px rgba(255, 42, 31, 0.28),
      inset 0 1px 0 rgba(255, 255, 255, 0.22);
  }
}
```

Apply: `<button className="red-button rounded-full px-5 py-2.5 text-[12px] font-semibold text-white hover:scale-[1.02]">View Pricing Plans</button>`.

The vertical gradient (lighter top, deeper bottom) gives the button a 3D feel. Always include a soft outer glow shadow in the brand color and an inner highlight (`inset 0 1px 0 rgba(255,255,255,0.22)`) for the rim.

---

## Pixel-fog / voxel floor

Rare but distinctive — used for purple/violet "ground" fades under hero product shots (Bloom, Kraken). A layered gradient + repeating-linear-gradient fakes block pixels.

```css
@layer components {
  .pixel-purple-floor {
    background:
      linear-gradient(180deg, rgba(168, 85, 247, 0) 0%, #a855f7 40%, #e9d5ff 100%),
      repeating-linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.06) 0 1px,
        transparent 1px 16px
      ),
      repeating-linear-gradient(
        0deg,
        rgba(255, 255, 255, 0.06) 0 1px,
        transparent 1px 16px
      );
    mask-image: linear-gradient(180deg, transparent 0%, #000 30%, #000 100%);
  }
}
```

Adjust the gradient color stops to match the brand. The `mask-image` softens the top edge so the floor fades up rather than starting abruptly.

---

## Dotted grid background

Subtle background for hero containers and card interiors.

```css
@layer components {
  .dotted-grid {
    background-image: radial-gradient(
      rgba(255, 255, 255, 0.05) 1px,
      transparent 1px
    );
    background-size: 20px 20px;
  }
}
```

Apply to a container: `<div className="dotted-grid bg-[#0a0710] rounded-[32px]">...</div>`. For card interiors, combine with a `::before` pseudo-element so the grid sits inside the rounded corners.

---

## Animation patterns

All Framer Motion patterns. In Next.js 16 App Router, **components using these must declare `'use client'`** at the top of the file.

### Helper: fadeUp

```ts
// lib/motion.ts
'use client';
export const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, delay, ease: "easeOut" },
});
```

Apply to staggered sections:

```tsx
<motion.div {...fadeUp(0.15)}>...</motion.div>
<motion.div {...fadeUp(0.3)}>...</motion.div>
<motion.div {...fadeUp(0.45)}>...</motion.div>
```

### Variant: fadeUp with blur (premium entrance)

```tsx
initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
viewport={{ once: true, margin: "-80px" }}
transition={{ duration: 0.7, ease: "easeOut" }}
```

Use this when the design feels cinematic / premium / bioluminescent. The blur dissolve adds weight.

### Hero focal element — slow infinite floating

```tsx
animate={{ y: [0, -18, 0], scale: [1, 1.025, 1] }}
transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
```

Apply to the dominant hero image (jellyfish, coin, orb, hero render). 6-9 second loop, very subtle scale pulse.

### Floating side cards — gentle staggered offset

```tsx
// Card 1
animate={{ y: [0, -8, 0] }}
transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}

// Card 2 (counter-phase)
animate={{ y: [0, 8, 0] }}
transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
```

Two floating cards in counter-phase create a living dashboard feel.

### Staggered list / grid

```tsx
{items.map((item, i) => (
  <motion.div key={item.id} {...fadeUp(i * 0.1)}>
    {/* ... */}
  </motion.div>
))}
```

Standard stagger for logo rows, feature card grids, testimonial columns.

### Button hover

```tsx
className="hover:scale-[1.025] hover:shadow-[0_0_45px_rgba(255,42,31,0.45)] transition-all duration-300"
```

### Card hover

```tsx
className="hover:border-red-500/25 hover:bg-white/[0.06] transition-all duration-300"
```

### Word-by-word pull-up (custom component)

For headlines that should reveal word-by-word from below. Build as a client component:

```tsx
'use client';
import { motion, useInView } from "motion/react";
import { useRef } from "react";

export function WordsPullUp({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const words = text.split(" ");

  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ y: 20, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
```

A `WordsPullUpMultiStyle` variant accepts an array of `{ text, className }` segments so a single heading can mix sans + serif italic words.

### Blur-in word reveal (BlurText)

For cinematic hero headlines:

```tsx
'use client';
// Each word interpolates through three keyframes:
initial: { filter: 'blur(10px)', opacity: 0, y: 50 }
midway:  { filter: 'blur(5px)',  opacity: 0.5, y: -5 }
final:   { filter: 'blur(0px)',  opacity: 1, y: 0 }
// Stagger: 0.08-0.2s per word, step duration 0.35s
```

### Scroll-linked character/word reveal

For long body paragraphs that should reveal as the user scrolls:

```tsx
'use client';
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

function AnimatedLetter({ char, progress }: { char: string; progress: any }) {
  return (
    <motion.span style={{ opacity: progress }}>{char}</motion.span>
  );
}

export function ScrollRevealParagraph({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.2"],
  });
  const chars = text.split("");
  return (
    <p ref={ref}>
      {chars.map((c, i) => {
        const charProgress = i / chars.length;
        const op = useTransform(scrollYProgress, [charProgress - 0.1, charProgress + 0.05], [0.2, 1]);
        return <AnimatedLetter key={i} char={c} progress={op} />;
      })}
    </p>
  );
}
```

---

## HLS video backgrounds

For `.m3u8` (Mux, CloudFront HLS) video sources. Requires `hls.js` with native Safari fallback.

```tsx
'use client';
import { useEffect, useRef } from "react";
import Hls from "hls.js";

export function HlsVideoBackground({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari)
      video.src = src;
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
}
```

For plain MP4 (no HLS), use a regular `<video>` tag with `autoPlay loop muted playsInline` — no JS needed.

Always pair video backgrounds with a top-and-bottom black gradient fade so the section blends into the page:

```tsx
<div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-background to-transparent pointer-events-none" />
<div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent pointer-events-none" />
```

---

## Bottom gradient fade

Whenever a video, image, or vivid section bleeds into the next section, fade the bottom to the page background:

```tsx
<div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background to-transparent pointer-events-none" />
```

This is a near-universal idiom. Always include it on hero sections with video backgrounds.

---

# Final notes on usage

- Copy these snippets verbatim. Do not summarize them in the spec.
- Adapt only the values that need to change for the specific image (colors, blur amounts, opacity).
- Keep the structural patterns intact — they are calibrated.
- Name utilities after their use in the image (`.glass-nav`, not `.liquid-glass-strong`).
- Group all `@layer components` definitions in one block in `app/globals.css`.
- Mark client components with `'use client'` whenever motion or hooks are involved.
