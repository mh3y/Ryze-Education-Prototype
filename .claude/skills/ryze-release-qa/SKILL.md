---
name: ryze-release-qa
description: Use for Ryze release validation, pre-merge checks, pre-deploy verification, PR review, and production readiness. Triggers on: PR merge, deploy, release, QA check, push to main, Vercel Preview validation, production readiness, pre-commit review.
---

## Purpose
Run a structured release check before merging or deploying any Ryze change. Prevents public website regressions, CRM breaks, tracking loss, and auth failures from reaching production.

Use the built-in `/code-review` skill first for diff-level code analysis. This skill adds Ryze-specific gate checks on top.

---

## Step 1 — Map what changed

Run `git diff main...HEAD --stat` (or the relevant base branch). Categorise each changed file:

| Category | Files | Risk level |
|----------|-------|-----------|
| Public pages | `pages/*.tsx`, `components/Navbar.tsx`, `components/Footer.tsx` | High if marketing page |
| Admin CRM | `pages/dashboard/admin/*.tsx` | Medium |
| Routing / auth | `App.tsx`, `contexts/AuthContext.tsx`, `services/auth.ts` | Critical |
| Backend API | `server/src/routes/**` | High |
| Schema | `server/prisma/schema.prisma` | Critical |
| Tracking | `index.html`, analytics scripts | Critical |
| Shared UI | `components/dashboard/ui/**` | Medium — used across all admin pages |
| Infrastructure | `vercel.json`, `nginx.conf`, `render.yaml` | Critical |

---

## Step 2 — Run checks in this order

```bash
# Frontend typecheck (NOT npm run build — Vite does not typecheck)
npx tsc

# Backend typecheck + compile
cd server && npm run build && cd ..

# Design token enforcement — no raw Tailwind colours
npm run lint:colours

# Frontend bundle — catches import errors and missing exports
npm run build
```

Report the result of each. **If any fail, stop. Fix before continuing.**

---

## Step 3 — Route safety audit

**For public pages changed:**
- [ ] Route still renders (no blank screen)
- [ ] Navbar and Footer still present
- [ ] Lead form (if present) still POSTs to `/api/leads` with UTM params
- [ ] CTA links are intact and correct
- [ ] Mobile layout is usable at 390px width

**For admin/CRM pages changed:**
- [ ] `AdminGuard` is still in place for the route in `App.tsx`
- [ ] Page has all three states: loading / empty / error
- [ ] `DashboardErrorBoundary` is not bypassed
- [ ] Non-admin users cannot access admin data

**For auth changes (`App.tsx`, `AuthContext.tsx`, `services/auth.ts`):**
- [ ] Discord OAuth flow still works
- [ ] Parent email/password login still works
- [ ] Token refresh on 401 still works
- [ ] Role-based redirects still correct

---

## Step 4 — Tracking integrity (if `index.html` or analytics code changed)

- [ ] GTM `<script>` still present in `<head>`, loads first
- [ ] Meta Pixel still present, not duplicated
- [ ] No third-party script has been added that loads synchronously before GTM
- [ ] Lead form still captures `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`
- [ ] `VITE_ENABLE_DASHBOARD` feature gate has not been removed from dashboard routes

---

## Step 5 — Schema safety (if `schema.prisma` changed)

- [ ] No column drops or renames on populated tables (unless explicitly requested)
- [ ] New required fields have defaults (or the table is empty)
- [ ] Confirm `prisma db push --accept-data-loss` is the deploy command — no migration files needed
- [ ] Note: schema changes auto-apply on next Render deploy automatically

---

## Step 6 — Merge recommendation

Produce one of:

**✅ Safe to merge** — all checks pass, no regressions found.

**⚠️ Safe with caveats** — checks pass but note specific items to verify after deploy (e.g. "confirm GTM fires on Preview URL", "check lead form on mobile").

**❌ Not safe** — specific issue(s) that must be resolved. List each blocker with the fix required.
