# Ryze Education — Portal & Dashboard

A full-stack tutoring management system. The marketing site + dashboard portal live in this repo; the FastAPI backend lives in `ryze-discord-bot`.

## Dashboard Portal

Enable the dashboard by setting `VITE_ENABLE_DASHBOARD=true`.

### Routes

| Route | Component | Roles |
|---|---|---|
| `/dashboard/overview` | Role-aware dashboard | all |
| `/dashboard/settings` | Settings + sign-out | all |
| `/dashboard/ryze-ai` | AI Arena | student, tutor |
| `/dashboard/admin` | Admin overview | admin |
| `/dashboard/admin/students` | Student list | admin |
| `/dashboard/admin/students/:id` | Student detail | admin |
| `/dashboard/admin/parents` | Parent list | admin |
| `/dashboard/admin/parents/:id` | Parent detail | admin |
| `/dashboard/admin/classes` | Class list | admin |
| `/dashboard/admin/classes/:id` | Class detail + roster | admin |
| `/dashboard/admin/lessons` | Lesson list | admin |
| `/dashboard/admin/lessons/:id` | Lesson detail + attendance | admin |
| `/dashboard/admin/attendance` | Attendance marking | admin, tutor |
| `/dashboard/admin/payments` | Student payments | admin |
| `/dashboard/admin/tutor-payments` | Tutor pay periods | admin |
| `/dashboard/admin/progress-reports` | Progress reports | admin, tutor |
| `/dashboard/admin/alerts` | System alerts | admin |
| `/dashboard/admin/resources` | Resources / links | admin, tutor |
| `/dashboard/admin/announcements` | Announcements | admin |

### Role-specific dashboards

- **Admin** → `AdminOverview` (stats, today's classes, open alerts)
- **Tutor** → `TutorDashboard` (classes, upcoming lessons, quick links)
- **Student** → `StudentDashboard` (upcoming lessons, resources, AI Arena CTA)
- **Parent** → `ParentDashboard` (child cards: lessons / attendance / payments / reports)

### Auth

- **Students / Tutors / Admins**: Discord OAuth2 → `GET /auth/discord/callback`
- **Parents**: Email + password → `POST /auth/parent/login`; invited via `GET /auth/invite?token=…`

### Known gaps / placeholders

- `/dashboard/courses` — placeholder (LMS feature, deferred to a later phase)
- `/dashboard/assignments` — placeholder (LMS feature, deferred)
- `/dashboard/analytics` — placeholder (LMS feature, deferred)

### Demo seed data (backend)

```bash
cd ryze-discord-bot
python seed_demo_data.py
```

Creates 8 students, 2 tutors, 1 admin, 3 classes, 15 lessons, attendance records, payments, progress reports, alerts, resources, announcements, and 3 parent accounts.

Demo credentials:
- **Parent**: jennifer.wilson@example.com / parent1pass
- **Student**: Discord ID 100000000000000010 (Emma Wilson)
- **Admin**: Discord ID 100000000000000001 (Michael Chen)

---

## Image Pipeline: Cloudinary

This repo supports a repeatable migration workflow from local/GitHub image references to Cloudinary URLs.

### Environment variables

Frontend/runtime (safe to expose):

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_FOLDER=ryze
```

Upload script (local only, do not commit):

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

Alternatively:

```env
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@your_cloud_name
```

PowerShell example for current terminal session:

```powershell
$env:VITE_CLOUDINARY_CLOUD_NAME="your_cloud_name"
$env:VITE_CLOUDINARY_FOLDER="ryze"
$env:CLOUDINARY_CLOUD_NAME="your_cloud_name"
$env:CLOUDINARY_API_KEY="your_key"
$env:CLOUDINARY_API_SECRET="your_secret"
# or:
$env:CLOUDINARY_URL="cloudinary://API_KEY:API_SECRET@your_cloud_name"
```

### Commands

1) Generate/update the migration map:

```powershell
npm run images:upload
```

2) Preview replacements (no file writes):

```powershell
npm run images:replace:dry
```

3) Apply replacements:

```powershell
npm run images:replace
```

`images:replace` is guarded: write mode aborts unless the latest migration map was generated with uploads enabled and non-local assets are confirmed remote.

Emergency override (use only if you intentionally bypass verification):

```powershell
node scripts/replace-image-refs.mjs --write --force
```

### Generated artifacts

- `cloudinary-migration-map.json`: source file list, aliases, Cloudinary public IDs, URLs, upload status
- `cloudinary-reference-report.json`: detected references, replacements, unmatched references

### What stays local by default

To avoid accidental breakage, these remain local unless you intentionally map/replace them:

- `public/favicon.ico`
- `public/favicon-16x16.png`
- `public/favicon-32x32.png`
- `public/apple-touch-icon.png`
- `public/android-chrome-192x192.png`
- `public/android-chrome-512x512.png`
- `public/site.webmanifest`

### URL helper

Use `src/utils/cloudinary.ts` `cldUrl()` for consistent delivery defaults:

- `f_auto`
- `q_auto`
- `dpr_auto`

## Performance budget guardrails

- Do not add new blocking third-party scripts in `<head>`.
- Keep the hero visual as an `<img>` element (not CSS background images) and ensure the hero preload URL matches the hero `src` exactly.
