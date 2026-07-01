Build a dark, futuristic, premium single-page landing page for a crypto payment gateway named **Kraken**, matching the provided screenshot as closely as possible.

The page is a cinematic crypto-fintech landing page with a black/purple visual identity, glowing crypto pendants, pixel-grid gradients, glassmorphism navigation, bold uppercase hero typography, soft rounded containers, partner logo strip, and a second section explaining how to accept crypto payments through payment links.

The visual direction should feel like:
- premium crypto infrastructure
- secure payment gateway
- dark fintech SaaS
- neon purple blockchain interface
- cinematic Web3 product landing page
- high-trust gateway for accepting crypto payments

The core visual metaphor is a set of hanging metallic crypto tokens / pendants suspended from hooks, glowing with purple neon symbols such as Bitcoin, Solana, Ethereum, and other blockchain icons.

---

# TECH STACK

Use:

```json
{
  "react": "latest",
  "vite": "latest",
  "tailwindcss": "latest",
  "shadcn/ui": "latest",
  "motion": "^12.35.0",
  "lucide-react": "latest"
}
```

Recommended:
- React + Vite
- Tailwind CSS
- shadcn/ui for Button/Card primitives
- motion/react for reveal/floating animations
- lucide-react for icons
- CSS custom properties for color tokens
- CSS pseudo-elements for glow, grid overlays, gradient borders, and glassmorphism

Useful lucide-react icons:
- Globe
- Link
- Zap
- Wallet
- CreditCard
- QrCode
- ArrowUpRight
- ShieldCheck
- Lock
- CircleDollarSign
- BadgeDollarSign

---

# GLOBAL PAGE DIRECTION

Create a dark luxury crypto payment landing page.

The screenshot is a vertically cropped desktop page. The visible page contains:

1. Floating top navbar
2. Hero panel with hanging crypto coin artwork
3. Large uppercase headline
4. Primary CTA button
5. Partner/client logo strip
6. Second section headline
7. Purple planet / light beam visual
8. Three feature cards explaining the payment-link flow

The design should be mostly black and deep purple, with bright violet and lavender highlights.

The layout uses:
- large rounded hero container
- centered max-width layout
- dark background outside the hero
- glass navbar
- soft pixelated purple gradient floor in hero
- subtle grid overlays
- monochrome partner logos
- rounded feature cards with purple borders/glow
- large uppercase typography with tight spacing

The overall page should feel smooth, polished, futuristic, and fintech-grade.

---

# GLOBAL DESIGN TOKENS

Use CSS variables similar to:

```css id="avf6tt"
:root {
  --background: 270 48% 4%;
  --foreground: 0 0% 100%;

  --card: 270 34% 7%;
  --card-foreground: 0 0% 100%;

  --primary: 275 100% 68%;
  --primary-foreground: 0 0% 100%;

  --secondary: 270 28% 12%;
  --secondary-foreground: 0 0% 100%;

  --muted: 270 18% 18%;
  --muted-foreground: 0 0% 62%;

  --accent: 281 100% 62%;
  --accent-foreground: 0 0% 100%;

  --border: 0 0% 100% / 0.12;
  --input: 0 0% 100% / 0.12;
  --ring: 281 100% 68%;

  --radius: 1.5rem;

  --black: #07020d;
  --black-soft: #0d0615;
  --panel: #13091d;

  --purple: #b14cff;
  --purple-bright: #d778ff;
  --purple-soft: rgba(177, 76, 255, 0.18);
  --purple-glow: rgba(177, 76, 255, 0.48);
  --lavender: #e8c7ff;

  --glass-bg: rgba(22, 14, 30, 0.72);
  --glass-border: rgba(255, 255, 255, 0.13);
  --grid-line: rgba(255, 255, 255, 0.075);
}
```

---

# TAILWIND CONFIG

Extend Tailwind with:

```js id="0n5o3j"
theme: {
  extend: {
    fontFamily: {
      heading: ["Inter Tight", "Inter", "sans-serif"],
      body: ["Inter", "sans-serif"]
    },
    colors: {
      kraken: {
        black: "#07020d",
        panel: "#13091d",
        purple: "#b14cff",
        bright: "#d778ff",
        lavender: "#e8c7ff"
      }
    },
    borderRadius: {
      "4xl": "2rem",
      "5xl": "2.5rem"
    },
    boxShadow: {
      "purple-glow": "0 0 36px rgba(177,76,255,0.45), 0 0 120px rgba(177,76,255,0.20)",
      "purple-soft": "0 0 50px rgba(177,76,255,0.18)",
      "glass": "inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 80px rgba(0,0,0,0.55)"
    }
  }
}
```

---

# FONTS

Use a clean geometric grotesk with a slightly futuristic feel.

Recommended Google Fonts:

```css id="bmatja"
@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
```

Font usage:
- Headings: `font-heading`
- Body/navigation: `font-body`

Typography characteristics:
- Hero headline: uppercase, wide, bold but clean
- Second section headline: uppercase, white, tight line-height
- Navigation: tiny, compact, white/gray
- Body copy: small, muted gray
- Feature card titles: medium-sized, title case
- CTA: tiny bold text inside white pill

Hero headline approximate style:
```txt id="jp6d3b"
font-heading text-[48px] md:text-[58px] lg:text-[64px] uppercase leading-[1.02] tracking-[-0.045em] text-white
```

---

# GLOBAL CSS UTILITIES

Create these reusable classes in `index.css`.

```css id="5mmj54"
@layer components {
  .glass-panel {
    background:
      linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025)),
      rgba(20, 10, 30, 0.72);
    border: 1px solid rgba(255,255,255,0.13);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.08),
      0 24px 80px rgba(0,0,0,0.55);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .glass-nav {
    background: rgba(28, 22, 34, 0.78);
    border: 1px solid rgba(255,255,255,0.11);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.08),
      0 14px 50px rgba(0,0,0,0.36);
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
  }

  .purple-glow {
    box-shadow:
      0 0 36px rgba(177,76,255,0.45),
      0 0 120px rgba(177,76,255,0.2);
  }

  .purple-text-glow {
    text-shadow:
      0 0 18px rgba(177,76,255,0.45),
      0 0 42px rgba(177,76,255,0.22);
  }

  .hero-grid {
    background-image:
      linear-gradient(rgba(255,255,255,0.075) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.075) 1px, transparent 1px);
    background-size: 42px 42px;
  }

  .fine-purple-border {
    position: relative;
  }

  .fine-purple-border::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(
      180deg,
      rgba(255,255,255,0.22),
      rgba(177,76,255,0.26) 45%,
      rgba(255,255,255,0.05)
    );
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  .pixel-fog {
    background:
      linear-gradient(to bottom, transparent 0%, rgba(177,76,255,0.38) 52%, rgba(232,199,255,0.92) 100%);
    image-rendering: pixelated;
  }

  .white-pill-button {
    background: #ffffff;
    color: #08030d;
    box-shadow:
      0 0 28px rgba(255,255,255,0.22),
      inset 0 1px 0 rgba(255,255,255,0.5);
  }

  .purple-pill-button {
    background: linear-gradient(180deg, #d77cff 0%, #9b43ff 100%);
    color: white;
    box-shadow:
      0 0 26px rgba(177,76,255,0.5),
      inset 0 1px 0 rgba(255,255,255,0.32);
  }
}
```

---

# ASSETS REQUIRED

Use or generate the following assets.

## 1. Hero hanging crypto pendants

Main visual:
- several metallic coin pendants hanging from hooks/strings
- center coin has a large Bitcoin symbol
- left/lower coin has Solana-like glowing bars
- right/lower coin has Ethereum symbol
- smaller coins in background
- purple neon cracks and glowing details
- dark cinematic lighting
- black/purple environment
- coins should feel suspended, physical, metallic, reflective

Suggested asset:
```txt id="zsrpjx"
/images/crypto-pendants-hero.png
```

Recommended:
- transparent PNG/WebP
- at least 1400px wide
- high contrast
- center Bitcoin coin should be largest

## 2. Pixelated purple gradient floor

Can be CSS-generated.
It appears in the lower half of the hero as a purple-to-lavender pixel fog/grid.

## 3. Partner logos

Use monochrome gray logos or text placeholders:
- MODE
- LEGALZOOM
- AUTODESK
- descript
- DEEPGRAM
- LEGALZOOM

## 4. Second section visual

Purple planet / curved orbital light image:
- dark rectangular background
- large purple planet or arc on the right
- bright purple beam shooting diagonally from lower-left to center/right
- futuristic black space background

Suggested asset:
```txt id="zj14qz"
/images/purple-planet-beam.png
```

This asset sits behind the second section title and feature cards.

## 5. Feature icons

Use lucide icons:
- Link icon for “Create A Link”
- Zap icon for “Share The Link”
- Wallet/CreditCard icon for “Get Paid”

---

# RESPONSIVE RULES

Desktop is primary.

Desktop:
- page max width: around 1320px
- hero panel width: almost full viewport with side margin around 8px to 16px
- hero panel height: around 760px
- navbar inside hero top area, max width around 1040px
- headline centered in lower-middle hero
- partner logos in a horizontal centered row
- second section uses central visual with overlapping cards

Tablet:
- reduce hero height to 680px
- reduce coin artwork scale
- keep headline centered
- stack partner logos into 2 rows if needed
- feature cards wrap

Mobile:
- navbar becomes simpler
- hide nav links, keep logo + buttons
- hero height around 620px
- headline size around 34px
- crypto pendant image remains centered but cropped
- logos wrap
- feature cards stack vertically
- second section image becomes background behind heading

---

# PAGE STRUCTURE

```jsx id="xfwwi9"
<div className="min-h-screen overflow-x-hidden bg-[#07020d] text-white font-body">
  <Navbar />
  <main>
    <HeroSection />
    <LogoStrip />
    <AcceptCryptoSection />
  </main>
</div>
```

The hero panel itself contains the navbar visually at the top, but the navbar can be implemented as a fixed/absolute element above the hero content.

---

# SECTION 1 — NAVBAR

Create a floating glass navbar positioned over the top of the hero.

## Position and dimensions

Navbar wrapper:
```txt id="0etpeu"
absolute top-4 left-1/2 z-50 w-[min(1040px,calc(100%-40px))] -translate-x-1/2
```

Navbar inner:
```txt id="vv6uhj"
glass-nav flex h-[58px] items-center justify-between rounded-2xl px-5
```

The navbar is not full-width. It is a centered rounded rectangle/pill-like bar with a dark translucent background.

## Left area

Brand:
```txt id="65ryq7"
Kraken
```

Style:
```txt id="99o3yx"
text-[19px] font-semibold tracking-[-0.04em] text-white
```

The brand appears at the far left inside the navbar.

## Center navigation

Links:
```txt id="3extsy"
Explore
Prices
Why Karken
```

Important: the screenshot appears to show “Why Karken” or possibly “Why Kraken”. Use `Why Karken` only if reproducing the visible screenshot exactly; otherwise use `Why Kraken`.

Style:
```txt id="hni3bi"
hidden md:flex items-center gap-8 text-[11px] font-medium text-white/62
```

Each link:
```txt id="g12yo3"
hover:text-white transition-colors
```

## Right controls

Right side contains:
1. globe icon
2. `Log in` dark button
3. `Get started` purple button

Globe:
```txt id="p04ick"
h-4 w-4 text-white/70
```

Log in button:
```txt id="1zswj3"
rounded-full border border-white/12 bg-white/[0.045] px-4 py-2 text-[11px] font-medium text-white/80
```

Get started button:
```txt id="iu50m4"
purple-pill-button rounded-full px-4 py-2 text-[11px] font-semibold
```

---

# SECTION 2 — HERO PANEL

The hero is a huge rounded rectangle panel at the top of the page.

## Hero outer spacing

Page starts with hero panel almost touching the top and sides.

Wrapper:
```txt id="2gdq91"
relative mx-auto max-w-[1340px] px-2 pt-0
```

Hero panel:
```txt id="mp8o14"
relative min-h-[760px] overflow-hidden rounded-b-[3rem] rounded-t-[2rem] border border-white/8 bg-[#090410]
```

The screenshot shows a large rounded container with:
- top corners rounded
- bottom corners strongly rounded
- black/purple interior
- hero content clipped inside

---

## HERO BACKGROUND LAYERS

Inside hero panel:

Layer 1: black/purple base:
```jsx id="1pcuta"
<div className="absolute inset-0 bg-[#090410]" />
```

Layer 2: subtle horizontal grid / scan lines:
```jsx id="liqho9"
<div className="absolute inset-0 opacity-30 hero-grid" />
```

Layer 3: dark top vignette:
```jsx id="pnsq1i"
<div className="absolute inset-x-0 top-0 h-[270px] bg-gradient-to-b from-black/75 to-transparent" />
```

Layer 4: purple lower glow:
```jsx id="qovagy"
<div className="absolute inset-x-0 bottom-0 h-[330px] bg-[radial-gradient(ellipse_at_center,rgba(177,76,255,0.75)_0%,rgba(177,76,255,0.38)_38%,rgba(7,2,13,0)_78%)]" />
```

Layer 5: pixelated lavender fog at bottom:
```jsx id="nqzinm"
<div className="pixel-fog absolute inset-x-0 bottom-0 h-[260px] opacity-95" />
```

Layer 6: bottom white/lavender bloom:
```jsx id="k3hdjf"
<div className="absolute inset-x-0 bottom-0 h-[145px] bg-gradient-to-t from-[#ead0ff] via-[#c56cff]/50 to-transparent opacity-90" />
```

---

## HERO CRYPTO PENDANT ARTWORK

Place the crypto pendant asset in the upper center of the hero.

Position:
```txt id="gctkke"
absolute left-1/2 top-[20px] z-10 h-[430px] w-[760px] -translate-x-1/2 object-contain
```

The center Bitcoin pendant should hang down around the vertical middle of the hero.

Visual details to match:
- center coin is largest
- Bitcoin symbol glows bright purple
- coin has lightning/crack lines
- hanging hook/string extends above it
- smaller pendants hang left and right
- Solana-like icon appears lower-left of the Bitcoin
- Ethereum-like icon appears lower-right
- small blurred coins in background left and right
- overall lighting is dark metallic with purple neon highlights

Add additional glow behind the center coin:
```jsx id="7zqgh2"
<div className="absolute left-1/2 top-[145px] z-[8] h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-purple-500/30 blur-[80px]" />
```

Animate very subtly:
```jsx id="5zxlf2"
<motion.img
  src="/images/crypto-pendants-hero.png"
  className="absolute left-1/2 top-[20px] z-10 h-[430px] w-[760px] -translate-x-1/2 object-contain"
  animate={{ y: [0, -8, 0], scale: [1, 1.01, 1] }}
  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
/>
```

---

## HERO HEADLINE

The main headline is centered in the lower-middle of the hero.

Exact text:
```txt id="mi535p"
YOUR TRUSTED CRYPTO
PAYMENT GATEWAY
```

Position:
```txt id="74uzvq"
absolute left-1/2 top-[445px] z-20 w-full max-w-[860px] -translate-x-1/2 text-center
```

Style:
```txt id="va75l9"
font-heading text-[50px] font-medium uppercase leading-[1.03] tracking-[-0.045em] text-white md:text-[62px]
```

It should be very clean, white, uppercase, and centered.
The letters are large and slightly condensed by tight tracking.
The line break is after “CRYPTO”.

Implementation:
```jsx id="4s6svl"
<h1 className="font-heading text-[50px] font-medium uppercase leading-[1.03] tracking-[-0.045em] text-white md:text-[62px]">
  YOUR TRUSTED CRYPTO
  <br />
  PAYMENT GATEWAY
</h1>
```

---

## HERO CTA

Button under headline.

Text:
```txt id="bohsj3"
Get started now
```

Position:
```txt id="rgd0e7"
mt-8 inline-flex
```

Style:
```txt id="eef678"
white-pill-button rounded-full px-5 py-3 text-[12px] font-semibold
```

The CTA is small relative to the headline.
It is white with black text.
It floats centered over the purple glow.

Implementation:
```jsx id="a67qp3"
<button className="white-pill-button mt-8 rounded-full px-5 py-3 text-[12px] font-semibold text-black transition-transform hover:scale-[1.03]">
  Get started now
</button>
```

---

# SECTION 3 — PARTNER LOGO STRIP

Place a horizontal row of logos below the hero panel.

Container:
```txt id="7uwn4w"
mx-auto flex max-w-[1080px] items-center justify-center gap-10 px-6 py-12
```

Logo row content:
```txt id="c70l0i"
MODE
LEGALZOOM
AUTODESK
descript
DEEPGRAM
LEGALZOOM
```

Style:
```txt id="g1uslo"
text-white/38
```

Each logo:
```txt id="u4m3j6"
flex items-center gap-2 text-[15px] font-semibold uppercase tracking-[-0.03em] text-white/38
```

Some logos should have simple abstract marks/icons before the name:
- MODE mark
- LegalZoom lightning-like mark
- Autodesk triangular A
- Descript stacked-line icon
- Deepgram DG mark

Implementation can use text + simple CSS marks or lucide icons.

The logo strip should be low-contrast and monochrome, not colorful.

---

# SECTION 4 — ACCEPT CRYPTO SECTION

This is the second visible content section.

It has a central background visual with a purple planet/beam and a headline over it.

## Section wrapper

```txt id="j52d2s"
relative mx-auto mt-16 max-w-[1120px] px-6 pb-32
```

The section background remains black/deep purple.

---

## Central visual panel

The screenshot shows a rectangular image area centered behind the second headline.

Position:
```txt id="nb4e2n"
relative mx-auto h-[420px] max-w-[760px] overflow-hidden bg-black
```

The visual:
- black space background
- huge purple arc/planet on the right side
- bright purple beam shooting diagonally from lower-left toward the planet
- strong glow
- looks like a sci-fi payment/energy gateway

Use image:
```txt id="yyd8ze"
/images/purple-planet-beam.png
```

Style:
```txt id="cesg9d"
absolute inset-0 h-full w-full object-cover
```

Add top/bottom gradient fades:
```jsx id="8mf2k4"
<div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#07020d] to-transparent" />
<div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#07020d] to-transparent" />
```

---

## Section headline

Exact text:
```txt id="r2hkrn"
THE FASTEST WAY TO
ACCEPT CRYPTO
```

Position:
```txt id="9qu6sf"
absolute left-1/2 top-8 z-20 w-full max-w-[680px] -translate-x-1/2 text-center
```

Style:
```txt id="2x7yc8"
font-heading text-[43px] font-medium uppercase leading-[1.05] tracking-[-0.045em] text-white md:text-[54px]
```

The headline sits over the purple planet image and is centered.
Line break after “TO”.

---

## Feature cards overlay

Three cards overlap the bottom of the central visual.

Cards:
1. Create A Link
2. Share The Link
3. Get Paid

Layout:
```txt id="na7euh"
absolute left-1/2 bottom-[-40px] z-30 grid w-[calc(100%+80px)] max-w-[1180px] -translate-x-1/2 grid-cols-3 gap-6
```

On mobile, stack cards vertically.

Each card style:
```txt id="rw4o91"
glass-panel fine-purple-border min-h-[170px] rounded-3xl p-7 text-center
```

Cards have:
- dark translucent background
- thin purple/white border
- subtle grid overlay inside
- top icon
- title
- body text

Add internal grid overlay:
```jsx id="d2r3sk"
<div className="pointer-events-none absolute inset-0 opacity-20 hero-grid" />
```

---

## Feature Card 1 — Create A Link

Icon:
- link icon in small rounded square/circle
- centered at top

Title:
```txt id="mih7v0"
Create A Link
```

Body:
```txt id="ekwxco"
You can use Payment Links to sell a product or service, event tickets, crowdfunding or receive a donation.
```

Title style:
```txt id="rz2vtk"
mt-5 font-heading text-[24px] font-medium tracking-[-0.04em] text-white
```

Body style:
```txt id="genwwg"
mx-auto mt-3 max-w-[250px] text-[12px] leading-[1.45] text-white/58
```

---

## Feature Card 2 — Share The Link

Icon:
- Zap/lightning icon

Title:
```txt id="gk21dj"
Share The Link
```

Body visible/likely:
```txt id="3x39vs"
Copy Link or QR code and share it with your customers anywhere.
```

Card should sit slightly lower/centered than left and right cards, as in the screenshot it appears centered and overlapping the bright beam.

Optional positioning:
```txt id="ygbzup"
translate-y-[55px]
```

This creates the staggered layout: left/right cards higher, center card lower.

---

## Feature Card 3 — Get Paid

Icon:
- wallet / payment / card icon

Title:
```txt id="q9ex32"
Get Paid
```

Body:
```txt id="8nqrk8"
Customers can pay through any network. Get notified via email and track payments.
```

Same styling as first card.

---

# ANIMATION SYSTEM

Use subtle premium animation.

## Global reveal

For sections and cards:

```jsx id="wqt7ig"
<motion.div
  initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
  viewport={{ once: true, margin: "-80px" }}
  transition={{ duration: 0.7, ease: "easeOut" }}
>
```

## Hero pendant animation

The hanging crypto coins should float subtly:

```jsx id="m33g27"
animate={{ y: [0, -8, 0], rotate: [0, 0.6, 0] }}
transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
```

## Hero headline animation

Use staggered line reveal:
- opacity 0 → 1
- y 24 → 0
- blur 10px → 0px
- delay after pendant appears

## CTA hover

White CTA:
```txt id="17c96w"
hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(255,255,255,0.32)]
transition-all duration-300
```

Purple button:
```txt id="v8qsi7"
hover:scale-[1.03] hover:shadow-[0_0_42px_rgba(177,76,255,0.65)]
transition-all duration-300
```

## Feature card hover

```txt id="955bbs"
hover:-translate-y-1 hover:border-purple-400/45 hover:bg-white/[0.06] transition-all duration-300
```

---

# EXACT VISUAL HIERARCHY

The eye should read the page in this order:

1. Center Bitcoin pendant glowing purple
2. Other hanging crypto pendants
3. Hero headline: “YOUR TRUSTED CRYPTO PAYMENT GATEWAY”
4. White “Get started now” CTA
5. Purple pixel-glow floor
6. Partner logo strip
7. Second section headline: “THE FASTEST WAY TO ACCEPT CRYPTO”
8. Purple planet/beam visual
9. Three feature cards
10. Feature card icons/titles

The hero artwork must be visually dominant, but the headline should remain very legible.

---

# SPACING AND LAYOUT DETAILS

Use this approximate desktop geometry:

```json id="t0eymv"
{
  "page_background": "#07020d",
  "page_max_width": "1340px",
  "hero_panel": {
    "height": "760px",
    "border_radius_top": "32px",
    "border_radius_bottom": "48px",
    "side_margin": "8px",
    "background": "#090410"
  },
  "navbar": {
    "top": "16px",
    "width": "1040px",
    "height": "58px",
    "border_radius": "18px"
  },
  "hero_art": {
    "top": "20px",
    "center_x": "50%",
    "width": "760px",
    "height": "430px"
  },
  "hero_headline": {
    "top": "445px",
    "max_width": "860px",
    "font_size": "62px",
    "line_height": "1.03"
  },
  "hero_cta": {
    "margin_top": "32px",
    "height": "42px",
    "border_radius": "999px"
  },
  "logo_strip": {
    "padding_y": "48px",
    "gap": "40px",
    "max_width": "1080px"
  },
  "accept_crypto_section": {
    "margin_top": "64px",
    "visual_panel_width": "760px",
    "visual_panel_height": "420px"
  },
  "feature_cards": {
    "card_height": "170px",
    "card_radius": "24px",
    "gap": "24px",
    "center_card_offset_y": "55px"
  }
}
```

---

# COMPONENT TREE

```txt id="sy6548"
App
├── Navbar
│   ├── BrandLogo
│   ├── NavLinks
│   └── NavActions
├── HeroSection
│   ├── HeroPanel
│   │   ├── HeroBackgroundLayers
│   │   ├── CryptoPendantsVisual
│   │   ├── HeroHeadline
│   │   └── HeroCTA
├── LogoStrip
│   └── PartnerLogo
└── AcceptCryptoSection
    ├── PurplePlanetVisual
    ├── AcceptCryptoHeadline
    └── FeatureCards
        ├── FeatureCardCreateLink
        ├── FeatureCardShareLink
        └── FeatureCardGetPaid
```

---

# COPYWRITING CONTENT

Use this visible copy.

## Navbar

```txt id="kinrwu"
Kraken
Explore
Prices
Why Karken
Log in
Get started
```

If correcting the likely typo:
```txt id="uyczzl"
Why Kraken
```

## Hero

```txt id="kpcabm"
YOUR TRUSTED CRYPTO
PAYMENT GATEWAY

Get started now
```

## Partner logos

```txt id="vu6n4g"
MODE
LEGALZOOM
AUTODESK
descript
DEEPGRAM
LEGALZOOM
```

## Second section

```txt id="e6d03r"
THE FASTEST WAY TO
ACCEPT CRYPTO
```

## Feature cards

```txt id="lflbv0"
Create A Link
You can use Payment Links to sell a product or service, event tickets, crowdfunding or receive a donation.

Share The Link
Copy Link or QR code and share it with your customers anywhere.

Get Paid
Customers can pay through any network. Get notified via email and track payments.
```

---

# VISUAL DETAILS TO MATCH

Important fidelity points:

- Page background is not pure black; it is a very deep purple-black.
- Hero is inside a huge rounded rectangular panel.
- Top navbar is a glassy dark rounded rectangle, centered horizontally.
- Brand name “Kraken” is on the left of navbar.
- Navigation links are very small.
- “Get started” in navbar is purple.
- “Log in” is a dark outlined pill.
- Main hero artwork contains hanging crypto coins, not flat icons.
- Bitcoin coin is central and largest.
- Purple neon lighting is the main visual effect.
- The lower half of the hero has a pixelated purple-to-lavender gradient.
- Hero headline is uppercase, centered, white, and very large.
- CTA under hero headline is a small white pill.
- Partner logos are low-contrast gray and evenly distributed.
- Second section headline is also uppercase and centered.
- Second section visual has a purple planet/arc and a diagonal light beam.
- Three feature cards overlap the second visual.
- Cards are dark glass with thin purple borders.
- Center feature card sits lower than left/right cards.
- All corners are soft and rounded.
- Avoid blue, green, orange, or multicolor gradients.
- Keep the palette tightly limited to black, purple, lavender, white, and gray.
- The UI should feel secure, premium, and crypto-native.
- Do not make it cartoonish.
- Do not use generic corporate crypto illustrations.
- The lighting should feel cinematic and volumetric.

---

# FINAL IMPLEMENTATION GOAL

The final result should recreate the screenshot as a polished React landing page for a crypto payment gateway. The website should feel premium, secure, futuristic, and trustworthy. The top hero should be dominated by glowing hanging crypto pendants and a purple pixel-light floor, with a clean centered headline and CTA. The page should then transition into a muted partner logo strip and a second conversion section explaining the fastest way to accept crypto through three payment-link steps. The final interface should look like a high-end Web3 fintech product, not a generic landing page.
