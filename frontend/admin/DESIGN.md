---
name: Modern Matrimony
colors:
  surface: '#fcf8fb'
  surface-dim: '#dcd9dc'
  surface-bright: '#fcf8fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7ea'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#5c3f41'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#906f70'
  outline-variant: '#e5bdbe'
  surface-tint: '#be0037'
  primary: '#ba0035'
  on-primary: '#ffffff'
  primary-container: '#e12149'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb3b6'
  secondary: '#6a09e6'
  on-secondary: '#ffffff'
  secondary-container: '#833cff'
  on-secondary-container: '#f6edff'
  tertiary: '#ab2e17'
  on-tertiary: '#ffffff'
  tertiary-container: '#cd462d'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdada'
  primary-fixed-dim: '#ffb3b6'
  on-primary-fixed: '#40000c'
  on-primary-fixed-variant: '#920028'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5900c6'
  tertiary-fixed: '#ffdad3'
  tertiary-fixed-dim: '#ffb4a5'
  on-tertiary-fixed: '#3e0400'
  on-tertiary-fixed-variant: '#8c1703'
  background: '#fcf8fb'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  h1:
    fontSize: 40px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.25'
    letterSpacing: -0.01em
  h3:
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  caption:
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style

This design system is built to evoke a sense of modern romance, reliability, and sophistication. The personality is "Aspirational yet Accessible"—bridging the gap between traditional family values and contemporary digital dating experiences. 

The aesthetic leverages **Minimalism** with a **Tactile** twist. It uses heavy whitespace to reduce cognitive load during the high-stakes process of partner searching, combined with vibrant gradients that symbolize the "spark" of connection. The interface feels light and airy, but intentional depth is used to guide the user’s eye toward primary actions and trust-building elements.

## Colors

The palette is anchored by high-energy warm tones (Pink-red and Coral) balanced by a stable, trustworthy Deep Violet. 

- **Primary Gradient:** Used for the most critical CTA on any screen (e.g., "Send Interest"). It represents the core brand identity.
- **Secondary Gradient:** Reserved for secondary actions or decorative highlights that require user attention without competing with the primary CTA.
- **Premium Gradient:** Exclusively for upsell features, VIP badges, and subscription-only content to create a visual distinction of "Value."
- **Background Strategy:** Backgrounds must avoid pure white. Use `#F5F5F7` for standard page backgrounds and `#F4F0FF` for section breaks. Pure white is strictly reserved for the "Surface" level (cards, modal bodies, and input containers) to create a clean, floating effect.

## Typography

**Manrope** is the foundation of the design system. Its geometric yet friendly curves perfectly mirror the brand’s balance of modern tech and human warmth. 

- **Headlines:** Use Bold or ExtraBold weights with tighter letter spacing to create a strong visual hierarchy and a sense of "Authority."
- **Body Text:** Use Regular weight with generous line height (1.6) to ensure high readability during long sessions of profile viewing.
- **Labels:** Use SemiBold with slight tracking (letter-spacing) to differentiate metadata (e.g., age, location, occupation) from descriptive bio text.

## Layout & Spacing

The design system utilizes a **12-column fixed grid** for desktop, centering the content at a maximum width of 1200px to maintain focus. On mobile, a fluid 4-column grid is used with 20px side margins.

The spacing rhythm follows a base-4 system. Components should primarily use `16px (md)` and `24px (lg)` for internal padding. To emphasize the minimal aesthetic, use generous vertical spacing (`xl`) between major sections to allow the content to "breathe."

## Elevation & Depth

This design system uses **Ambient Shadows** to create a sense of hierarchy. Instead of harsh, grey shadows, we use "Tinted Shadows"—low-opacity violet or pink-tinged blurs that make cards feel integrated with the background.

- **Level 1 (Default Cards):** 0px 4px 20px rgba(90, 30, 219, 0.05).
- **Level 2 (Hover/Active):** 0px 8px 30px rgba(90, 30, 219, 0.12).
- **Level 3 (Modals/Popovers):** 0px 12px 40px rgba(0, 0, 0, 0.08).

Borders are used sparingly to define structure without adding visual noise. All containers use a subtle `#E5E5EA` border to maintain crispness on high-density displays.

## Shapes

The shape language is defined by "Approachable Softness." 

- **Standard Buttons & Inputs:** 0.5rem (8px) corner radius to feel professional but friendly.
- **Profile Cards & Main Containers:** 1rem (16px) corner radius to create a soft, inviting container for human faces and personal stories.
- **Search Bars & Badges:** Use the `rounded-xl` (24px) or full pill-shape to distinguish them from structural content containers.

## Components

- **Buttons:** Primary buttons use the 3-color primary gradient with white text and a soft shadow. Secondary buttons use a transparent background with a gradient border.
- **Cards:** White background (`#FFFFFF`), 16px corner radius, and Level 1 elevation. Profile cards should feature a high-aspect-ratio image with metadata layered at the bottom using a soft scrim.
- **Chips/Badges:** Small, pill-shaped elements with light violet backgrounds and Deep Violet text for tags like "Verified," "New," or "Premium."
- **Input Fields:** 8px rounded corners, `#FFFFFF` fill, and a 1px `#E5E5EA` border. On focus, the border should transition to a solid `#7B2FF7` or the secondary gradient.
- **Trust Indicators:** Special "Match Percentage" or "Verified Profile" icons should always use the Premium Gradient to signify quality and safety.
- **Progress Bars:** For profile completion, use the Primary Gradient to encourage users with a sense of vibrant momentum.