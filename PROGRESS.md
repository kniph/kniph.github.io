# Project Progress

**Last Updated**: 2026-03-27

This file tracks the real-time status of each tool and active workstreams.
Detailed skill specs live in `skills/SKILL-INVENTORY.md`.

---

## Tools

| Tool | File(s) | Status | Notes |
|------|---------|--------|-------|
| Essay Grader | `essay_grader.html` | ✅ Live (kniph.app) | Batch mode added (`essay_batch.html`) |
| Sentence Grader | `sentence_grader.html` (landing), `sentence_grader_teacher.html` (legacy) | ✅ Live | Canonical teacher UI migrated to spelling-app-backend |
| Speaking Grader | `speaking_part1/2/3.html`, `speaking_admin.html` | 🔧 Stabilizing | Active bug fixes: Whisper 400, iOS/Safari 502 |
| Spelling SRS | (separate repo: `kniph/spelling-srs-backend`) | ✅ Live (kniph.app) | — |
| STC | `stc/index.html` | ✅ Live | Auth added, Railway backend |
| Progress Analytics (SK-010) | — | 🚧 Not started | Was Q2 2025 target — not yet built |
| Parent Portal (SK-011) | — | 📋 Planned | — |
| Custom Branding (SK-012) | — | 📋 Planned | — |

---

## Active Work (2026-03-27)

### Sentence Grader — JWT Auth + Question Sets + spelling-app-backend Migration
- ✅ Upgraded models: claude-sonnet-4-6, gpt-5.4 (all validated 116/116)
- ✅ Migrated canonical teacher UI to `spelling-app-backend/public/sentence-grader/app.html`
- ✅ JWT auth: spelling-srs-backend issues tokens, railway-backend verifies via shared `JWT_SECRET`
- ✅ `products[]` added to JWT payload at login (admin-auth-router.js)
- ✅ `verifyKniphToken` middleware in railway-backend
- ✅ Org-scoped question set library: save AI-generated sets, load "My Sets" dropdown
- ✅ `question_sets.org_id` migrated from VARCHAR to INTEGER

**Pending**: Set `JWT_SECRET` env var in railway-backend Railway environment.

### Speaking Grader — Bug Fixes
Recent commits fixing stability issues on iOS/Safari and Whisper API errors:
- ✅ Fixed Whisper 400: flush audio buffer before stop, increase chunk interval
- ✅ Fixed Whisper 400: guard empty recordings
- ✅ Fixed iOS/Safari 502: pass mimeType through recording → transcribe pipeline
- ✅ Fixed autoplay block + improved error messages
- ✅ Fixed speaking admin: generate-questions endpoint path
- ✅ Redesigned Part 2 to match real GEPT exam flow
- ✅ Question bank: Set 1 populated, Sets 2–8 scaffolded

**Next steps**: Confirm Whisper fixes stable on iOS Safari, fill Sets 2–8 question bank.

---

## Graduation Tracker (kniph.github.io → kniph.app)

| Tool | kniph.github.io | kniph.app | Blocker |
|------|-----------------|-----------|---------|
| Essay Grader | ✅ | ✅ | — |
| Spelling SRS | ✅ | ✅ | — |
| Sentence Grader | ✅ | ⬜ Not yet | Canonical UI in spelling-app-backend; JWT auth done |
| Speaking Grader | ✅ | ⬜ Not yet | Stabilization in progress |

---

## Backlog

- [ ] Fill Speaking question bank Sets 2–8
- [ ] Graduate Sentence Grader to kniph.app
- [ ] Graduate Speaking Grader to kniph.app (after stabilization)
- [ ] Build Progress Analytics (SK-010)
- [ ] Update SKILL-INVENTORY.md dates (stale since 2025-02-17)
