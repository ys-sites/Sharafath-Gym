Build a dark, cinematic, premium single-page landing page for an AI agency named **AgentAI**, matching the provided screenshot as closely as possible.

The site is a futuristic AI agency homepage with a black background, electric red bioluminescent jellyfish hero visual, glassmorphism KPI cards, sharp white typography, tiny metadata labels, red CTAs, social proof blocks, and a modular services section. The visual language is **AI-native, premium, cyber-organic, editorial, dark, immersive, and conversion-focused**.

The page should feel like a mix between:
- a high-end AI product studio
- a futuristic agency portfolio
- a cinematic SaaS landing page
- a premium dashboard interface
- an organic intelligence / neural network metaphor

The red jellyfish is the visual soul of the website. It represents intelligence, neural systems, flow, data, living automation, and AI agents.

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

Recommended libraries:

React + Vite
Tailwind CSS
shadcn/ui Button/Card if useful
motion/react for animations
lucide-react for icons
CSS pseudo-elements for borders/glows/noise

Icons from lucide-react:

ArrowUpRight
Menu
Star
Sparkles
Activity
Layers
Zap
BarChart3
Facebook
X
CircleDot
ChevronDown
GLOBAL PAGE DIRECTION

Create a long vertical single-page landing page.

The screenshot ratio is a narrow desktop capture, approximately portrait-oriented, showing the top hero and the beginning of the services section.

The design should use:

black page background
white high-contrast headings
gray muted body copy
vivid red accent color
translucent dark glass cards
subtle white borders
red ambient glows
rounded pills
rounded dashboard cards
large negative space
dense but precise UI details

The layout should not feel like a generic SaaS landing page. It should feel more like a premium AI agency interface with cinematic art direction.

GLOBAL DESIGN TOKENS

Use these values as design tokens.

:root {
  --background: 0 0% 2%;
  --foreground: 0 0% 100%;

  --card: 0 0% 7%;
  --card-foreground: 0 0% 100%;

  --primary: 4 100% 56%;
  --primary-foreground: 0 0% 100%;

  --secondary: 0 0% 10%;
  --secondary-foreground: 0 0% 100%;

  --muted: 0 0% 14%;
  --muted-foreground: 0 0% 58%;

  --accent: 4 100% 50%;
  --accent-foreground: 0 0% 100%;

  --border: 0 0% 100% / 0.12;
  --input: 0 0% 100% / 0.12;
  --ring: 4 100% 55%;

  --radius: 1.5rem;

  --red: #ff2a1f;
  --red-dark: #8b0505;
  --red-soft: rgba(255, 42, 31, 0.16);
  --red-glow: rgba(255, 42, 31, 0.42);

  --black: #030303;
  --black-soft: #080808;
  --card-dark: rgba(18, 18, 18, 0.74);
  --card-darker: rgba(8, 8, 8, 0.82);

  --glass-bg: rgba(18, 18, 18, 0.68);
  --glass-border: rgba(255, 255, 255, 0.12);
  --glass-border-strong: rgba(255, 255, 255, 0.22);
  --glass-highlight: rgba(255, 255, 255, 0.08);
}
TAILWIND CONFIG

Extend the theme:

theme: {
  extend: {
    fontFamily: {
      heading: ["Inter Tight", "Inter", "sans-serif"],
      body: ["Inter", "sans-serif"]
    },
    colors: {
      redai: {
        DEFAULT: "#ff2a1f",
        dark: "#8b0505",
        soft: "rgba(255, 42, 31, 0.16)"
      }
    },
    borderRadius: {
      "4xl": "2rem",
      "5xl": "2.5rem"
    },
    boxShadow: {
      "red-glow": "0 0 40px rgba(255, 42, 31, 0.28), 0 0 120px rgba(255, 42, 31, 0.14)",
      "glass": "inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 80px rgba(0,0,0,0.55)"
    }
  }
}
FONTS

Use a clean, modern grotesk.

Import Google fonts:

@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

Font usage:

Headings: font-heading
Body: font-body

Typography should feel:

clean
tight
minimal
premium
not overly bold

Hero heading:

font-heading
font-medium
tracking-[-0.065em]
leading-[0.86]

Body:

font-body
text-white/55
leading-snug

Metrics:

font-heading
very large
thin/regular weight
tight tracking
GLOBAL CSS UTILITIES

Create these component utilities in index.css.

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

  .red-card-glow {
    box-shadow:
      0 0 28px rgba(255, 42, 31, 0.2),
      0 0 90px rgba(255, 42, 31, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .red-text {
    color: #ff2a1f;
  }

  .red-button {
    background: linear-gradient(180deg, #ff382d 0%, #e3150b 100%);
    box-shadow:
      0 0 30px rgba(255, 42, 31, 0.28),
      inset 0 1px 0 rgba(255, 255, 255, 0.22);
  }

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
      rgba(255,255,255,0.22),
      rgba(255,255,255,0.04) 45%,
      rgba(255,42,31,0.18)
    );
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
}
ASSETS REQUIRED

Use or generate these assets:

1. Main hero jellyfish

Asset description:

red glowing jellyfish
transparent or black background
bioluminescent
realistic / cinematic
long flowing tentacles
bright red dome
semi-transparent organic body
should look like red neural energy in deep black water

Place it as:

absolute element
center-right
huge scale
tentacles extending downward through hero

Suggested file:
/images/red-jellyfish.png

Recommended dimensions:

at least 1200px tall
transparent PNG/WebP preferred
2. Red-tinted team/workspace photo

Asset description:

people working in studio/office
red monochrome overlay
blurred/cinematic
used inside project card

Suggested file:
/images/red-office-team.jpg

3. Testimonial portrait

Asset description:

professional male portrait
white shirt
arms crossed
rectangular crop
used in testimonial card

Suggested file:
/images/testimonial-avatar.jpg

4. Logo strip

Use placeholder monochrome logos:

LOGOIPSUM style
abstract simple marks
gray, low contrast
5. Grain/noise texture

Optional:
/images/noise.png

Or create CSS noise/pattern with pseudo-element.

RESPONSIVE RULES

Desktop is primary.

For desktop:

max-width: 1240px to 1280px
hero min-height: 860px
12-column grid
jellyfish absolute center-right
floating KPI cards on right
manifesto text bottom-right

For tablet:

keep jellyfish behind content
reduce hero heading size
stack proof cards

For mobile:

hide or reduce right floating KPI cards
center or left-align hero text
jellyfish becomes background image behind hero
stack all stat cards
reduce manifesto size
services section stacks vertically

Breakpoints:

mobile: below 768px
tablet: 768–1024px
desktop: 1024px+
PAGE STRUCTURE
<div className="min-h-screen overflow-x-hidden bg-[#030303] text-white font-body">
  <Navbar />
  <main>
    <HeroSection />
    <ProofSection />
    <LogoStrip />
    <ServicesSection />
  </main>
</div>

The screenshot shows only these sections, but the page should feel like the beginning of a longer website.

SECTION 1 — NAVBAR

Create a floating navbar at the top.

Layout

Position:

fixed top-3 left-0 right-0 z-50
horizontal padding: px-4 md:px-6
inner max width: max-w-[1280px] mx-auto

Navbar contains 3 zones:

Left: Logo

Content:

red circular/oval logo mark
text “AgentAI”

Style:

logo icon: small red pill/circle, around 22px wide
brand text: white, small, medium weight
align horizontally

Suggested:

<div className="flex items-center gap-2">
  <div className="h-5 w-5 rounded-full bg-red-500 shadow-red-glow" />
  <span className="text-sm font-medium tracking-tight text-white">AgentAI</span>
</div>
Center: Navigation pill

Content:

Home
Services
Works
About
Contact

Style:

centered horizontally
dark translucent pill
border white/10
active “Home” is red pill
links are tiny

Tailwind:

hidden md:flex items-center gap-1 rounded-full border border-white/10 bg-black/45 p-1 backdrop-blur-xl

Active:

rounded-full bg-red-500 px-4 py-1.5 text-[11px] font-medium text-white

Inactive:

rounded-full px-4 py-1.5 text-[11px] font-medium text-white/70 hover:bg-white/5 hover:text-white
Right: Menu button

Content:

“Menu”
small icon / number-like symbol

Style:

red pill button
small height
top-right

Tailwind:

inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-[11px] font-medium text-white shadow-red-glow
SECTION 2 — HERO

This is the most important section.

Hero dimensions
relative min-h-[900px] overflow-hidden bg-[#030303] px-4 pt-[92px] md:px-6 md:pt-[110px]

The hero should contain:

dark/red ambient background
huge jellyfish image
left text block
left stat cards
right KPI cards
small floating social icon stack
lower-right manifesto text
subtle right-side vertical scroll indicator
HERO BACKGROUND

Use black as base.

Add layered radial gradients:

<div className="absolute inset-0 bg-[#030303]" />
<div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_16%,rgba(255,42,31,0.24),transparent_28%),radial-gradient(circle_at_72%_34%,rgba(160,0,0,0.18),transparent_32%),radial-gradient(circle_at_48%_68%,rgba(255,42,31,0.08),transparent_36%)]" />
<div className="noise-overlay" />
<div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[#030303]" />

Add subtle top vignette:

absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.25)_55%,rgba(0,0,0,0.9)_100%)]
HERO JELLYFISH

Place the jellyfish image absolutely.

Desktop placement:

absolute left-[37%] top-[72px] z-[1] h-[720px] w-[720px] object-contain opacity-95

The jellyfish dome should sit in the top center/right.
The tentacles should extend down past the midline, behind the cards and manifesto.

Add red glow behind it:

<div className="absolute left-[45%] top-[130px] z-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-red-500/20 blur-[110px]" />

Animate the jellyfish very slowly:

<motion.img
  src="/images/red-jellyfish.png"
  className="absolute left-[37%] top-[72px] z-[1] h-[720px] w-[720px] object-contain opacity-95"
  animate={{ y: [0, -18, 0], scale: [1, 1.025, 1] }}
  transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
/>
HERO GRID

Hero content wrapper:

relative z-10 mx-auto grid max-w-[1280px] grid-cols-12 gap-5

Left column:

col-span-12 pt-6 md:col-span-5 lg:col-span-5

Right column:

relative col-span-12 hidden min-h-[580px] md:col-span-7 md:block
HERO BADGE

Content:

AI Chain Agency

Style:

inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[11px] text-white/65 backdrop-blur-xl

Add red dot:

h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_12px_rgba(255,42,31,0.8)]
HERO HEADLINE

Exact text:

Your AI
Sprint Team
On Demand

Style:

mt-5 max-w-[480px] font-heading text-[58px] font-medium leading-[0.86] tracking-[-0.07em] text-white md:text-[68px] lg:text-[76px]

The headline should be large but not overly bold.
It should feel sharp, premium, and compressed vertically.

Implementation:

<h1 className="mt-5 max-w-[480px] font-heading text-[58px] font-medium leading-[0.86] tracking-[-0.07em] text-white md:text-[68px] lg:text-[76px]">
  Your AI
  <br />
  Sprint Team
  <br />
  On Demand
</h1>
HERO MICRO ANNOTATION

Place tiny text near the first line of headline, around the word “AI”.

Text:

From idea
to launch

Style:

tiny
gray
two lines
positioned absolute relative to headline

Suggested:

<span className="absolute left-[210px] top-[86px] hidden text-[9px] leading-[1.05] text-white/45 md:block">
  From idea
  <br />
  to launch
</span>

This creates the small editorial annotation seen beside the headline.

HERO SUBTEXT

Exact text:

From discovery to deployment, we plug into your stack
to prototype, validate, and launch AI experiences your
users actually love.

Style:

mt-5 max-w-[390px] text-[13px] leading-[1.25] text-white/58
HERO CTA GROUP

Two buttons horizontally aligned.

Wrapper:

mt-6 flex items-center gap-3

Secondary CTA:

Explore Service

Style:

rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-[12px] font-medium text-white/85 backdrop-blur-xl hover:bg-white/[0.1]

Primary CTA:

View Pricing Plans

Style:

red-button rounded-full px-5 py-2.5 text-[12px] font-semibold text-white hover:scale-[1.02]
HERO LEFT STAT CARDS

Place below CTA group.

Wrapper:

mt-8 grid max-w-[430px] grid-cols-3 gap-3

Cards:

Label: Happy Clients, Value: 3M+
Label: Kickstarts, Value: 95%
Label: Conversion, Value: 88%

Card style:

glass-card-soft fine-border min-h-[92px] rounded-2xl p-4

Card content:

label top-left, tiny gray
metric bottom-left, white large
small icon/mini line chart bottom-right

Label:

text-[9px] font-medium text-white/38

Metric:

mt-7 font-heading text-[24px] font-medium leading-none tracking-[-0.06em] text-white

Add small fake chart lines:

<div className="absolute bottom-4 right-3 flex items-end gap-[2px] opacity-50">
  <span className="h-2 w-[3px] rounded-full bg-white/30" />
  <span className="h-3 w-[3px] rounded-full bg-white/45" />
  <span className="h-1.5 w-[3px] rounded-full bg-red-500/70" />
</div>
RIGHT KPI CARD GROUP

Place on the right side of hero.

Wrapper:

absolute right-0 top-[58px] z-20 w-[205px] space-y-3
KPI Card 1

Content:

tiny top row: AgentAI left, 2026 right
small jellyfish thumbnail inside card
large metric: 230+
small caption: Projects across AI systems

Style:

glass-card fine-border rounded-[1.4rem] p-3

Image area:

relative h-[92px] overflow-hidden rounded-2xl bg-red-950/20

Metric:

mt-3 font-heading text-[34px] leading-none tracking-[-0.07em] text-white

Caption:

mt-1 text-[9px] leading-tight text-white/42
KPI Card 2

Content:

metric: 400+
caption: Product features
micro labels:
Strategy Plan
System
Product
red button: Dashboard

Style:

glass-card fine-border rounded-[1.4rem] p-4

Metric:

font-heading text-[38px] leading-none tracking-[-0.08em] text-white

Micro label grid:

mt-4 grid grid-cols-3 gap-2 text-[8px] text-white/45

Dashboard button:

mt-5 w-full rounded-full bg-red-500 px-4 py-2 text-[10px] font-medium text-white shadow-red-glow
FLOATING SOCIAL ICON STACK

Position:

absolute right-[245px] top-[340px] z-20 hidden flex-col gap-2 md:flex

Buttons:

grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/[0.045] text-white/55 backdrop-blur-xl

Icons:

Facebook-like f text
small circle/dot icon
X

They should look subtle, not dominant.

VERTICAL SCROLL INDICATOR

On far right edge of hero.

Position:

absolute right-3 top-[410px] z-20 hidden h-[150px] flex-col items-center gap-3 md:flex

Style:

tiny text rotated vertically
thin vertical line
small red dot

Content:

SCROLL

Tailwind:

text-[8px] uppercase tracking-[0.3em] text-white/30 [writing-mode:vertical-rl]

Line:

h-20 w-px bg-gradient-to-b from-white/10 via-red-500/50 to-white/10
HERO MANIFESTO TEXT

This is positioned lower right, underneath the jellyfish body and next to the tentacles.

Exact text:

We design and deploy AI solutions
with people at the core, ensuring
every system enhances real user
experiences.

Highlighted red phrases:

design
AI solutions
system enhances

Position:

absolute bottom-[72px] right-[20px] z-20 max-w-[560px]

Style:

font-heading text-[33px] font-medium leading-[0.96] tracking-[-0.055em] text-white md:text-[38px]

Implementation:

<p className="absolute bottom-[72px] right-[20px] z-20 max-w-[560px] font-heading text-[38px] font-medium leading-[0.96] tracking-[-0.055em] text-white">
  We <span className="text-red-500">design</span> and deploy{" "}
  <span className="text-red-500">AI solutions</span>
  <br />
  with people at the core, ensuring
  <br />
  every <span className="text-red-500">system enhances</span> real user
  <br />
  experiences.
</p>
SECTION 3 — LOWER PROOF SECTION

This starts immediately below hero.

Container:

relative mx-auto grid max-w-[1280px] grid-cols-12 gap-6 px-4 pb-12 md:px-6

Layout:

Left: project location card
Right: trusted metric + testimonial

Left column:

col-span-12 md:col-span-7

Right column:

col-span-12 md:col-span-5
PROJECT LOCATION CARD

This is a large glass card on the lower left.

Card style:

glass-card fine-border relative min-h-[345px] overflow-hidden rounded-[1.7rem] p-7

Content:

Small availability line:

Available for worldwide project

Main line:

Based in Montreal, Canada

The words Montreal, Canada should be red.

Button:

Start a Project

Image:

red-tinted office/team image
placed inside card bottom
rounded corners
strong red overlay
image fills lower card width

Structure:

<div className="glass-card fine-border relative min-h-[345px] overflow-hidden rounded-[1.7rem] p-7">
  <div className="text-center">
    <p className="inline-flex items-center gap-2 text-[10px] text-white/45">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      Available for worldwide project
    </p>
    <h3 className="mt-4 text-center font-heading text-[22px] tracking-[-0.04em] text-white">
      Based in <span className="text-red-500">Montreal, Canada</span>
    </h3>
    <button className="mt-5 rounded-full bg-white/10 px-4 py-2 text-[10px] text-white">
      Start a Project
    </button>
  </div>

  <div className="relative mt-8 h-[160px] overflow-hidden rounded-2xl">
    <img src="/images/red-office-team.jpg" className="h-full w-full object-cover grayscale opacity-85" />
    <div className="absolute inset-0 bg-red-600/55 mix-blend-multiply" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
  </div>
</div>
RIGHT SOCIAL PROOF BLOCK

Top small text:

Trusted by 20+ clients across 4 industries - shipping
AI from idea to production in 8-10 weeks

Style:

text-[10px] leading-tight text-white/55

Stars:

5 small stars in a row
white, tiny
positioned left of huge number or above it

Huge number:

120+

Style:

mt-6 font-heading text-[104px] font-medium leading-none tracking-[-0.085em] text-white

The metric should dominate the right proof section.

TESTIMONIAL CARD

Place under the 120+.

Card:

glass-card fine-border mt-6 flex min-h-[145px] items-center gap-5 rounded-[1.7rem] p-5

Left image:

h-[105px] w-[88px] rounded-2xl object-cover

Right content:

quote mark large
testimonial text
name
role

Quote:

Good AI feels obvious — because the hard work is hidden.

Name:

Ava Collins

Role:

Agenda Design Lead

Text style:

text-[12px] leading-snug text-white/82

Name:

mt-3 text-[10px] font-medium text-white

Role:

text-[9px] text-white/42
SECTION 4 — LOGO STRIP

Horizontal strip of muted partner logos.

Container:

mx-auto flex max-w-[1280px] items-center gap-10 px-4 py-10 md:px-6

Left label:

Trusted by 100+
regular brands

Style:

w-[140px] text-[9px] leading-tight text-white/35

Logos:

five or six gray logos
low contrast
evenly spaced
opacity 0.25

Logo style:

text-xl font-semibold italic tracking-tight text-white/20

Suggested logo labels:

Logoipsum
Logoipsum
Logoipsum
Logoipsum
Logoipsum

Add abstract small icons between them if desired.

SECTION 5 — SERVICES SECTION

The screenshot ends at the beginning of the services section.

Container:

mx-auto max-w-[1280px] px-4 pb-24 md:px-6

Outer panel:

rounded-[2rem] border border-white/10 bg-[#111111] p-7 md:p-10

Layout:

grid grid-cols-12 gap-8

Left side:

col-span-12 md:col-span-5

Right side:

col-span-12 md:col-span-7
SERVICES BADGE

Badge text:

Services

Style:

inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1 text-[9px] font-semibold text-red-500

Add a tiny red dot or red icon.

SERVICES HEADING

Text:

End-to-End
AI Services

Style:

mt-5 max-w-[280px] font-heading text-[44px] font-medium leading-[0.9] tracking-[-0.06em] text-white

Body text:

We turn ambiguous AI ideas into production features your users trust — combining strategy, design, engineering, and rigorous evaluation.

Style:

mt-5 max-w-[320px] text-[12px] leading-snug text-white/48
SERVICE CARD — AI STRATEGY & MAPPING

Right card style:

glass-card fine-border rounded-[1.7rem] p-7

Top row:

title left
number right: 01

Title:

AI Strategy
& Mapping

Style:

font-heading text-[31px] font-medium leading-[0.95] tracking-[-0.055em] text-white

Number:

text-[10px] text-white/35

Description:

Identify high-impact AI use cases and define a realistic, measurable AI roadmap.

Style:

mt-4 max-w-[360px] text-[11px] leading-snug text-white/45

Tags:

Stakeholder discovery
Value model & KPI definition
Data readiness assessment

Tag wrapper:

mt-8 flex flex-wrap gap-2

Tag style:

rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-[9px] text-white/55
ANIMATION SYSTEM

Use motion/react for a subtle high-end effect.

Global entrance animation

For most sections:

initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
viewport={{ once: true, margin: "-80px" }}
transition={{ duration: 0.7, ease: "easeOut" }}
Hero sequence
Navbar appears instantly or fades in
Badge appears first
Headline appears line-by-line
Subtext appears
CTA group appears
Stat cards stagger in
Jellyfish slowly floats continuously
KPI cards float subtly
Manifesto text fades in later
Jellyfish motion
animate={{ y: [0, -18, 0], scale: [1, 1.025, 1] }}
transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
Floating KPI cards
animate={{ y: [0, -8, 0] }}
transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}

Second card:

animate={{ y: [0, 8, 0] }}
transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
Button hover

Primary buttons:

hover:scale-[1.025] hover:shadow-[0_0_45px_rgba(255,42,31,0.45)]
transition-all duration-300

Cards:

hover:border-red-500/25 hover:bg-white/[0.06] transition-all duration-300
EXACT VISUAL HIERARCHY

The eye should read the page in this order:

Red glowing jellyfish
Hero headline: “Your AI Sprint Team On Demand”
Red CTA: “View Pricing Plans”
Right KPI cards: 230+ and 400+
Manifesto text with red words
Left stat cards: 3M+, 95%, 88%
Project card: “Based in Montreal, Canada”
Huge 120+
Testimonial card
Logo strip
Services section heading

Make sure the jellyfish remains the strongest visual element without making the text unreadable.

SPACING AND LAYOUT DETAILS

Use this approximate desktop geometry:

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
COMPONENT TREE
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
COPYWRITING CONTENT

Use exactly this copy where possible.

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

Micro annotation:

From idea
to launch

Subtext:

From discovery to deployment, we plug into your stack to prototype, validate, and launch AI experiences your users actually love.

Buttons:

Explore Service
View Pricing Plans

Stats:

Happy Clients
3M+

Kickstarts
95%

Conversion
88%
Right KPI cards
AgentAI
2026
230+
Projects across AI systems

400+
Product features
Strategy Plan
System
Product
Dashboard
Manifesto
We design and deploy AI solutions with people at the core, ensuring every system enhances real user experiences.
Project card
Available for worldwide project
Based in Montreal, Canada
Start a Project
Social proof
Trusted by 20+ clients across 4 industries - shipping AI from idea to production in 8-10 weeks
120+
Testimonial
Good AI feels obvious — because the hard work is hidden.
Ava Collins
Agenda Design Lead
Logo strip
Trusted by 100+
regular brands
Services
Services
End-to-End
AI Services

We turn ambiguous AI ideas into production features your users trust — combining strategy, design, engineering, and rigorous evaluation.

AI Strategy
& Mapping
01

Identify high-impact AI use cases and define a realistic, measurable AI roadmap.

Stakeholder discovery
Value model & KPI definition
Data readiness assessment
VISUAL DETAILS TO MATCH

Important details from the screenshot:

The page background is almost pure black.
The red jellyfish is extremely luminous and dominates the hero.
The hero headline is large, white, left aligned, and tightly stacked.
The red is vivid and slightly neon, not burgundy.
Cards have very subtle borders and dark glass backgrounds.
The navigation is small and pill-shaped.
The active nav item is red.
The right KPI cards feel like miniature dashboard widgets.
The lower-left project card has a red-tinted image.
The 120+ metric is very large and white.
The testimonial card includes a portrait on the left.
The logo strip is very low contrast.
The services section begins in a large rounded dark container.
All elements feel aligned, intentional, and premium.
Avoid colorful gradients other than red.
Avoid blue/purple SaaS colors.
Avoid cartoonish AI illustrations.
Avoid flat corporate design.
FINAL IMPLEMENTATION GOAL

The final result should visually recreate the screenshot as a polished React landing page. It should feel like a premium AI agency website where the design communicates speed, intelligence, trust, and execution. The red jellyfish should create a memorable, cinematic identity. The glass cards and KPI modules should make the agency feel technical and productized. The copy should make the offer clear: AgentAI is an on-demand AI sprint team that designs, prototypes, validates, and deploys AI systems with real user experience at the center.
