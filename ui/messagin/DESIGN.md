---
name: Midnight Executive
colors:
  surface: '#16130b'
  surface-dim: '#16130b'
  surface-bright: '#3d392f'
  surface-container-lowest: '#110e07'
  surface-container-low: '#1f1b13'
  surface-container: '#231f17'
  surface-container-high: '#2d2a21'
  surface-container-highest: '#38342b'
  on-surface: '#eae1d4'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#eae1d4'
  inverse-on-surface: '#343027'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#c3c0ff'
  on-secondary: '#1d00a5'
  secondary-container: '#3626ce'
  on-secondary-container: '#b3b1ff'
  tertiary: '#70e3b0'
  on-tertiary: '#003825'
  tertiary-container: '#52c796'
  on-tertiary-container: '#004f36'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#0f0069'
  on-secondary-fixed-variant: '#3323cc'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#16130b'
  on-background: '#eae1d4'
  surface-variant: '#38342b'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  title-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.5'
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  margin-safe: 32px
  gutter: 24px
  panel-padding: 40px
---

## Brand & Style

The design system is engineered for an ultra-luxury executive environment, evoking the exclusivity of a private members' club. The aesthetic is rooted in **Dark Minimalism** with a **Glassmorphic** layer, utilizing deep obsidian tones to provide a high-contrast stage for metallic accents. The emotional response is one of absolute privacy, prestige, and effortless power.

Key visual pillars include:
- **Atmospheric Depth:** Multi-layered blacks creating a sense of infinite space.
- **Metallic Precision:** Accents that mimic brushed gold and polished chrome.
- **Tactile Refinement:** Subtle textures reminiscent of black marble and high-grade leather.
- **Motion Elegance:** Slow, purposeful transitions and "glint" animations on hover to simulate light hitting metal.

## Colors

The palette is anchored by **Deep Obsidian Black**, serving as a void that allows the **Luxury Gold** accents to command attention.

- **Primary (Gold):** Used for critical actions, status indicators, and brand-defining separators. 
- **Secondary (Sapphire):** Reserved for high-priority executive alerts and secure encryption markers.
- **Tertiary (Emerald):** Used sparingly for confirmation states and financial growth indicators.
- **Neutral (The Blacks):** Layered from #050505 (base) to #181818 (interactive panels) to create structural hierarchy without the need for traditional borders.

Status indicators replace standard "online" dots with a **Gold Pulse Ring**, symbolizing an active presence within the elite circle.

## Typography

This design system employs a sophisticated typographic contrast between **Playfair Display** and **Inter**. 

- **Headlines:** Use Playfair Display for all major section headers and display text. It provides the authoritative, literary feel of a heritage luxury brand.
- **Interface & Body:** Inter is utilized for its functional precision. Its neutral, systematic nature ensures high readability for rapid executive communication.
- **Labels:** Small labels and metadata should use uppercase Inter with increased letter spacing to mimic the engraving found on luxury watches.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop to maintain a composed, editorial feel, while transitioning to a **Fluid Grid** on mobile for functional utility.

- **Generous Whitespace:** Padding is intentionally oversized (minimum 40px for primary panels) to evoke a sense of "digital luxury"—where space is the ultimate commodity.
- **Vertical Rhythm:** Elements are aligned to a 4px baseline grid.
- **Breakpoints:**
  - **Desktop (1440px+):** 12 columns, 32px margins, fixed center container.
  - **Tablet (768px - 1439px):** 8 columns, 24px margins, fluid.
  - **Mobile (0px - 767px):** 4 columns, 16px margins, fluid.

## Elevation & Depth

Hierarchy is established through **Glassmorphism** and **Tonal Layering** rather than traditional drop shadows.

- **The Glass Layer:** Elevated panels (like chat windows or modal overlays) use a `backdrop-filter: blur(20px)` with a 10% opacity white tint and a 1px "silk" border (`rgba(255,255,255,0.08)`).
- **Shadows:** When shadows are necessary, they are highly diffused (40px+ blur) and tinted with the `#050505` background color to create a "recession" effect rather than a "floating" effect.
- **Gold Separators:** Use ultra-thin (0.5pt) lines with a linear gold gradient to separate major content sections, simulating gold inlay in black marble.

## Shapes

The shape language is **Soft (0.25rem)**. This slight rounding suggests precision engineering—reminiscent of the chamfered edges on a high-end smartphone or a luxury timepiece.

- **Primary Elements:** 0.25rem (4px) corner radius.
- **Large Containers:** 0.75rem (12px) corner radius.
- **Special Elements:** Avatars and "Gold Pulse" indicators should remain perfectly circular to contrast against the structured grid.

## Components

- **Buttons:** Primary buttons feature a subtle gold gradient with a "metallic glint" animation on hover. Text is bold and minimal.
- **Input Fields:** Bottom-border only, or a very dark `#121212` fill with a 1px gold focus ring. No heavy boxes.
- **Cards:** Utilize a "Black Marble" texture background overlay at 5% opacity. Borders are almost invisible until hovered, where they reveal a faint gold shimmer.
- **Chips:** Used for "Executive Tags." These are dark grey with gold text, avoiding background fills to maintain a clean look.
- **Icons:** Must be monoline, metallic/chrome finish. Avoid filled icons unless indicating an active toggle state.
- **Messenger Specifics:**
  - **Message Bubbles:** Outlined with a soft gradient for the sender; solid `#181818` for the receiver.
  - **Status:** Instead of "Read Receipts," use a "Signature Verified" gold checkmark icon.