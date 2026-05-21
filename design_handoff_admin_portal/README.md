# Handoff: Ryze Portal Redesign

A complete visual and structural redesign of the `/dashboard/*` portal — sidebar shell, top bar, the **Settings module**, and role-specific page mocks for all four user roles: **Admin · Tutor · Student · Parent**.

---

## About these files

The files in this bundle are **design references built as a self-contained HTML/React prototype**. They are NOT production code to ship as-is.

The target is the existing repo at `Ryze-Education-Prototype/` — a Vite + React + TypeScript + Tailwind + React Router app with an existing dashboard at `pages/dashboard/admin/*`, sidebar at `components/dashboard/Sidebar.tsx`, and shell at `components/dashboard/DashboardLayout.tsx`. The implementation task is to **recreate this design in the existing codebase** using its conventions (Tailwind utility classes scoped to `--ryze-*` CSS variables, lucide-react icons, React Router routes already wired in `App.tsx`).

A handful of design tokens already exist in `DESIGN_SYSTEM.md` (e.g. `--ryze-accent`, `--ryze-bg-primary`). Reuse those; this handoff adds the additional tokens needed for the dark-by-default portal surface (`--bg-app`, `--bg-surface`, `--side-bg`, etc.).

## Fidelity

**High-fidelity.** Colours, type scale, spacing, borders, radii, hover/active states and component layouts are all final. Pixel-match the visual output of the prototype.

## What's in this bundle

```
design_handoff_admin_portal/
├── README.md                  ← this file
├── Dashboard.html             ← the prototype entry (open in browser)
└── dashboard/
    ├── theme.css              ← all design tokens + component CSS
    ├── icons.jsx              ← stroke icons (replace with lucide-react in target)
    ├── shell.jsx              ← <Sidebar>, <Topbar>, NAV (role-aware)
    ├── pages.jsx              ← Admin role pages + shared PageHead / Stat / StatusTag / Bars
    ├── pages-tutor.jsx        ← Tutor role pages
    ├── pages-student.jsx      ← Student role pages
    ├── pages-parent.jsx       ← Parent role pages
    ├── settings.jsx           ← Settings module (8 sections + form primitives)
    ├── app.jsx                ← role-aware routing + tweaks wiring (don't port — see below)
    └── tweaks-panel.jsx       ← prototype-only, do not port
```

Open `Dashboard.html` directly in a browser to interact with the prototype. The Tweaks panel (bottom-right) lets you toggle theme/sidebar/accent/density/font/role — those are **exploration controls for design review only** and should not be ported to production. Pick the chosen final values (see *Defaults* below) and ship those.

---

## Defaults to ship

| Token            | Final value                       |
|------------------|-----------------------------------|
| Theme            | **Dark** (`data-theme="dark"`)    |
| Accent           | **Ryze Gold `#B8841E`**           |
| Sidebar          | **Expanded** (248 px, always-on)  |
| Density          | **Balanced**                      |
| Font pairing     | **Cormorant Garamond + Manrope**  |
| Mono             | **JetBrains Mono**                |

Light theme + accent variants are designed to work and can be exposed as a user preference later, but the production default ships dark.

---

## Design tokens

All tokens live in `dashboard/theme.css`. Below are the canonical values.

### Colour — Dark theme (default)

| Token              | Value                              | Use                                  |
|--------------------|------------------------------------|--------------------------------------|
| `--bg-app`         | `#0a0e16`                          | App background                       |
| `--bg-sidebar`     | `#0d1119` (via `--side-bg #07090e`)| Sidebar background                   |
| `--bg-surface`     | `#11151e`                          | Cards, panels                        |
| `--bg-surface-2`   | `#161b26`                          | Toolbar, search input, secondary fill|
| `--bg-elevated`    | `#1b2230`                          | Hover surface on dark cards          |
| `--bg-hover`       | `rgba(255,255,255,0.04)`           | Row hover, ghost button hover        |
| `--bg-active`      | `rgba(255,255,255,0.06)`           | Pressed state                        |
| `--fg-strong`      | `#f6f4ef`                          | Headings, primary text               |
| `--fg-default`     | `#d8d4cb`                          | Body text                            |
| `--fg-muted`       | `#8a8b8e`                          | Subtitles, table sub-cells           |
| `--fg-faint`       | `#5a5c61`                          | Timestamps, helper meta              |
| `--border-faint`   | `rgba(255,255,255,0.06)`           | Card borders, divider lines          |
| `--border-soft`    | `rgba(255,255,255,0.09)`           | Inputs, toolbar chips                |
| `--border-strong`  | `rgba(255,255,255,0.14)`           | Hover border emphasis                |
| `--shadow-card`    | `0 1px 0 rgba(255,255,255,.02) inset, 0 12px 32px -18px rgba(0,0,0,.6)` | Card shadow |

### Colour — Light theme (optional)

| Token              | Value                              |
|--------------------|------------------------------------|
| `--bg-app`         | `#f6f1e8`                          |
| `--bg-surface`     | `#ffffff`                          |
| `--bg-surface-2`   | `#fbf7ef`                          |
| `--fg-strong`      | `#11151d`                          |
| `--fg-default`     | `#2a2f3a`                          |
| `--fg-muted`       | `#6b7280`                          |
| `--side-bg`        | `#11151d` (sidebar stays dark)     |

### Accent (Ryze Gold)

| Token              | Value                              |
|--------------------|------------------------------------|
| `--accent`         | `#B8841E`                          |
| `--accent-soft`    | `rgba(184, 132, 30, 0.16)`         |
| `--accent-soft-2`  | `rgba(184, 132, 30, 0.08)`         |
| `--accent-fg`      | `#ffffff` (text on accent fill)    |
| `--accent-ink`     | `#1a1305` (text on accent for high-contrast: brand mark, avatar) |

### Semantic

| Token         | Value      |
|---------------|------------|
| `--ok`        | `#4f9b6a`  |
| `--warn`      | `#c89e2b`  |
| `--danger`    | `#c25450`  |
| `--info`      | `#5e7fb3`  |

Tag fills are computed via `color-mix(in oklab, var(--ok) 12%, transparent)` for backgrounds and `var(--ok) 26%` for borders. See `.tag--ok`, `.tag--warn`, `.tag--danger`, `.tag--info`, `.tag--accent` in `theme.css`.

### Typography

| Token                    | Value                                                            |
|--------------------------|------------------------------------------------------------------|
| `--font-sans`            | `"Manrope", system-ui, sans-serif`                               |
| `--font-display`         | `"Cormorant Garamond", "Times New Roman", serif`                 |
| `--font-display-style`   | `italic`                                                         |
| `--font-display-weight`  | `500`                                                            |
| `--font-mono`            | `"JetBrains Mono", ui-monospace, monospace`                      |

**Display headings** (page titles, stat values, brand mark, class card names) use Cormorant Garamond italic 500. **Body and UI** uses Manrope. **Tabular numerals** (times, currency, ids, percentages) use either JetBrains Mono or Manrope with `font-feature-settings: "tnum" 1`. Apply via `.tnum` utility.

Load fonts:
```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=JetBrains+Mono:wght@400;500&display=swap">
```

### Type scale

| Class / use                | Size              | Weight     | Notes                              |
|----------------------------|-------------------|------------|------------------------------------|
| `.page-head__title`        | `clamp(38px, 3.5vw, 54px)` | 500 italic | Cormorant, line-height 1.08, letter-spacing -0.018em, `text-wrap: balance` |
| `.stat__value`             | `44px`            | 500 italic | Cormorant                          |
| `.class-card__name`        | `26px`            | 500 italic | Cormorant                          |
| `.empty__title`            | `28px`            | 500 italic | Cormorant                          |
| Body / UI default          | `14px / 1.45`     | 400–500    | Manrope                            |
| Card title (`.card__title`)| `14px`            | 600        | Manrope                            |
| Card sub (`.card__sub`)    | `12.5px`          | 400        | Manrope, muted                     |
| Eyebrow (`.eyebrow`)       | `11px`            | 700        | Manrope, uppercase, tracking 0.16em|
| Nav item label             | `13.5px`          | 500 / 600 active | Manrope, tracking -0.005em   |
| Table header               | `11px`            | 700        | Uppercase, tracking 0.12em, muted  |
| Table cell                 | `13.5px`          | 400        | `.cell-name` is 500/strong         |

### Spacing scale (density: balanced — default)

| Token            | Value     |
|------------------|-----------|
| `--pad-page-x`   | `40px`    |
| `--pad-page-y`   | `32px`    |
| `--row-h`        | `56px`    |
| `--card-pad`     | `22px`    |
| `--gap-md`       | `20px`    |
| `--gap-lg`       | `28px`    |

Airy (`56/44/64/28/24/36`) and Dense (`28/22/44/16/14/20`) variants are in `theme.css` if needed.

### Radii

| Element                            | Radius |
|------------------------------------|--------|
| Card, panel                        | `16px` |
| Stat tile, class card              | `14–16px` |
| Button, input                      | `9–10px` |
| Brand mark                         | `9px`  |
| Nav item                           | `8px`  |
| Tag / pill                         | `999px`|
| Avatar (circular)                  | `50%`  |

### Shadows

- Cards: `0 1px 0 rgba(255,255,255,.02) inset, 0 12px 32px -18px rgba(0,0,0,.6)` (dark) / `0 1px 0 rgba(255,255,255,.9) inset, 0 18px 40px -28px rgba(17,21,29,.18), 0 4px 12px -8px rgba(17,21,29,.08)` (light)
- Primary CTA: `0 6px 18px -10px color-mix(in oklab, var(--accent) 70%, transparent)`
- Schedule blocks: `0 4px 12px -6px rgba(0,0,0,.18)`

### Motion

- Page-level transitions: `220ms ease` (sidebar width)
- Hover micro-transitions: `140–160ms ease` for `background`, `border-color`, `color`, `transform: translateY(-1px)`
- Live schedule block pulse: 2.4s ease-in-out infinite, expands a `0 → 8px` soft accent ring

---

## Layout — Shell

### App frame
- CSS grid: `grid-template-columns: var(--side-w) 1fr` — `--side-w` is `248px` (expanded) or `72px` (rail). Default: expanded.
- Sidebar is `position: sticky; top: 0; height: 100vh` — never scrolls with content; only its own internal nav scrolls if it overflows.
- Main column: `flex-direction: column` with sticky `<Topbar>` and scrollable `<main__body>`. Body has `max-width: 1480px` and is centered horizontally with `--pad-page-x` / `--pad-page-y` padding.

### Sidebar (`248px` expanded)

Structure top-to-bottom:
1. **Brand block** (`64px` tall, bottom border `--side-border`):
   - Square gold mark `32×32`, radius 9px, holds italic Cormorant **"R"** glyph at 22px, colour `--accent-ink` on `--accent` fill.
   - Beside it: "Ryze" (Cormorant italic 22px) + "ADMIN CONSOLE" (10.5px, uppercase, tracking 0.16em, muted).
   - In rail mode: only the mark, centered.
2. **Scrollable nav region** (`padding: 18px 12px`):
   - Five groups, each with an uppercase 10.5px label (`.side__group-label`) and a vertical stack of items spaced `1px` apart.
   - Groups separated by `18px` margin (expanded) — rail mode adds a `1px` top border.
   - Group order (admin role): **Today · People · Teaching · Finance · System**.
3. **User footer card** (`14px` padding, top border):
   - Avatar (32×32 circle, gold gradient, initial), name (13/600), email (11px muted), logout icon button.
   - In rail mode: avatar only, centered.

#### Nav item states

| State    | Background                  | Foreground            | Left rail (`-12px`)         |
|----------|-----------------------------|-----------------------|-----------------------------|
| Default  | transparent                 | `--side-fg-muted`     | none                        |
| Hover    | `--side-hover`              | `--side-fg`           | none                        |
| Active   | `--side-active-bg` (gold-soft) | `--side-active-fg` (gold) | 2 px gold (`--accent`) bar, 7px from top/bottom |

Item layout: `padding: 8px 12px`, `gap: 12px`, radius 8px. Icon 17px stroke 1.6 (1.9 when active). Label 13.5px, weight 500 (600 active). Badge for counts is a `rgba(danger, 28%)` pill with white text; in rail mode it collapses to a 6px red dot top-right.

### Topbar (`64px` tall)
- Sticky, `backdrop-filter: blur(14px)` over `color-mix(in oklab, var(--bg-app) 88%, transparent)`.
- Three-section flex: **left** crumbs (truncate at 40% width) · **center** search · **right** bell + avatar.
- **Breadcrumbs**: dot-separated stack like `Admin › People › Students` with `IconChevronRight` 14px separator. Current crumb is `--fg-strong` 600; previous crumbs are `--fg-muted` 400.
- **Search**: pill input, `padding: 8px 12px`, `bg: --bg-surface-2`, `border: --border-soft`, `radius: 10px`. Icon 15px + placeholder text + ⌘K kbd hint. Collapses to icon-only below 900px.
- **Right cluster**: `IconBell` button (36×36, radius 9, with a 7px gold dot indicator at top-right and a 2px ring matching `--bg-app`) · `1×22px` divider · name/role text right-aligned + 36×36 gold-gradient avatar circle.

---

## Admin pages

### 1. Overview (`/dashboard/admin`)

Vertical stack with `--gap-lg` between sections:

1. **PageHead** — eyebrow `SUNDAY 17 MAY`, h1 `Good morning, Sasha.` (italic Cormorant, last word in gold via `.accent-text`), sub copy 14px muted explaining today's load, right-side actions: `Refresh` (ghost) + `Quick action` (primary gold).
2. **Stat row** (`grid-template-columns: repeat(4, 1fr)`, `gap: --gap-md`):
   - `Active students` 142 · +6 this week (up) · "92% retention"
   - `Classes running` 18 · 2 with low seats (down) · "5 tutors"
   - `Lessons today` 04 · 1 live now (up) · "08 tomorrow"
   - `Outstanding` $2.4k · 3 overdue (down) · "of $24k due"
3. **Two-up row** (`grid-template-columns: 8fr 4fr`):
   - **Today's lessons card** — 4 rows, each `grid-template-columns: 76px 1fr auto`: time block (mono 15/600 start + 11px end), title + tutor·room·seats meta, status tag. Live lesson uses `tag--accent` and the row gets a subtle hover.
   - **Needs attention card** — 3 alerts, each with severity pip (32×32 radius 9, semantic-coloured), title + body, mono timestamp.
4. **Quick actions card** — left column (220px) holds eyebrow "SHORTCUTS" + hint copy; right column is a 6-column grid of action buttons. Each button is 96px tall, flex-column with a 32×32 icon tile and label. The first button (`Add student`) uses the `is-accent` variant: gold-soft background, gold icon fill on gold tile.
5. **Health strip** — inline pills with a 7px green dot + label + muted meta, plus a divider and Sydney time on the right.

### 2. Students

1. **PageHead** — eyebrow `ROSTER`, "Students", sub copy, right: `Export` (ghost) + `Add student` (primary).
2. **Stat row** (4 cols): Active 124, Trial 08, Paused 06, At risk 04.
3. **Roster card** (flush — `padding: 0`):
   - **Toolbar** (`padding: 14px 22px`, bottom border):
     - Search input (flex-1, min 240px): inline `IconSearch` 14px + plain `<input>` with `--fg-muted` placeholder.
     - Filter chips: `All / Active / Trial / Paused / At-risk` — radius 9, `--bg-surface-2`, 12.5/600. Active chip switches to `--accent-soft` bg + `--accent` text + accent-tinted border.
     - `More filters` (ghost) + `Sort` (quiet).
   - **Table** (`.table`):
     - Header row: 11/700 uppercase, tracking 0.12em, muted, sticky, `--bg-surface-2` fill, bottom border.
     - Body row: `padding: 14px 22px`, bottom border, hover `--bg-hover`.
     - Columns: Student (avatar + name + ID) · Year & class (two-line) · Parent (two-line with mail glyph) · Progress (bar + percentage, 160px min) · Status tag · Last seen (muted mono) · Row actions (more icon).
     - **Avatar swatches**: 5 colour variants — default gold, `--blue` (info), `--green` (ok), `--purple` `#8669c2`, `--rose` `#b56770`. Background is `color-mix(in oklab, swatch 22%, var(--bg-surface))`, foreground is the swatch hex. Initials 12.5/700.
     - **Progress bar**: 6px tall, `--bg-surface-2` track with `--border-faint` border, fill is `linear-gradient(90deg, var(--accent), color-mix(in oklab, var(--accent) 65%, #fff))`.
   - **Table foot**: count summary left + `‹ 1 / 18 ›` pager right.

### 3. Classes

1. **PageHead** — eyebrow `OPERATIONS`, "Classes", right: `Week view` (ghost) + `New class` (primary).
2. **Class grid** — `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`, gap `--gap-md`.

Each card (radius 16, padding 20, default border + shadow, hover lifts `-2px` + strong border):
- **Header row** — left: day-of-week pill (`TUE` etc — 11/600 uppercase, tracking 0.16em, `--accent-soft` bg, gold text) + mono start time. Right: status tag (`Running` / `Low seats`).
- **Class name** — italic Cormorant 26px, `--fg-strong`, top margin 14.
- **Level subtitle** — 13px muted.
- **Divider** (18px above/below).
- **Meta grid** — 3 columns: each has 10px eyebrow + 13/600 value. Eyebrow > "Tutor"/"Seats"/"Revenue", value > name / seat count / weekly rev.
- **Footer** — `Open ↗` quiet button right-aligned.

### 4. Lessons

1. **PageHead** — eyebrow `TODAY · WED 15 MAY`, "Lessons", right: segmented control (`Day | Week | Month`, active is Day) + `Schedule` (primary).
2. **Stat row** (4 cols): Lessons today 04 · Attendance 92% · Make-ups owed 03 · Empty seats 07.
3. **Schedule card** (flush):
   - **Header** — title "Schedule · by studio" + sub "3 studios · 4 lessons · 1 live" + `Print roster` quiet right.
   - **Two-column body** (`grid-template-columns: 180px 1fr`):
     - **Rooms column**: corner spacer (40px) then 3 rows of 72px each — studio name 13.5/600 + capacity sub.
     - **Timeline column** (overflow-x scroll):
       - **Hour ruler**: 40px tall, hours 09–20, each col 88px wide, `border-left: 1px dashed --border-faint`, mono 11px label.
       - **Lane rows**: 72px tall, dashed vertical lines per hour.
       - **Lesson blocks** positioned absolutely with `left = (start-9) * 88` and `width = (end-start) * 88 - 4`. Three states:
         - `upcoming` — info-tinted fill, info border, info text.
         - `live` — accent-tinted fill + animated pulse ring (2.4s ease-in-out, `0 → 8px` accent halo).
         - `done` — `--bg-surface-2` fill, soft border, muted text.
       - Each block contains: bold title 12.5/600, tutor line 11.5px 0.85 opacity, status tag self-aligned bottom-left.

### 5. Payments

1. **PageHead** — eyebrow `FINANCE`, "Payments", right: `Export to Xero` (ghost) + `New invoice` (primary).
2. **Stat row** (4 cols): This week $8,420 (+12%) · Outstanding $2,400 (3 overdue) · Overdue 03 · Auto-collect 78%.
3. **Two-up row** (`grid-template-columns: 7fr 5fr`):
   - **Invoice table card** — toolbar (search + chips `All / Due / Overdue / Paid` + filters) then table (Invoice ID in mono, Student/Parent two-line, Amount strong tnum, Method muted, Status tag, Due).
   - **Charts card** — "Cash collected" / "Last 8 weeks" + 8-bar chart (130px tall, gradient gold bars, last bar lighter to indicate current); divider; "Top earners" rank list (zero-padded rank · class name · revenue right-aligned in gold).

### 6. Settings

The `/dashboard/admin/settings` route is a full designed module — not a placeholder. See the **Settings module** section further below for the complete spec.

### Placeholder pages (Calendar, Alerts, Parents, Tutors, Attendance, Homework, Reports, Resources, Tutor payments, Announcements, Bot health, Courses)

Centered empty state inside a card: 64×64 surface-2 art tile holding an `IconClock`, italic Cormorant "In design" 28px, body 38ch max muted explaining the module is part of scope, ghost `Open in Figma ↗` button. This is intentional — when implementing, replace with the real module UI from a follow-up handoff (this redesign covered the shell + 5 anchor pages first).

---

## Tutor, Student and Parent pages

The three non-admin roles get their own designed pages — fewer pages each, focused on what that role actually does in the portal. Same design system, same shell, same Settings module. Just role-appropriate content.

All three role files **reuse the shared building blocks exported from `pages.jsx`**: `<PageHead>`, `<Stat>`, `<StatusTag>` (with the full state map), and `<Bars>` (for chart panels). Any token / accent / type change in Settings flows through every role automatically.

### Tutor (`pages-tutor.jsx`)

**Tutor Overview** — the main landing page. Same `<PageHead>` pattern; CTAs are `Take attendance` (ghost) and `New homework` (primary).
- 4-stat row: Today's lessons · Students taught · Hours this week · To grade.
- `row--8-4` split: "Your lessons today" card (lesson rows with inline `Mark` quiet button + status tag) + "Needs attention" card (3 alert-row entries: students missing lessons, partial homework submissions, reports due).
- Quick actions card with 6 tutor-specific shortcuts, the first (`Take attendance`) using the `is-accent` variant.

**Tutor Classes** — a smaller class card grid (typically 2–4 classes). Same `.class-card` markup as the admin Classes page but the meta tiles are *Size / Time / Homework* instead of *Tutor / Seats / Revenue*.

**Tutor Attendance** — the working-tool page. Toolbar (search + filter chips: All/Present/Late/Absent), then a roster table where the last column is a full-width `<Segment>` with `Present / Late / Absent / Paused`. Selecting a value updates the local state and the stat row above (Roll size / Present / Late / Absent) re-tallies live. Save button persists the roll.

**Tutor Homework** — toolbar + table. Columns: Assignment (title + mono ID) · Class · Submitted (uses the same `.progress` component as Students roster, showing `submitted/total` count instead of a percent) · Due · Status tag · more menu.

### Student (`pages-student.jsx`)

**Student Dashboard** — the most distinctive page, designed to feel personal:
- `<PageHead>` with year level eyebrow and italic display greeting; single primary CTA `Open AI tutor`.
- `row--12-5` split: **Up next hero card** (accent-tinted gradient background, accent eyebrow `Up next · in 4h 12m`, 36px italic Cormorant topic title, tutor + room meta, `Open lesson plan →` primary + `Add to calendar` ghost) and a small vertical 2-stat column (Homework due / Term average).
- 2-up course cards: per-enrolled-course card with tutor eyebrow, accent `Next · Tue 5:00pm` tag, 28px italic course name, current topic, progress bar, `Open ↗` quiet.
- `row--8-4`: Homework card (4 rows max with `Submit` primary or score tag) + **Streak card** (big italic 64px count, `weeks attended in a row` caption, then a divider and a "This week's wins" list with star/trend/clock icons).

**Student Courses** — deeper version of the dashboard course cards: 32px italic course name, current topic block, progress bar, three quiet buttons in a row: `Lesson plan ↗ / Past lessons / Resources`.

**Student Homework** — 4-stat row (Due / Submitted / Average score / On time), then a full table (Assignment · Course · Due · Status · Score · Submit/View action button). Same `<StatusTag>` map; an extra Score column showing `9/10` style scores in tabular numerals.

**Student Progress** — the editorial page:
- 4-stat row (Term average / Class rank / Topics mastered / Tutor sentiment).
- `row--8-4` split:
  - **Topic mastery card** — a custom `.topic-row` for each topic: 200px topic name · stacked bar showing class-average (muted background bar) overlaid with student mark (accent gradient bar) · two-column nums column showing `86% · cls 84%`. Lets you compare "you vs class" at a glance.
  - **Tutor note card** — italic 18px Cormorant quote from the tutor, then a divider and a list of past-term reports each with a small `IconDownload` PDF link.

### Parent (`pages-parent.jsx`)

**Parent Dashboard** — family-overview page that handles 1–N children gracefully:
- `<PageHead>` with two actions: `Pay $860 due` ghost (the running balance) and `Message tutor` primary.
- 4-stat row: Children enrolled / Lessons this week / Term average / Outstanding.
- **Kids cards** (`row--2` — one card per child): each card has avatar + name + year header, key-value rows for current course and next lesson, then a 2-up grid of big italic stats (Term avg / Attendance), and a status tag at the bottom showing the most recent activity (`Scored 10/10 on HW-309` etc).
- `row--8-4`: Weekly schedule card (Mon–Sun rows showing combined kid schedules, with type-coded status tags: `upcoming` for lessons, `due` for homework deadlines, `trial` for check-ins, muted `Free` for nothing-on days) + Outstanding panel (invoice tiles in `--bg-surface-2` for the 2 due, then a big primary `Pay all $860` CTA full-width and `Update payment method` quiet underneath).

**Parent Reports** — 4-stat row (Ready to read / In progress / Archived / Avg sentiment), then a toolbar with chip filter per child + `Download all` action, then a report table (Term + mono ID · Child · Tutor · Status tag · Updated time · action button: `Read` primary for ready, disabled `Pending` for draft, `Open` quiet for archived).

**Parent Billing** — the parent-side billing page (distinct from admin workspace billing):
- 4-stat row (Outstanding / This month / YTD spend / Auto-pay status).
- `row--12-5` split: invoice table (chip filter + `Pay $860` primary in the toolbar; columns are Invoice ID mono / Child / Period / Amount / Status tag / Due) + a sidebar card with `<Bars>` (last 8 months of family spend) and a faux credit-card panel for the saved payment method.

---

## Cross-role notes

### Shared component re-use

The four role files share these components via `window.RyzePages`:
- `<PageHead>` — every page uses this exact head pattern.
- `<Stat>` — the 4-up stat row appears on most pages; never write a custom version.
- `<StatusTag>` — see the full state map in the *Components* section below; every status indicator should funnel through this.
- `<Bars>` — 8-bar chart used in admin Payments and parent Billing; same component, accent-derived gradient.

In production, lift these into a small `components/dashboard/ui/` set and have every role page import from it. The current `pages.jsx` window-export is a prototype mechanism.

### Per-role action language

Same layouts, different verbs. Make sure CTAs in each role match the role's mental model:

| Role     | Header primary CTA examples         | Tone                              |
|----------|-------------------------------------|-----------------------------------|
| Admin    | `Add student`, `New invoice`, `Schedule lesson` | Ops/coordination          |
| Tutor    | `Take attendance`, `New homework`, `Mark` | Teaching action             |
| Student  | `Submit`, `Open AI tutor`, `Open lesson plan` | Self-service learning   |
| Parent   | `Pay $860 due`, `Message tutor`, `Read` (report) | Family / financial      |

### What's intentionally NOT designed yet

Follow-up pages that ship as `PlaceholderPage` in this round, by role:

- **Admin**: Calendar, Alerts, Parents, Tutors, Attendance, Homework, Progress reports, Resources, Tutor payments, Announcements, Bot health.
- **Tutor**: Calendar (Schedule), Lessons, Progress reports, Resources, My payments.
- **Student**: Calendar.
- **Parent**: Calendar (combined schedule view).

The shell, settings, and the patterns in `pages.jsx` cover these — next handoff will mock the high-value ones (Calendar in particular shows up in all four roles and deserves a unified design).

---

## Settings module

The `/dashboard/admin/settings` route is its own designed module — not a placeholder. It uses a **two-column inner layout**: a sticky 280px section navigation rail on the left and a scrollable content column on the right. The page-level head (`PageHead` with eyebrow `SYSTEM`, italic h1 "Settings", body copy, and a ghost `Restore defaults` action) sits above both columns.

Below 1100px the two columns stack — nav goes on top of content.

### Section navigation rail (`.settings-nav`)

A `<aside>` card (radius 14, `--bg-surface`, padding 14, sticky `top: calc(64px + 24px)`).

Structure:
- **Header eyebrow** `SECTIONS`
- **List** of 8 items, each with:
  - 18px icon · two-line meta (13.5/600 label + 11.5/400 muted description) · 13px right chevron
  - Hover: `--bg-hover` background
  - Active: `--accent-soft` background, label and chevron switch to `--accent`
  - Danger tone (only `Danger zone` item): label in `--danger`; hover is `--danger` mix at 10%; active is `--danger` mix at 14%.
- **Footer**: top border + a `Sign out of this device` quiet-button stretched full width with a logout icon

### The 8 sections, in order

| Key            | Label             | Icon (lucide map)      | Sub                              |
|----------------|-------------------|------------------------|----------------------------------|
| appearance     | Appearance        | `Sparkles` or `Palette`| Theme, type, density             |
| profile        | Profile           | `User`                 | Name, email, timezone            |
| notifications  | Notifications     | `Bell`                 | Email, SMS, Discord              |
| security       | Security          | `ShieldCheck`          | Password, 2FA, sessions          |
| integrations   | Integrations      | `Activity` / `Plug`    | Discord, Xero, Calendar          |
| team           | Team & roles      | `Users`                | Admins, tutors, parents          |
| billing        | Billing           | `CreditCard`           | Plan, seats, invoices            |
| danger         | Danger zone       | `AlertTriangle`        | Export, archive, delete          |

### Section shell

Each section renders inside a `<SectionShell>` wrapper:

- 34px italic Cormorant title (`.s-section__title`)
- 13.5px muted body copy underneath (max 64ch, line-height 1.55)
- Optional right-aligned action button in the head row (used by *Team & roles* for `Invite teammate`)
- Stack of `<s-card>` panels with `--gap-md` between them

### `<s-card>` — settings card

Like `.card` but with horizontal padding `0 24px` and an integrated row separator system. Rows inside an `<s-card>` use `<Row>` (`.s-row`):

- Grid: 280px label column · 32px gap · 1fr control column
- Padding `18px 0`, bottom border on all rows except the last
- Label column: 13.5/600 strong text + 12.5px muted hint (max 38ch, line-height 1.5)
- Control column: `display: flex` with 10px gap, wraps as needed
- Below 800px: stacks single-column

For wider controls (font picker, integration cards, full tables), use `<s-card s-card--flush>` to strip horizontal padding.

### Form primitives (built in `settings.jsx`)

#### `<Segment>` — segmented radio control

Pill of buttons (radius 9, `--bg-surface-2` track, 3px inner padding). Each `.seg__btn` is 6×14 padding, 12.5/600 muted text. Active button: `--bg-surface` fill, `--fg-strong` text, soft 1px/2px black drop shadow.

Used for: Theme (Dark/Light), Sidebar (Expanded/Icon rail), Density (Airy/Balanced/Dense), Time format (12h/24h), Daily digest (Daily/Weekly/Off).

#### `<Toggle>` — accent-coloured switch

- 36×20 pill track, 14×14 thumb, 2px inset
- Off: `--bg-surface-2` track, `--border-soft` border, `--fg-muted` thumb
- On: `--accent` track + border, `--accent-fg` thumb, thumb `translateX(16px)`
- 160ms ease transition on both background and transform

Used for: Reduce motion, High contrast, Tabular numerals, SSO, every Notifications row × channel toggle.

#### `<Field>` — text input

- 38px tall, `--bg-surface-2` fill, `--border-soft` border, radius 9, padding 0 12
- 13px sans body text; pass `mono` to switch to 12.5px JetBrains Mono (for phone, ABN, times)
- Optional `prefix` / `suffix` slot for inline icons (e.g. mail glyph in front of the email field)
- `:focus-within` → accent-tinted border at 48% mix

#### `<Select>` — same shell as `<Field>`, with appearance-stripped native `<select>` and a 2-triangle CSS chevron painted via `background-image` at the right edge.

#### `<Swatches>` — accent picker

Horizontal flex-wrap of pill chips. Each chip: `.swatch` is `padding 8px 14px 8px 8px`, radius 999, `--bg-surface-2` bg, `--border-soft` border. Contents: 22×22 circular `.swatch__chip` painted with the hex + 1px white-18% inner ring + 1px black-18% inset shadow, then 12.5/600 label. Active swatch: `--accent-soft` background, accent-tinted border, label in `--accent`.

Ship 4 options: Ryze gold `#b8841e`, Sage `#1f8a5b`, Cobalt `#2a6fdb`, Claret `#8b3a3a`.

#### `<FontPicker>` — visual radio cards

3-column grid (`grid-template-columns: repeat(3, minmax(0, 1fr))`, gap 12, max-width 560px). Each card is a button (`padding: 18px 14px 14px`, radius 12, `--bg-surface-2` bg, `--border-soft` border) that holds:
- 38px sample glyph ("Aa") rendered in the option's font (italic Cormorant / Instrument Serif / Geist)
- 13/600 name
- 11.5px JetBrains Mono caption (e.g. "Cormorant + Manrope")

Active card: accent-tinted border + `--accent-soft-2` background + name in `--accent`. Hover: `translateY(-1px)` + strong border.

### Section-specific layouts

#### Appearance

Two `<s-card>` stacks:

**Theme & type card** — five rows in order:
1. Theme — `<Segment>` Dark / Light
2. Accent colour — `<Swatches>`
3. Sidebar — `<Segment>` Expanded / Icon rail
4. Density — `<Segment>` Airy / Balanced / Dense
5. Type pairing — `<FontPicker>`

**Motion & accessibility card** — header ("Motion & accessibility" / sub copy), then three `<Toggle>` rows: Reduce motion, High contrast, Tabular numerals everywhere.

**Live-wired behaviour**: changing any control in this section immediately updates the rest of the portal (the preferences state is the source of truth). In production: persist user preferences to the auth user record (or localStorage if anonymous) and apply on app boot.

#### Profile

Single `<s-card>` with rows: profile photo (avatar 60×60 + Upload/Remove buttons), display name, email (with mail-glyph prefix), phone (mono with phone-glyph prefix), timezone select (Australia/Sydney default + Brisbane/Perth/Auckland options), time format `<Segment>` 12h/24h.

Followed by a `<SaveBar>` (sticky-to-bottom strip with accent-tinted background) that surfaces a standard discard/save pair. The save bar appears only when there are unsaved edits — track this with a dirty-state hook.

#### Notifications

Two cards:

**Schedule card** — Daily digest `<Segment>` (Daily/Weekly/Off), Quiet hours (two mono `<Field>`s separated by "to").

**Per-event channel matrix** (flush card) — grid `1fr 100px 100px 100px`:

| Event                    | Email | In-app | SMS |
|--------------------------|-------|--------|-----|
| New student enrolled     | ●     | ●      | ○   |
| Payment received         | ●     | ●      | ○   |
| Payment overdue          | ●     | ●      | ●   |
| Student missed lesson    | ●     | ●      | ○   |
| Progress report due      | ●     | ●      | ○   |
| Discord bot offline      | ●     | ●      | ●   |

Each row: event name strong + muted hint underneath, then 3 centered `<Toggle>`s. Below 900px: shrink channel columns to 60px.

Below the matrix: a `<SaveBar>`.

#### Security

**First card** — rows: Password (Change button), Two-factor (showing active state pill + Manage), Recovery codes (Download), SSO `<Toggle>`.

**Second card (flush)** — "Active sessions" with a 4-row session list. Each row: device + location + time meta ("Active now" / relative timestamps in mono), the current device tagged with a `tag tag--accent` `This device` pill. Non-current sessions get a `Sign out` quiet button right-aligned. Card head has a `Sign out all` quiet action.

#### Integrations

6-card responsive grid (`grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))`):

| Service          | Brand colour | Default state    |
|------------------|--------------|------------------|
| Discord          | `#5865F2`    | Connected        |
| Xero             | `#13b5ea`    | Connected        |
| Google Calendar  | `#4285F4`    | Connected        |
| Stripe           | `#635bff`    | Connected        |
| Slack            | `#611f69`    | Not connected    |
| Sentry           | `#362d59`    | Not connected    |

Each card (radius 14, padding 18): logo tile (36×36 radius 9, brand colour at 22% alpha background + brand colour text, italic Cormorant first letter) and status tag on header; service name 15/600; 12.5px description; mono meta footer; action row (Configure↗ + Disconnect for connected, Connect→ for disconnected). Connected cards get an accent-tinted border at 22% mix.

In the real implementation: wire each Connect button to its OAuth flow; Configure deep-links to the service's settings page inside Ryze.

#### Team & roles

Two cards:

**Members card** (flush, with `Invite teammate` primary action in the SectionShell head) — toolbar (search + chips: All/Admin/Finance/Tutor/Invited), then a member table (avatar + name/email · role tag · last seen · more menu). Role tag colour map: Admin → accent, Finance → info, Tutor → ok, Invited → warn.

**Role permissions card** — 4-card grid (`auto-fill, minmax(220px, 1fr)`) of role summary tiles. Each tile has italic Cormorant 22px role name + 12.5px description of what that role can do. Card head includes a `View matrix ↗` quiet button for the full perms matrix.

#### Billing

Two rows:

**Top row** (`grid-template-columns: 1.25fr 1fr`):
- **Plan card** — accent-tinted gradient background (`linear-gradient(135deg, color-mix(in oklab, var(--accent) 8%, var(--bg-surface)), var(--bg-surface))`), 28×24 padding, accent eyebrow `CURRENT PLAN`, italic Cormorant 42px plan name ("Studio Pro"), `$240 / month · AUD` price, renewal date, seat allocation panel (admin / tutor / active students with current vs cap), `Manage plan` (primary) + `Compare plans` (ghost) buttons.
- **Payment method card** — title + sub, then a faux credit-card panel (`linear-gradient(135deg, #0d1119, #1a2030)`, padding 22, radius 12, white text): brand "Visa" in italic Cormorant, masked card number in mono, expiry, with a `Change` quiet button top-right. Followed by Billing email and GST/ABN rows.

**Invoice history card** (flush) — header with `Download all` quiet, then a 4-row invoice table (mono ID, date, amount, Paid status tag, per-row download icon).

#### Danger zone

Three `<danger-row>` panels — each is a full-width card with body + action on the right:
- **Export workspace data** (non-destructive, ghost button `Request export`)
- **Archive workspace** (non-destructive, ghost button)
- **Delete workspace** (**destructive** — gets `is-destructive` class: 38% danger-tinted border, 5% danger-tinted background, `btn--danger` red action button)

In production: every destructive action should open a typed-confirmation modal ("Type the workspace name to confirm") before the API call fires.

### Tying Appearance → user preferences

In the prototype, Appearance changes mutate an in-memory tweaks object. In production:

1. Add a `UserPreferences` record (or extend the existing user record) with fields: `theme`, `accent`, `sidebar`, `density`, `font`, `reduce_motion`, `high_contrast`, `tabular_nums`.
2. On login, hydrate these into a `<PreferencesContext>` that wraps the dashboard tree and applies them by setting matching `data-*` attributes on `<body>` plus `--accent` overrides on `:root`.
3. Each form control PATCHes `/api/me/preferences` on change. Optimistic update first, revert on error.
4. Anonymous (logged-out) users get the same controls backed by `localStorage`.

Use the same `applyAccent(hex)` helper from `dashboard/app.jsx` (it sets `--accent` plus the derived `--accent-soft`, `--accent-soft-2`, `--accent-fg`, `--accent-ink` from a single hex input).

---

## Components

### `<Button>`

```
.btn                height: 38px, padding: 0 14px, radius: 9px, font: 13/600
.btn--primary       fill: --accent, fg: --accent-fg, accent-tinted lift shadow
.btn--ghost         fill: --bg-surface, fg: --fg-default, border: --border-soft
.btn--quiet         transparent, fg: --fg-muted; hover → --fg-strong + --bg-hover
.btn:hover          transform: translateY(-1px)
```

All buttons may have a leading icon (14px stroke) followed by an 8px gap and label.

### `<Tag>` / `StatusTag`

Mapping from state → tag variant (see `pages.jsx`):

| State key   | Variant         | Label        |
|-------------|-----------------|--------------|
| active      | tag--ok         | Active       |
| trial       | tag--info       | Trial        |
| paused      | tag             | Paused       |
| at-risk     | tag--warn       | At risk      |
| running     | tag--ok         | Running      |
| low-seat    | tag--warn       | Low seats    |
| live        | tag--accent     | Live now     |
| upcoming    | tag--info       | Upcoming     |
| done        | tag             | Done         |
| due         | tag--warn       | Due          |
| overdue     | tag--danger     | Overdue      |
| paid        | tag--ok         | Paid         |
| high        | tag--danger     | High         |
| med         | tag--warn       | Medium       |
| low         | tag--info       | Low          |

### `<Stat>` tile

```
border 1 + radius 14 + min-height 134, padding 18 20, flex-column gap 14
label   12/600 uppercase tracking 0.04em --fg-muted
value   Cormorant italic 500 / 44px --fg-strong .tnum
foot    delta (left, semantic colour with trend icon) · right meta
```

### `<Card>` and `<Card flush>`

Standard card: padding `--card-pad`. Flush variant strips padding and uses `card__head` (16/22 padding, bottom border) + body region.

### `<Toolbar>`

Used above tables and lists: `padding: 14px 22px`, bottom border, gap 10, wraps on narrow. Holds `.toolbar__search` (flex-1), chip filters (`.toolbar__chip` + `.is-active`), and trailing `btn--ghost` / `btn--quiet`.

### Avatars

- **Brand mark**: 32×32 radius 9, gold fill, Cormorant italic "R" 22px in `--accent-ink`.
- **User avatars**: circular, `linear-gradient(135deg, var(--accent), color-mix(in oklab, var(--accent) 60%, #5b3d10))`, 13/700 initials in `--accent-ink`.
- **Table-cell avatars**: 34×34, swatch background (gold / blue / green / purple / rose — see Students), 12.5/700 initials matching swatch fg.

### Icons

Stroke-based, 24×24 viewBox, `stroke: currentColor`, `strokeLinecap: round`, `strokeLinejoin: round`. Default `strokeWidth: 1.6` (1.9 when active in nav). Default size: 18px (14–15 in buttons, 17 in nav, 13 in tags).

**Replace `icons.jsx` with [`lucide-react`](https://lucide.dev/icons/) in the target codebase.** Map:

| Prototype | lucide-react       |
|-----------|--------------------|
| IconHome  | `LayoutDashboard`  |
| IconCalendar | `CalendarDays`  |
| IconBell  | `Bell`             |
| IconUsers | `Users`            |
| IconParent| `User` / `Home`    |
| IconTutor | `GraduationCap`    |
| IconBookOpen | `BookOpen`      |
| IconLessons | `CalendarRange`  |
| IconCheck | `ClipboardCheck`   |
| IconClipboard | `ClipboardList`|
| IconPen   | `PenLine`          |
| IconFolder| `FolderOpen`       |
| IconCard  | `CreditCard`       |
| IconDollar| `DollarSign`       |
| IconShield| `ShieldAlert`      |
| IconMegaphone | `Megaphone`    |
| IconActivity | `Activity`      |
| IconSettings | `Settings`      |
| IconLogout | `LogOut`          |
| IconSearch | `Search`          |
| IconChevronRight / IconChevronDown | `ChevronRight` / `ChevronDown` |
| IconArrowUpRight / IconArrowRight | `ArrowUpRight` / `ArrowRight` |
| IconPlus  | `Plus`             |
| IconFilter| `Filter`           |
| IconSort  | `ArrowUpDown`      |
| IconDownload | `Download`      |
| IconRefresh | `RefreshCw`      |
| IconMore  | `MoreHorizontal`   |
| IconClock | `Clock`            |
| IconMail / IconPhone | `Mail` / `Phone` |
| IconTrend | `TrendingUp`       |
| IconWarn  | `AlertTriangle`    |

---

## Navigation structure

The current sidebar in the repo has **22 ungrouped items** for admin. The redesign cuts admin to **17 items in 5 groups** and gives each non-admin role its own smaller, focused nav. All four are defined in `dashboard/shell.jsx` under `NAV.admin / NAV.tutor / NAV.student / NAV.parent`.

### Admin (17 items · 5 groups)

```
TODAY
  Overview         /dashboard/admin
  Calendar         /dashboard/admin/calendar
  Alerts           /dashboard/admin/alerts        (badge: open count)

PEOPLE
  Students         /dashboard/admin/students
  Parents          /dashboard/admin/parents
  Tutors           /dashboard/admin/tutors

TEACHING
  Classes          /dashboard/admin/classes
  Lessons          /dashboard/admin/lessons
  Attendance       /dashboard/admin/attendance
  Homework         /dashboard/admin/homework
  Progress reports /dashboard/admin/progress-reports
  Resources        /dashboard/admin/resources

FINANCE
  Payments         /dashboard/admin/payments
  Tutor payments   /dashboard/admin/tutor-payments

SYSTEM
  Announcements    /dashboard/admin/announcements
  Bot health       /dashboard/admin/bot-health
  Settings         /dashboard/admin/settings
```

### Tutor (10 items · 3 groups)

```
TODAY
  Dashboard        /dashboard/overview
  Schedule         /dashboard/calendar

CLASSES
  Classes          /dashboard/classes
  Lessons          /dashboard/lessons
  Attendance       /dashboard/attendance
  Homework         /dashboard/homework
  Reports          /dashboard/reports
  Resources        /dashboard/resources

ACCOUNT
  My payments      /dashboard/tutor-pay
  Settings         /dashboard/settings
```

### Student (6 items · 2 groups)

```
LEARNING
  Dashboard        /dashboard/overview
  Courses          /dashboard/courses
  Homework         /dashboard/homework
  Calendar         /dashboard/calendar
  Progress         /dashboard/reports

ACCOUNT
  Settings         /dashboard/settings
```

### Parent (5 items · 2 groups)

```
FAMILY
  Dashboard        /dashboard/overview
  Schedule         /dashboard/calendar
  Reports          /dashboard/reports
  Billing          /dashboard/payments

ACCOUNT
  Settings         /dashboard/settings
```

Tutor / Student / Parent share many path slugs with admin but resolve to different page components (e.g. `/dashboard/overview` renders `<StudentDashboard>` for students, `<TutorOverview>` for tutors, `<AdminOverview>` for admins). In React Router this is typically handled by mounting a role-scoped layout, or by branching inside the route component based on `useAuth().user.role`.

`Reminder logs` from the current admin nav is removed at the top level (rolled into `Bot health` detail). If that needs to stay surfaceable, re-add under SYSTEM.

---

## Behavior & interactions

- **Nav click**: route push (`useNavigate` from react-router-dom — already wired). Active state is computed by matching `location.pathname` to the item's full path; `overview` matches only the exact `/dashboard/admin`, all others match exact-or-prefix (so `/dashboard/admin/students/123` keeps Students highlighted).
- **Sidebar collapse** (rail mode): swap to `72px` width, hide labels and group headers, swap brand to mark-only, swap user card to avatar-only, swap nav badges to a 6px red dot top-right. Tooltips on hover (already there in the existing repo's Sidebar — keep that pattern).
- **Topbar search**: ⌘K-bound (open a command palette overlay). Below 900px collapse to icon-only.
- **Live indicator pulse** on Live lesson blocks: 2.4s infinite, ring expands `0 → 8px` then fades.
- **Stat tile hover**: border lifts to `--border-strong`, no transform.
- **Card / button hover**: `transform: translateY(-1px)`, transition 140ms ease.
- **Empty state for not-yet-built modules**: render `<PlaceholderPage>` with section eyebrow `Coming up` and the module's display name.

---

## Implementation notes for Claude Code

1. **Tokens**: extend `index.css` / Tailwind config with the new tokens listed under *Design tokens* above. Map them to Tailwind via CSS variables — same pattern as the existing `--ryze-*` tokens in `DESIGN_SYSTEM.md`. Add a `--ryze-` prefix if it helps the lint rule, otherwise the new tokens can keep their `--bg-*` / `--fg-*` / `--accent-*` shape since they're scoped to the dashboard.

2. **Layout shell**: replace `components/dashboard/DashboardLayout.tsx` + `Sidebar.tsx` with the new structure described above. Keep the existing `useAuth`, `useNavigate`, `useLocation`, mobile media-query, and logout-handler logic; only the visual structure changes.

3. **Per-page components**:
   - `pages/dashboard/admin/AdminOverview.tsx` → rebuild against the layout in §1 *Overview*. The existing `adminApi.getOverviewStats()` shape already provides the data you need (`total_students`, `active_classes`, `today_lessons`, `open_alerts`, `pending_payments`, `missing_reports`, `today_lesson_list`, `recent_alerts`).
   - `pages/dashboard/admin/StudentsPage.tsx` → new toolbar + table layout (§2). The data table likely already exists in `components/dashboard/ui/DataTable.tsx` — adapt the renderer to match the new row/cell design or swap in fresh markup.
   - `pages/dashboard/admin/ClassesPage.tsx` → grid of class cards (§3).
   - `pages/dashboard/admin/LessonsPage.tsx` → studio-lane schedule (§4). Block positioning is straightforward absolute math (`left = (startHour - 9) * 88px`).
   - `pages/dashboard/admin/PaymentsPage.tsx` → table + chart panel (§5). Use a real chart lib (recharts / visx) for the bar series; the prototype hand-rolls SVG-less divs.

4. **Don't port**: `tweaks-panel.jsx`, `dashboard/app.jsx`. The `applyAccent()` helper inside `app.jsx` is useful as a reference implementation — lift its body into a real `PreferencesContext` rather than porting `app.jsx` itself.

5. **Fonts**: add Cormorant Garamond + Manrope + JetBrains Mono to `index.html` (or the existing font loader). Use `font-feature-settings: "tnum" 1` for all numeric cells.

6. **Lint rule**: the existing `npm run lint:colours` blocks raw `text-gray-*` / `bg-slate-*` utilities. Either thread the new tokens through the lint allowlist, or add them to `--ryze-*` namespace so they pass automatically.

7. **Routing**: routes already exist in `App.tsx`. Just rebuild the page components — the route tree stays.

---

## Open follow-ups (deliberately not in this handoff)

- **Calendar pages** — a unified calendar view shared across all four roles is the highest-value next mock. Placeholders currently render for every role's Calendar route.
- **Long-tail admin pages**: Alerts, Parents, Tutors, Attendance, Homework, Progress reports, Resources, Tutor payments, Announcements, Bot health.
- **Long-tail tutor pages**: Lessons (teaching detail), Progress reports, Resources, My payments.
- **Long-tail student pages**: Calendar.
- **Long-tail parent pages**: Calendar / combined schedule.
- **Mobile (`<768px`) layout** — basic responsive handling exists in `theme.css` media queries, but a dedicated mobile pass for each role is its own piece of work.
- **Light theme refinement** — works, but the marketing-site warm-white surface needs more contrast tuning before production.
- **Empty / loading / error states** — the existing `components/dashboard/ui/EmptyState.tsx`, `LoadingState.tsx`, `ErrorState.tsx` should be restyled to match the new aesthetic; spec lives in the prototype's `.empty` block.
- **Command palette (⌘K)** — implied by the topbar search but not designed in this round.
- **Mobile (`<768px`) layout** — basic responsive handling exists in `theme.css` media queries, but a dedicated mobile portal needs its own pass.
- **Light theme refinement** — works, but the marketing-site warm-white surface needs more contrast tuning before production.
- **Empty / loading / error states** — the existing `components/dashboard/ui/EmptyState.tsx`, `LoadingState.tsx`, `ErrorState.tsx` should be restyled to match the new aesthetic; spec lives in the prototype's `.empty` block.
- **Command palette (⌘K)** — implied by the topbar search but not designed in this round.

---

## Source files

- **`Dashboard.html`** — prototype entry. Open in a browser to interact.
- **`dashboard/theme.css`** — every token + component CSS. Source of truth for values.
- **`dashboard/shell.jsx`** — `Sidebar`, `Topbar`, and the role-aware `NAV` structure (`NAV.admin / NAV.tutor / NAV.student / NAV.parent`).
- **`dashboard/pages.jsx`** — Admin pages (`OverviewPage`, `StudentsPage`, `ClassesPage`, `LessonsPage`, `PaymentsPage`, `PlaceholderPage`) **plus the shared building blocks** (`PageHead`, `Stat`, `StatusTag`, `Bars`) that the other role files re-import.
- **`dashboard/pages-tutor.jsx`** — `TutorOverview`, `TutorClasses`, `TutorAttendance`, `TutorHomework`.
- **`dashboard/pages-student.jsx`** — `StudentDashboard`, `StudentCourses`, `StudentHomework`, `StudentProgress`.
- **`dashboard/pages-parent.jsx`** — `ParentDashboard`, `ParentReports`, `ParentBilling`.
- **`dashboard/settings.jsx`** — `SettingsPage` + every section component + the form primitives.
- **`dashboard/icons.jsx`** — stroke icons (replace with lucide-react).
- **`dashboard/app.jsx`** — wiring for the prototype; ignore in production.
- **`dashboard/tweaks-panel.jsx`** — design-review tool; ignore in production.
