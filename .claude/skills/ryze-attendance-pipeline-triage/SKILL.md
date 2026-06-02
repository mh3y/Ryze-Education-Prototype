---
name: ryze-attendance-pipeline-triage
description: Use for any Ryze attendance system issue. Triggers on: attendance not recorded, attendance missing, Discord voice session missing, bot offline, bot sync failure, voice session not pushed, lesson not matched, unmatched voice session, Google Calendar sync, attendanceEngine, late status, partial status, left_early status, missing attendance records, backfill sessions, bot push failed.
---

## Purpose
Diagnose attendance failures systematically across the full pipeline from Discord voice event to CRM display.

The pipeline has 9 layers. Failures at different layers have different recoverability and different fixes. Work through them in order — do not guess.

---

## The pipeline

```
Layer 1: Discord voice event fired
         → Python bot's attendance.py cog
         → asyncio.create_task (fire-and-forget — never blocks Discord)

Layer 2: Bot local DB write
         → VoiceSession saved to ryze_bot PostgreSQL on VPS
         → Docker service: ryze-discord-bot_db_1

Layer 3: Push to Render attempted
         → portal_api.py → PortalAPIClient.push_voice_sessions()
         → POST /api/bot/sync-voice-sessions
         → 3 retry attempts with backoff (as of PR #101)

Layer 4: Render API accepted
         → server/src/routes/bot.ts
         → Returns 200 on success

Layer 5: VoiceAttendance row created in Supabase
         → VoiceAttendance table
         → lesson_id may be null if no lesson matched yet

Layer 6: Lesson matched
         → Does a Lesson row exist for this class on this date?
         → Is ClassGroup.google_calendar_id set? Is the Calendar sync working?
         → GOOGLE_REFRESH_TOKEN in bot .env must be valid (not expired/revoked)

Layer 7: Attendance engine computed status
         → server/src/services/attendanceEngine.ts
         → Merges voice fragments → computes AttendanceStatus
         → GET /api/admin/attendance/lessons returns results
         → GET /api/admin/attendance/health shows pipeline health

Layer 8: Manual override present
         → Attendance table (lesson_id + student_id unique pair)
         → Manual marks take precedence over engine-computed status

Layer 9: UI rendering correctly
         → AttendanceView.tsx
         → Is the issue only in display, not underlying data?
```

---

## Recoverability decision tree

| Scenario | Layer | Recoverable? | Fix |
|----------|-------|-------------|-----|
| Bot was offline during lesson | 1 | ❌ Unrecoverable | Manual entry: `POST /api/admin/attendance/:lessonId/:userId/mark` |
| Bot ran but push failed (data in bot DB) | 3 | ✅ Backfillable | Trigger `POST /api/bot/sync-voice-sessions` with session data from bot DB |
| VoiceAttendance exists, lesson_id is null | 6 | ✅ Once lesson exists | Create lesson in CRM → engine matches on next query |
| Google Calendar not syncing | 6 | ✅ Once token fixed | Regenerate GOOGLE_REFRESH_TOKEN in Google Cloud Console, update bot VPS .env |
| Engine computed wrong status | 7 | ✅ Thresholds are configurable | Check thresholds in attendanceEngine.ts (top of file) |
| Manual override incorrect | 8 | ✅ | Update via `PATCH /api/admin/attendance/:lessonId/:userId/mark` |
| UI display bug only | 9 | ✅ | Fix rendering in AttendanceView.tsx |

---

## AttendanceStatus values and thresholds

**Enum:** `present`, `absent`, `late`, `left_early`, `partial`, `excused`, `unknown`

**Thresholds** (from `server/src/services/attendanceEngine.ts` — verify before citing):

| Threshold | Default | Meaning |
|-----------|---------|---------|
| BUFFER_BEFORE_MS | 15 min | Voice sessions starting up to 15 min before lesson count |
| BUFFER_AFTER_MS | 15 min | Sessions ending up to 15 min after lesson end count |
| MERGE_GAP_MS | 5 min | Rejoins within 5 min of leaving are merged into one block |
| LATE_THRESHOLD_MS | 10 min | Join > 10 min after start → "late" |
| EARLY_LEAVE_MS | 10 min | Leave > 10 min before end → "left_early" |
| PRESENT_PCT | 0.70 | Must attend ≥ 70% of lesson to be "present" (not "partial") |

---

## Timezone warning

All DB timestamps are UTC. AEST = UTC+10, **AEDT = UTC+11** (Oct–Apr daylight saving).
Any hardcoded `+10:00` offset is wrong for half the year. Flag if found.

---

## Spawn the attendance debugger

For investigations requiring multiple file reads, DB inspection, or bot log analysis — spawn the `ryze-attendance-debugger` subagent. It returns a structured report covering all 9 pipeline layers.

---

## Required output

After diagnosis, produce all five:

1. **Failure layer** — which of the 9 layers is the root cause
2. **Recoverability** — recoverable (backfill) / unrecoverable (manual entry required) / display-only fix
3. **Affected records** — specific students, dates, discord_user_ids, session counts
4. **Exact remediation** — specific API calls, SSH commands, or CRM actions (with actual values)
5. **Prevention patch** — code or config change to prevent this class of failure recurring
