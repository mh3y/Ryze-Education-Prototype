# Ryze Education CRM — Functional Audit
**Date:** 2026-05-22  
**Status:** Stabilisation Phase — diagnosing before fixing

---

## 🔴 ROOT CAUSE SUMMARY (read this first)

### Bug #1 — CRITICAL: Admin user shows as Student
**Where:** `server/src/routes/auth.ts` line 132  
**Code:** `role: 'student'` — hardcoded on every new Discord login  
**Effect:** When you log in via Discord and there is no existing DB record matching your `discord_user_id`, a new `User` row is created with `role: 'student'`. The seed script creates an admin user but does **not** set `discord_user_id`, so there is no row to find — you always get a brand-new student record.  
**Fix required:** Seed the admin user with your real Discord user ID, **and** add `ADMIN_DISCORD_IDS` env var so the auth callback grants `admin` role to known Discord IDs instead of always defaulting to `student`.

---

### Bug #2 — CRITICAL: All dashboard API calls fail in production
**Where:** `services/adminApi.ts` line 11 / `services/auth.ts` line 28  
**Code:** `const BASE_URL = import.meta.env.VITE_PORTAL_API_URL ?? ''`  
**Effect:** `VITE_PORTAL_API_URL` is **not set** in Vercel's environment variables (the frontend `.env` only has `VITE_ENABLE_DASHBOARD=true`). At build time Vite replaces the variable with `''`. All API calls then resolve to `https://ryzeeducation.com.au/api/admin/...` — which hits Vercel's static file server, not the Render backend. Vercel returns HTML (or a 404), the JSON parse fails, and every card stays on its loading spinner forever.  
**Fix required:** Add `VITE_PORTAL_API_URL=https://ryze-portal-api.onrender.com` to Vercel project environment variables and redeploy. This is the single highest-priority fix — nothing else works until this is done.

---

### Bug #3 — Seed data is too sparse
**Where:** `server/src/seed.ts`  
**Effect:** 1 admin (no Discord ID), 1 tutor, 3 students, 1 class, 1 lesson, 1 payment, 1 parent. No attendance records, no homework, no announcements, no alerts, no resources, no tutor payments. Dashboard shows empty states even when API calls work.  
**Fix required:** Replace seed with comprehensive realistic data (see Phase 5).

---

### Bug #4 — `DISCORD_REDIRECT_URI` in server `.env` points to localhost
**Where:** `server/.env`  
**Value:** `DISCORD_REDIRECT_URI=http://localhost:3000/auth/discord/callback`  
**Effect:** In production on Render the Discord OAuth callback sends users back to `localhost:3000`, which fails. The Render env vars must have `DISCORD_REDIRECT_URI=https://ryzeeducation.com.au/auth/discord/callback`.  
**Status:** Likely already set correctly in Render dashboard (the login works) but the local `.env` is wrong and could mislead debugging.

---

## 📋 Page-by-Page Audit

| # | Route | Role | API Endpoint | Status | Root Cause | Fix |
|---|-------|------|-------------|--------|-----------|-----|
| 1 | `/login` | — | `POST /api/auth/discord/callback` | ✅ Works | — | — |
| 2 | `/auth/discord/callback` | — | (same) | ✅ Works | — | — |
| 3 | `/dashboard/overview` (admin) | admin | `GET /api/admin/overview-stats` | 🔴 Broken | `VITE_PORTAL_API_URL` not set → API call hits Vercel | Set env var in Vercel |
| 4 | `/dashboard/admin` | admin | Same | 🔴 Broken | Same | Same |
| 5 | `/dashboard/admin/students` | admin | `GET /api/admin/students` | 🔴 Broken | Same | Same |
| 6 | `/dashboard/admin/students/:id` | admin | `GET /api/admin/students/:id` | 🔴 Broken | Same | Same |
| 7 | `/dashboard/admin/parents` | admin | `GET /api/admin/parents` | 🔴 Broken | Same | Same |
| 8 | `/dashboard/admin/parents/:id` | admin | `GET /api/admin/parents/:id` | 🔴 Broken | Same | Same |
| 9 | `/dashboard/admin/tutors` | admin | `GET /api/admin/tutors` | 🔴 Broken | Same | Same |
| 10 | `/dashboard/admin/classes` | admin | `GET /api/admin/classes` | 🔴 Broken | Same | Same |
| 11 | `/dashboard/admin/classes/:id` | admin | `GET /api/admin/classes/:id` | 🔴 Broken | Same | Same |
| 12 | `/dashboard/admin/lessons` | admin | `GET /api/admin/lessons` | 🔴 Broken | Same | Same |
| 13 | `/dashboard/admin/lessons/:id` | admin | `GET /api/admin/lessons/:id` | 🔴 Broken | Same | Same |
| 14 | `/dashboard/admin/attendance` | admin | `GET /api/admin/attendance` | 🔴 Broken | Same | Same |
| 15 | `/dashboard/admin/homework` | admin | `GET /api/admin/homework` | 🔴 Broken | Same | Same |
| 16 | `/dashboard/admin/payments` | admin | `GET /api/admin/student-payments` | 🔴 Broken | Same | Same |
| 17 | `/dashboard/admin/tutor-payments` | admin | `GET /api/admin/tutor-payments` | 🔴 Broken | Same | Same |
| 18 | `/dashboard/admin/progress-reports` | admin | `GET /api/admin/progress-reports` | 🔴 Broken | Same | Same |
| 19 | `/dashboard/admin/announcements` | admin | `GET /api/admin/announcements` | 🔴 Broken | Same | Same |
| 20 | `/dashboard/admin/resources` | admin | `GET /api/admin/resources` | 🔴 Broken | Same | Same |
| 21 | `/dashboard/admin/alerts` | admin | `GET /api/admin/alerts` | 🔴 Broken | Same | Same |
| 22 | `/dashboard/admin/audit-log` | admin | `GET /api/admin/audit-log` | 🔴 Broken | Same | Same |
| 23 | `/dashboard/admin/messages` | admin | `GET /api/messages/threads` | 🔴 Broken | Same | Same |
| 24 | `/dashboard/settings` | any | local state only | 🟡 Untested | — | Verify |
| 25 | `/dashboard/calendar` | any | `GET /api/lessons?upcoming_only=true` | 🔴 Broken | Same | Same |
| 26 | `/dashboard/overview` (tutor) | tutor | `GET /api/tutor/*` | 🔴 Broken | Same + empty data | Same |
| 27 | `/dashboard/overview` (student) | student | `GET /api/student/portal` | 🔴 Broken | Same + empty data | Same |
| 28 | `/dashboard/overview` (parent) | parent | `GET /api/parent/portal` | 🔴 Broken | Same + empty data | Same |
| 29 | Role routing to admin | admin | `/auth/me` role field | 🔴 Broken | Bug #1: new Discord logins always get `student` role | Fix auth callback + seed Discord ID |
| 30 | Sidebar — admin nav visible | admin | — | 🔴 Broken | Caused by Bug #1 (shows student nav) | Fix auth role |
| 31 | Admin profile badge | admin | — | 🔴 Broken | Caused by Bug #1 | Fix auth role |

---

## 🔍 Full Auth Flow Trace

```
1. User clicks "Login with Discord"
   → frontend: AuthService.redirectToDiscord()
   → GET VITE_PORTAL_API_URL/api/auth/discord/url
   
   ⚠️  If VITE_PORTAL_API_URL is '' (empty):
   → calls https://ryzeeducation.com.au/api/auth/discord/url  ← WRONG HOST
   → Vercel returns HTML/404
   → Discord button fails silently
   
   ✅ If VITE_PORTAL_API_URL is set correctly:
   → GET https://ryze-portal-api.onrender.com/api/auth/discord/url
   → Returns { url: "https://discord.com/oauth2/authorize?..." }
   → Browser redirects to Discord

2. Discord redirects back to /auth/discord/callback?code=XXX
   → DiscordCallback.tsx reads ?code param
   → calls loginDiscord(code)
   → POST /api/auth/discord/callback { code }
   → Server exchanges code with Discord API
   → Server looks up: db.user.findFirst({ where: { discord_user_id: du.id } })
   
   ⚠️  YOUR Discord ID IS NOT IN THE DATABASE
   → Server creates NEW user: { role: 'student' }  ← BUG #1
   → JWT payload: { role: 'student', name: 'YourName', ... }
   → Cookies set with student role

3. Browser lands on /dashboard
   → AuthContext.loginDiscord() sets user = { role: 'student', ... }
   → ProtectedRoute: isAuthenticated = true ✅
   → Route: /dashboard/overview → RoleSwitch
   → RoleSwitch: user.role === 'student' → renders <StudentDashboard />  ← WRONG
   → AdminGuard: user.role !== 'admin' → redirects from /dashboard/admin/*

4. StudentDashboard calls GET /api/student/portal
   ⚠️  VITE_PORTAL_API_URL not set → hits Vercel → fails
   → Loading state never resolves
```

---

## ✅ What Actually Works (confirmed by code reading)

1. **Login page renders** — the React component loads correctly
2. **Discord OAuth redirect** — if the API is reachable and DISCORD_CLIENT_ID is set
3. **JWT cookie setting** — `setAuthCookies()` works correctly when callback succeeds  
4. **ProtectedRoute spinner** — correctly shows spinner during session check
5. **Seed script** — `npx ts-node src/seed.ts` runs correctly and creates DB records
6. **All backend route handlers** — code is correctly written, queries are valid Prisma
7. **Role middleware** — `requireAdmin`, `requireTutor` etc. work correctly
8. **CORS** — fixed in PR #73 to accept both www and non-www

---

## 🚦 Fix Priority Order

### Priority 1 — Without this, nothing works
- [ ] Add `VITE_PORTAL_API_URL=https://ryze-portal-api.onrender.com` to **Vercel** environment variables

### Priority 2 — Without this, you can't test as admin
- [ ] Fix `auth.ts` Discord callback to check `ADMIN_DISCORD_IDS` env var before defaulting to `student`
- [ ] Add your Discord user ID to the admin user record in the database

### Priority 3 — Without this, dashboard looks empty even when working
- [ ] Replace sparse seed with comprehensive test data (realistic Ryze Education content)

### Priority 4 — Quality
- [ ] Add proper empty states (not infinite loading) to all dashboard pages
- [ ] Error boundaries on API call failures

### Priority 5 — Verification
- [ ] Playwright end-to-end tests for login, role routing, and dashboard data loading
- [ ] Manual verification report

---

## 🛠️ Environment Variables — Complete Checklist

### Vercel (Frontend) — must be set in Vercel Dashboard > Project Settings > Environment Variables
| Variable | Required | Value |
|---|---|---|
| `VITE_ENABLE_DASHBOARD` | ✅ | `true` |
| `VITE_PORTAL_API_URL` | 🔴 **MISSING** | `https://ryze-portal-api.onrender.com` |

### Render (Backend) — verify all are set in Render Dashboard
| Variable | Required | Status |
|---|---|---|
| `DATABASE_URL` | ✅ | Should be set |
| `DATABASE_DIRECT_URL` | ✅ | Should be set |
| `JWT_SECRET` | ✅ | Must be strong secret |
| `CORS_ORIGIN` | ✅ | `https://ryzeeducation.com.au` |
| `PORTAL_BASE_URL` | ✅ | `https://ryzeeducation.com.au` |
| `DISCORD_CLIENT_ID` | ✅ | Should be set |
| `DISCORD_CLIENT_SECRET` | ✅ | Should be set |
| `DISCORD_REDIRECT_URI` | ✅ | `https://ryzeeducation.com.au/auth/discord/callback` |
| `BOT_API_SECRET` | ✅ | Should match `DASHBOARD_API_KEY` in bot `.env` |
| `NODE_ENV` | ✅ | `production` |
| `ADMIN_DISCORD_IDS` | 🔴 **MISSING** | Your Discord user ID (to be added) |

---

## 📊 Verification Method Per Fix

| Fix | How to verify |
|---|---|
| `VITE_PORTAL_API_URL` set | Open DevTools > Network in production. API calls should go to `ryze-portal-api.onrender.com` not `ryzeeducation.com.au` |
| Admin role fixed | `/api/auth/me` should return `{ "role": "admin" }` |
| Dashboard stats load | AdminOverview stat cards show numbers, not spinners |
| Students page loads | Table shows seeded students |
| Seed complete | Health strip at bottom of AdminOverview shows student_count > 0 |
