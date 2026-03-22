# Ryze Education Design System

## Core Colours
The Ryze design system uses semantic tokens to enforce consistency across the application.

### Brand
- `--ryze-primary` (`#11151d`): Deep navy/black, used for primary headings and prominent dark surfaces.
- `--ryze-primary-hover` (`#1a202c`): Lighter navy for hover states.
- `--ryze-accent` (`#B8841E`): Ryze Gold. Used sparingly for highlights, primary CTAs, and active states.

### Surfaces
- `--ryze-bg-primary` (`#fdfbf7`): The default warm white background for the entire application.
- `--ryze-bg-secondary` (`#f8f3ea`): A slightly darker warm tint for alternating sections.
- `--ryze-surface` (`#ffffff`): Pure white, used for cards and floating elements.
- `--ryze-surface-dark` (`#11151d`): Dark surface for inverted sections (e.g. Footer).

### Typography
- `--ryze-text-primary` (`#11151d`): Main body text and headings.
- `--ryze-text-secondary` (`#475569`): Supporting text, subtitles, and secondary information.
- `--ryze-text-muted` (`#64748b`): Tertiary text, placeholders, and subtle labels.
- `--ryze-text-inverse` (`#ffffff`): Text on dark backgrounds or CTAs.
- `--ryze-text-inverse-muted` (`rgba(255, 255, 255, 0.7)`): Muted text on dark backgrounds.

### Actions
- `--ryze-cta-primary` (`var(--ryze-accent)`): Primary action buttons.
- `--ryze-cta-primary-hover` (`#c89e2b`): Hover state for primary buttons.
- `--ryze-cta-secondary` (`transparent`): Secondary outlined buttons.
- `--ryze-cta-secondary-hover` (`rgba(184, 132, 30, 0.08)`): Hover state for secondary buttons.

### Borders
- `--ryze-border-subtle` (`rgba(23, 29, 40, 0.08)`): Very light borders for cards and sections.
- `--ryze-border-strong` (`rgba(23, 29, 40, 0.16)`): Stronger borders for emphasis.

## Utility Classes
Use the following Tailwind-style utility classes directly in `className`:

**Text Colours**
- `.ryze-text-primary`
- `.ryze-text-secondary`
- `.ryze-text-muted`
- `.ryze-text-inverse`
- `.ryze-text-inverse-muted`

**Backgrounds**
- `.ryze-bg-primary`
- `.ryze-bg-secondary`
- `.ryze-bg-surface`
- `.ryze-bg-surface-dark`

**CTAs**
- `.ryze-cta-primary`: Standard primary button style.
- `.ryze-cta-secondary`: Standard secondary button style.

## Usage Rules
1. **Never use hardcoded Tailwind neutral or brand colours** (e.g. `text-slate-600`, `bg-yellow-500`) for standard layout elements.
2. **Structural Opacities Allowed**: Raw colours like `bg-black/60` or `border-white/10` are explicitly allowed *only* when constructing structural glassmorphism or overlay effects, as these are visual primitives rather than theme colours.
3. **Semantic Errors/Successes**: Standard Tailwind colours like `text-red-500` and `bg-green-50` are permitted *only* for semantic functional states (errors, success messages, truth/myth binary comparisons).

## Linting
A custom lint rule is available via `npm run lint:colours`. This script prevents the regression of raw Tailwind colour utilities (`text-gray-*`, `bg-slate-*`, etc.) back into the codebase.
