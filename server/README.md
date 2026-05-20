# Ryze Portal API

Node.js + TypeScript + Express + Prisma (SQLite) backend for the Ryze Education parent portal.

## Quick start (development)

```bash
cd server
cp .env.example .env          # configure your env
npm install
npm run db:migrate            # creates ryze-portal.db and runs migrations
npm run db:seed               # seeds test data (students, a parent, classes)
npm run dev                   # starts on :8000 with hot reload
```

The Vite frontend (port 3000) already proxies `/api/*` to `localhost:8000`.

## Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/discord/url` | Get Discord OAuth URL (or dev stub) |
| POST | `/api/auth/discord/callback` | Exchange Discord code for JWT |
| POST | `/api/auth/parent/login` | Parent email+password login |
| POST | `/api/auth/parent/set-password` | Set password from invite token |
| GET | `/api/auth/me` | Resolve JWT to user info |

**Dev stub:** With no Discord credentials set, passing `code=dev_admin`, `code=dev_tutor`, or `code=dev_student` to the callback returns a JWT for that role.

## Admin endpoints (require admin JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/parents` | List all parents |
| POST | `/api/admin/parents` | Create parent + generate invite link |
| GET | `/api/admin/parents/:id` | Get parent with linked students |
| PATCH | `/api/admin/parents/:id` | Update parent details |
| DELETE | `/api/admin/parents/:id` | Delete parent |
| POST | `/api/admin/parents/:id/resend-invite` | Regenerate invite link |
| POST | `/api/admin/parents/:id/students` | Link student to parent |
| DELETE | `/api/admin/parents/:id/students/:linkId` | Unlink student |
| GET | `/api/admin/students` | List students (supports ?role=) |
| POST | `/api/admin/students` | Create student |
| GET | `/api/admin/students/:id` | Get student detail |
| PATCH | `/api/admin/students/:id/profile` | Update student profile |
| DELETE | `/api/admin/students/:id` | Delete student |
| GET | `/api/admin/overview-stats` | Dashboard stat tiles |

## Parent portal endpoints (require parent JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/parent/portal` | All dashboard data for the logged-in parent |

## Production (Docker Compose)

```bash
cp .env.example .env   # fill in JWT_SECRET, PORTAL_BASE_URL, SMTP creds, Discord creds
docker compose up -d
```
