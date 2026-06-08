# Ryze Education — Project Context

## Business priority
HSC maths tutoring company, Sydney AU. The codebase serves two functions:
- **Public website** — lead acquisition via paid ads (Google/Meta), program pages, contact form
- **Private CRM/LMS** — operations: students, tutors, parents, classes, lessons, attendance, payments

The primary business goal is client acquisition. Mobile performance and conversion rate on public pages are the top technical priority. Avoid purely aesthetic changes that do not support conversion.

## System architecture

**Three repos. This is repo 1.**

| Repo | Stack | Deployed at |
|------|-------|------------|
| `Ryze-Education-Prototype` (this repo) | React/Vite frontend + Node/Express/Prisma backend (`/server`) | Frontend → Vercel (main = prod). Backend → Render (free tier, `ryze-portal-api`, Oregon) |
| `ryze-discord-bot` | Python discord.py + FastAPI | VPS `159.13.52.6` via Docker Compose (5 services) |
| `Ryze-AI` | React + Gemini | Not deployed — exploratory only |

**Traffic flow:** `ryzeeducation.com.au` → Vercel (React SPA) → `/api/*` proxied to `ryze-portal-api.onrender.com`

**Database:** Supabase PostgreSQL, `ap-southeast-2` Sydney. Two connection strings: pooled (`DATABASE_URL`) and direct (`DATABASE_DIRECT_URL`).

**Render deploy command:** `npx prisma db push --accept-data-loss && node dist/index.js` — schema auto-applies on every deploy. No migration files. No manual migration step.

**Dashboard gate:** `VITE_ENABLE_DASHBOARD=true` must be set for `/dashboard/*` routes to activate. Public website works without it.

## Commands (verified against actual package.json and tsconfig)

**Frontend (repo root):**
```
npm run dev               # Vite dev server, port 3000
npx tsc                   # TypeScript typecheck — USE THIS, NOT npm run build
                          # (Vite/esbuild strips types without checking — npm run build is NOT a typecheck)
npm run build             # Production bundle (no typecheck)
npm run lint:colours      # Enforce design token usage — no raw Tailwind colours
```

**Backend (`server/` directory):**
```
npm run dev               # ts-node-dev with hot reload
npm run build             # tsc compile = typecheck + emit (correct check for backend)
npm run db:push           # prisma db push to Supabase (safe, non-destructive)
npm run db:studio         # Prisma Studio
```

## Skills & Subagent Usage Protocol

### Mandatory preflight (every non-trivial task)

Before starting any non-trivial task, output a preflight block:

```
PREFLIGHT
skill:      <skill name or "none">
subagents:  <agent names or "none">
safe-reads: <files you will read>
mutations:  <files / DB records you will write — "none" if read-only>
dry-run:    <yes / no / n/a>
```

Then invoke the matching skill or agent before doing any work.

### Skill routing

| Trigger keywords | Skill |
|-----------------|-------|
| PR, merge, deploy, release, regression check, QA, build safety, safe to merge, production readiness | `ryze-release-qa` |
| PageSpeed, PSI, LCP, FCP, Cloudinary, hero image, Google Fonts, GTM/Meta deferral, mobile landing page speed, Core Web Vitals | `ryze-performance-pass` |
| New admin page, CRM feature, API endpoint, Prisma model, students/tutors/parents/classes/lessons/payments/homework/reports/leads/messages/alerts/resources/audit log, role-gated portal feature | `ryze-crm-feature-implementation` |
| Attendance missing, Discord voice, bot sync, VoiceAttendance, lesson matching, Calendar sync, attendanceEngine.ts, late/partial/left_early status, backfill | `ryze-attendance-pipeline-triage` |

Do **not** invoke a skill for: simple copy/text changes, single-file obvious fixes, CSS variable tweaks, or renaming a label.

### Subagent routing

Subagents live in `.claude/agents/`. Use them for:

- `ryze-attendance-debugger` — multi-layer pipeline trace (Discord → VPS → Render → Supabase) for a single missing attendance
- `ryze-performance-auditor` — PSI + Lighthouse pass + bundle analysis on public pages

### Ryze high-risk operation checklist

Before **any** production data mutation:
- [ ] Read the current state first (dry-run or inspect script)
- [ ] Document before/after values in the session
- [ ] Prefer Prisma ORM over raw SQL
- [ ] Never delete records — archive/deactivate only
- [ ] Never mutate `VoiceAttendance` rows
- [ ] Never auto-enrol from Discord voice activity
- [ ] Never enrol a substitute tutor as a student

### Final report format (multi-part tasks)

End every multi-part task with a report block:

```
FINAL REPORT
Parts completed:   <list with ✅/⚠️/❌>
Mutations applied: <table: what, before, after>
PRs opened/merged: <list>
Owner decisions pending: <list or "none">
Known remaining risks: <list or "none">
```

### PR checklist (before merge)

- [ ] `npx tsc` passes (frontend) or `npm run build` passes (backend)
- [ ] `npm run lint:colours` passes (if UI changed)
- [ ] No raw `.env` values or secrets in diff
- [ ] Audit log entries added for any new CRM mutations
- [ ] No `prisma migrate reset` or destructive DB changes
- [ ] Vercel Preview validated before merging to `main`

## Non-negotiable rules

1. **Never use raw Tailwind colour utilities** (`text-slate-*`, `bg-gray-*`, `text-yellow-*`, etc.) where semantic CSS tokens exist. Run `npm run lint:colours` to verify.
2. **Never commit `.env` files.** `server/.env` is gitignored. Bot credentials (DISCORD_TOKEN, GOOGLE_REFRESH_TOKEN, GOOGLE_CLIENT_SECRET, DISCORD_CLIENT_SECRET, BOT_API_SECRET, DASHBOARD_API_KEY) are never committed or read aloud.
3. **Never expose dashboard routes** on a deployment where `VITE_ENABLE_DASHBOARD` is not set.
4. **Never remove or reorder GTM / Meta Pixel scripts** without explicit confirmation — these are conversion-critical. Never initialise either twice.
5. **Never run `prisma migrate reset`** or any destructive DB operation without explicit user instruction.
6. **Never force-push to `main`.** The safety hook will block it.
7. **Never deploy to production without Vercel Preview validation first.**
8. **`npm run build` is NOT a typecheck for the frontend.** Use `npx tsc`.
9. **All admin CRM mutations require audit log entries.** Check existing patterns before adding new routes.
10. **Prefer editing existing shared components** over creating parallel implementations.

## Danger zones — verify before touching

| File / Area | Why dangerous |
|-------------|--------------|
| `pages/HscMathsTutoring.tsx` | Primary Google Ads landing page — any regression has direct revenue impact |
| `index.html` | GTM + Meta Pixel placement; load order is deliberate and conversion-critical |
| `App.tsx` | All routing, auth guards (`AdminGuard`, `ProtectedRoute`), error boundaries, lazy loading |
| `server/src/services/attendanceEngine.ts` | Pure business logic — thresholds affect all attendance records |
| `server/src/routes/bot.ts` | The only write path from Discord bot to CRM; breaking it loses all voice attendance |
| `server/prisma/schema.prisma` | No migrations directory — `db push` on deploy; schema changes are irreversible on Render |
| `vercel.json` | SPA rewrite + API proxy + legacy redirects; one bad line takes the site down |
| `contexts/AuthContext.tsx` | JWT cookie handling, token refresh, role resolution for all three auth paths |
| `services/auth.ts` (`portalFetch`) | All authenticated API calls route through here; a bug here breaks the entire CRM |
| `nginx.conf` | VPS traffic routing — only touch if working on bot/VPS deployment |

## Auth and role model

**Four roles:** `admin`, `tutor`, `student`, `parent`

- Admin/tutor/student: Discord OAuth2 → httpOnly JWT cookie (`ryze_token`)
- Parent: email + password, OR invite link (`/auth/invite?token=...`) for first login → httpOnly JWT
- `AdminGuard` in `App.tsx` restricts `/dashboard/admin/*` to `admin` role only
- `RoleSwitch` component renders different pages at shared routes based on role
- `ProtectedRoute` redirects unauthenticated users to `/login`

## Design system

- **Gold accent:** `#B8841E` — CTAs and active states only (used sparingly)
- **Dark bg (dashboard/auth):** `#0D0D0D` with `#050510` starfield
- **Light bg (marketing):** `#fdfbf7` warm white, `#f8f3ea` secondary
- **All colours** via CSS custom properties (`var(--ryze-accent)`, `var(--text)`, `var(--border)`, etc.) — not raw Tailwind
- Design token reference: `DESIGN_SYSTEM.md` in repo root
