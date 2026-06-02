---
name: ryze-crm-feature-implementation
description: Use automatically for any Ryze CRM or admin dashboard work including new admin page, CRM feature, dashboard table, API endpoint, Prisma model change, role-gated portal feature, student management, tutor management, parent portal, class management, lesson management, homework, payments, progress reports, leads pipeline, messages, alerts, announcements, resources, audit log, or any /dashboard/admin route.
---

## Purpose
Ensure every CRM feature is complete as a vertical slice: role access, frontend states, shared components, API endpoint, database, and audit trail. Not just the UI.

The most common failure mode is producing a page that looks complete but is missing operational details (error state, empty state, audit log, role check, mobile layout, API validation).

---

## Before writing any code

Answer these four questions first:

1. **Does the required API endpoint already exist?** Check `server/src/routes/admin/` and `server/src/index.ts` for the mount.
2. **Does the required data exist in the schema?** Read `server/prisma/schema.prisma` — do not add a new model if an existing one covers the need.
3. **Is there an existing admin page with a similar pattern?** Use it as a template — `StudentsPage.tsx`, `ParentsPage.tsx`, `LeadsPage.tsx`, and `PaymentsPage.tsx` are good references.
4. **Which roles need access?** Admin only (most cases), or does tutor/student/parent also need a view?

---

## Implementation checklist (every item required)

### Role access
- [ ] Admin-only pages live under `/dashboard/admin/*` and are protected by `AdminGuard` in `App.tsx`
- [ ] No student's data is accessible from another student's session
- [ ] API routes apply auth middleware: `requireAdmin` for admin routes, `requireAuth` for user routes
- [ ] The new route is added to `App.tsx` inside the `<AdminGuard>` block

### Frontend — all four states required

Every data-loading page must handle all four states:

- [ ] **Loading** — `<LoadingState message="Loading …" />` shown while fetch is in-flight
- [ ] **Error** — `<ErrorState message={error} onRetry={load} />` with a working retry handler
- [ ] **Empty** — `<EmptyState icon={...} title="..." message="..." />` — distinguish "nothing in DB" from "search returned nothing"
- [ ] **Data** — the happy path

Do NOT render the data state with `undefined` data — guard with `if (loading) return ...` / `if (error) return ...` / `if (items.length === 0) return ...`.

### Shared UI components (verified — use these, don't reinvent)

All in `components/dashboard/ui/` — imported via `../../../components/dashboard/ui`:

| Component | Correct props | Common mistake |
|-----------|--------------|----------------|
| `DataTable<T>` | `data={rows}` `rowKey={(r) => r.id}` `columns` `onRowClick` `loading` | `rows=` or `keyExtractor=` (wrong — causes blank screen) |
| `PageHeader` | `title` `subtitle` `icon` `actions` | — |
| `SearchInput` | `value` `onChange` `placeholder` `className` | — |
| `StatCard` | `label` `value` `icon` | — |
| `StatusBadge` | `value` `label` | — |
| `EmptyState` | `icon` `title` `message` | — |
| `LoadingState` | `message` | — |
| `ErrorState` | `message` `onRetry` | — |
| `ConfirmDialog` | `open` `title` `message` `onConfirm` `onCancel` | — |

### Backend API

- [ ] Route file exists in `server/src/routes/admin/`
- [ ] Route is exported and imported in `server/src/routes/admin/index.ts`
- [ ] Auth middleware applied (`requireAdmin` at minimum)
- [ ] Input validated — reject malformed/missing fields with `400` and `{ detail: "..." }`
- [ ] Error responses follow `{ detail: "..." }` format (matches global error handler)
- [ ] Admin mutations (create/update/delete) write an `AuditLog` entry — check existing routes for the pattern

### Database

- [ ] Use existing Prisma models where possible — read `server/prisma/schema.prisma` before proposing a new model
- [ ] If a schema change is required: note the risk. Render applies via `prisma db push --accept-data-loss` on next deploy — column drops are immediate and irreversible
- [ ] New required fields need `@default(...)` or the table must be empty
- [ ] Indexes added for any new column used in `WHERE` or `ORDER BY` clauses

### Mobile layout

- [ ] Table/list is usable at 390px width (consider horizontal scroll for wide tables)
- [ ] `PageHeader` action buttons stack cleanly on narrow screens
- [ ] Detail panels / modals are full-screen or bottom-sheet on mobile

---

## After implementation — run in order

```bash
npx tsc                       # frontend typecheck (NOT npm run build)
cd server && npm run build    # backend typecheck + compile
cd .. && npm run lint:colours # no raw Tailwind colours
npm run build                 # frontend bundle — catches import errors
```

Fix any errors before declaring done. All four must pass clean.

---

## Common patterns to follow

**List page structure:** load on mount + on filter change → `useCallback(load, [filters])` → `useEffect(() => { load(); }, [load])` → render based on state.

**Detail page with tabs:** fetch on mount by `:id` param → render sections → each mutation calls API + updates local state optimistically or re-fetches.

**Inline edit / modal save:** show `ConfirmDialog` for destructive actions (delete, mark paid, etc.).
