# Ryze Education — Admin Portal Audit
**Date:** 2026-05-22  
**Auditor:** Code review (no runtime verification — production blockers not yet resolved)  
**Status:** Auth fix committed (PR #76) — awaiting Vercel + Render env var deployment

---

## 🚨 PRODUCTION BLOCKERS (must fix before anything else can be verified)

| # | Blocker | Action Required | Who |
|---|---------|----------------|-----|
| 1 | `VITE_PORTAL_API_URL` not set in Vercel | Add `VITE_PORTAL_API_URL=https://ryze-portal-api.onrender.com` → Redeploy | **User** |
| 2 | `DISCORD_GUILD_ID` not set on Render | Add `DISCORD_GUILD_ID=<your_guild_id>` | **User** |
| 3 | `DISCORD_BOT_TOKEN` not set on Render | Add `DISCORD_BOT_TOKEN=<bot_token>` | **User** |
| 4 | PR #76 not merged | Merge `fix/stabilisation-auth-seed` into `main` | **User** |
| 5 | Seed not run | `cd server && npx ts-node src/seed.ts` after merge | **User** |

**Until blocker #1 is resolved, every single API call from the frontend fails.** The frontend fetches `https://ryzeeducation.com.au/api/admin/...` (wrong host — Vercel static server, not Render). Vercel returns HTML, the JSON parse fails, all data widgets show error or empty state.

---

## Auth Flow Verification Checklist

| Step | Component | Code location | Status |
|------|-----------|---------------|--------|
| 1. User clicks Login | `Login.tsx` | `GET /api/auth/discord/url` | ✅ Code correct |
| 2. Discord redirect fires | `DiscordCallback.tsx` | `POST /api/auth/discord/callback` | ✅ Code correct |
| 3. Bot token fetches guild member | `auth.ts` line ~130 | `GET /guilds/{id}/members/{user}` | ✅ Fixed in PR #76 |
| 4. Guild role names mapped | `auth.ts` | Admin > Tutor > Student priority | ✅ Fixed in PR #76 |
| 5. Role stored in DB | `auth.ts` | `db.user.create` / `db.user.update` | ✅ Code correct |
| 6. `/auth/me` returns correct role | `auth.ts` | `GET /api/auth/me` | ✅ Code correct |
| 7. JWT cookies set | `auth.ts` | `setAuthCookies()` | ✅ Code correct |
| 8. Frontend reads role | `AuthContext.tsx` | `AuthService.handleDiscordCallback` | ✅ Code correct |
| 9. `RoleSwitch` renders admin page | `App.tsx` line ~377 | `user.role === 'admin' → AdminOverview` | ✅ Code correct |
| 10. `AdminGuard` protects `/admin/*` | `App.tsx` line ~175 | `user.role !== 'admin' → redirect` | ✅ Code correct |
| 11. Sidebar shows admin nav | `Sidebar.tsx` | Role-gated nav items | ⚠️ Needs verification |

**User without a recognised Discord guild role:** Now receives HTTP 403 with message "Your Discord account is not linked to an approved Ryze Education role." — not silently made a student.

---

## Admin Portal Pages — Complete Audit

| Page | Route | API Endpoint | Backend Route | Frontend File | Status | Notes |
|------|-------|-------------|--------------|---------------|--------|-------|
| Admin Overview | `/dashboard/overview` (admin) | `GET /api/admin/overview-stats` | `admin/overview.ts` | `AdminOverview.tsx` | 🟡 Code OK — blocked by env var | Has loading, error, empty states |
| Admin Overview (alt) | `/dashboard/admin` | same | same | same | 🟡 same | |
| Students list | `/dashboard/admin/students` | `GET /api/admin/students` | `admin/students.ts` | `StudentsPage.tsx` | 🟡 Code OK — blocked | |
| Student detail | `/dashboard/admin/students/:id` | `GET /api/admin/students/:id` | same | `StudentDetail.tsx` | 🟡 Code OK — blocked | |
| Parents list | `/dashboard/admin/parents` | `GET /api/admin/parents` | `admin/parents.ts` | `ParentsPage.tsx` | 🟡 Code OK — blocked | |
| Parent detail | `/dashboard/admin/parents/:id` | `GET /api/admin/parents/:id` | same | `ParentDetail.tsx` | 🟡 Code OK — blocked | |
| Tutors list | `/dashboard/admin/tutors` | `GET /api/admin/tutors` | `admin/tutors.ts` | `TutorsPage.tsx` | 🟡 Code OK — blocked | |
| Classes list | `/dashboard/admin/classes` | `GET /api/admin/classes` | `admin/classes.ts` | `ClassesPage.tsx` | 🟡 Code OK — blocked | |
| Class detail | `/dashboard/admin/classes/:id` | `GET /api/admin/classes/:id` | same | `ClassDetail.tsx` | 🟡 Code OK — blocked | |
| Lessons list | `/dashboard/admin/lessons` | `GET /api/admin/lessons` | `admin/lessons.ts` | `LessonsPage.tsx` | 🟡 Code OK — blocked | |
| Lesson detail | `/dashboard/admin/lessons/:id` | `GET /api/admin/lessons/:id` | same | `LessonDetail.tsx` | 🟡 Code OK — blocked | |
| Attendance | `/dashboard/admin/attendance` | `GET /api/admin/attendance` | `admin/attendance.ts` | `AttendanceView.tsx` (legacy) | ⚠️ Uses legacy component | See note |
| Homework | `/dashboard/admin/homework` | `GET /api/admin/homework` | `admin/homework.ts` | `HomeworkPage.tsx` | 🟡 Code OK — blocked | |
| Student Payments | `/dashboard/admin/payments` | `GET /api/admin/student-payments` | `admin/payments.ts` | `PaymentsPage.tsx` | 🟡 Code OK — blocked | |
| Tutor Payments | `/dashboard/admin/tutor-payments` | `GET /api/admin/tutor-payments` | `admin/payments.ts` | `TutorPaymentsPage.tsx` | 🟡 Code OK — blocked | |
| Progress Reports | `/dashboard/admin/progress-reports` | `GET /api/admin/progress-reports` | `admin/progress-reports.ts` | `ProgressReportsPage.tsx` | 🟡 Code OK — blocked | |
| Announcements | `/dashboard/admin/announcements` | `GET /api/admin/announcements` | `admin/announcements.ts` | `AnnouncementsPage.tsx` | 🟡 Code OK — blocked | |
| Resources | `/dashboard/admin/resources` | `GET /api/admin/resources` | `admin/resources.ts` | `ResourcesPage.tsx` | 🟡 Code OK — blocked | |
| Alerts | `/dashboard/admin/alerts` | `GET /api/admin/alerts` | `admin/alerts.ts` | `AlertsPage.tsx` | 🟡 Code OK — blocked | |
| Audit Log | `/dashboard/admin/audit-log` | `GET /api/admin/audit-log` | `admin/audit.ts` | `AuditLogPage.tsx` | 🟡 Code OK — blocked | |
| Messages | `/dashboard/admin/messages` | `GET /api/messages/threads` | `messages.ts` | `MessagesPage.tsx` | 🟡 Code OK — blocked | |
| Calendar | `/dashboard/calendar` | `GET /api/admin/calendar/events` | `admin/lessons.ts` | `CalendarPage.tsx` | 🟡 Code OK — blocked | |
| Settings | `/dashboard/settings` | Local state only | — | `SettingsPage.tsx` | ✅ Works (no API) | |

**Legend:** ✅ Verified working | 🟡 Code correct, blocked by deployment | 🔴 Broken | ⚠️ Needs attention

---

## ⚠️ Items Needing Attention Post-Deployment

### 1. Attendance page uses legacy `AttendanceView` component
**Route:** `/dashboard/admin/attendance`  
**Component:** `components/dashboard/admin/AttendanceView.tsx` (legacy, not the new phase-3 pages)  
**Risk:** May have different API expectations. Verify after env vars are set.

### 2. Static delta text on stat tiles
**Component:** `AdminOverview.tsx` lines 284–287  
**Issue:** Delta text like "+6 this week", "1 live now", "08 tomorrow" are hardcoded strings, not from the API.  
**Impact:** Cosmetic — misleading but non-breaking.  
**Fix:** Either remove delta text or calculate from real data.

### 3. `services/portalApi.ts` — health endpoint URL
**File:** `services/portalApi.ts`  
**Risk:** Also uses `VITE_PORTAL_API_URL` base. Will fail in same way as other calls until env var is set.

---

## Environment Variables — Complete Checklist

### Vercel (Frontend build-time vars — must set in Vercel Dashboard)
| Variable | Required | Value | Status |
|----------|----------|-------|--------|
| `VITE_ENABLE_DASHBOARD` | ✅ | `true` | ✅ Set |
| `VITE_PORTAL_API_URL` | 🔴 **MISSING** | `https://ryze-portal-api.onrender.com` | ❌ Not set |

### Render (Backend runtime vars — must set in Render Dashboard)
| Variable | Required | Value | Status |
|----------|----------|-------|--------|
| `DATABASE_URL` | ✅ | Supabase pooler URL | Should be set |
| `DATABASE_DIRECT_URL` | ✅ | Supabase direct URL | Should be set |
| `JWT_SECRET` | ✅ | Strong random string | Should be set |
| `CORS_ORIGIN` | ✅ | `https://ryzeeducation.com.au` | Should be set |
| `DISCORD_CLIENT_ID` | ✅ | From Discord Dev Portal | Should be set |
| `DISCORD_CLIENT_SECRET` | ✅ | From Discord Dev Portal | Should be set |
| `DISCORD_REDIRECT_URI` | ✅ | `https://ryzeeducation.com.au/auth/discord/callback` | Should be set |
| `DISCORD_GUILD_ID` | 🔴 **MISSING** | Your Discord server ID | ❌ Not set |
| `DISCORD_BOT_TOKEN` | 🔴 **MISSING** | Bot token from Discord Dev Portal | ❌ Not set |
| `BOT_API_SECRET` | ✅ | Shared secret with Discord bot | Should be set |
| `NODE_ENV` | ✅ | `production` | Should be set |
| ~~`ADMIN_DISCORD_IDS`~~ | ~~was needed~~ | ~~Removed — no longer needed~~ | Replaced by guild detection |

---

## Post-Deployment Verification Steps

Run these checks **after** setting env vars, merging PR #76, and running the seed:

```
1. Open https://ryzeeducation.com.au/login
2. Click "Login with Discord"
3. Complete Discord auth
4. DevTools > Network: confirm POST goes to ryze-portal-api.onrender.com
5. GET /api/auth/me → must return { "role": "admin" }
6. You should land on /dashboard/overview showing AdminOverview
7. Stat cards must show numbers (not spinners or dashes)
8. Sidebar must show admin navigation items
9. Navigate to /dashboard/admin/students → table must show 6 seeded students
10. Navigate to /dashboard/admin/classes → table must show 4 seeded classes
11. Navigate to /dashboard/admin/lessons → list must show 10 seeded lessons
12. Navigate to /dashboard/admin/payments → list must show 6 seeded payments
13. Navigate to /dashboard/admin/alerts → list must show 3 seeded alerts
```

---

## Architecture Notes

- All admin pages follow the same pattern: `useEffect → adminApi.getX() → setData / setError / setLoading(false)`
- `AdminGuard` in `App.tsx` correctly blocks non-admin users from `/dashboard/admin/*`
- `RoleSwitch` in `App.tsx` renders `AdminOverview` for admin, `TutorDashboard` for tutor, etc.
- `portalFetch()` in `services/auth.ts` auto-retries on 401 via `/api/auth/refresh` — token refresh is handled transparently
- Backend uses `requireAdmin` middleware on all `/api/admin/*` routes — correct
- CORS is set to `https://ryzeeducation.com.au` — correct
- Cookies use `SameSite=None; Secure` for cross-origin (Vercel → Render) — correct
