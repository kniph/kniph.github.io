# kniph.github.io — Claude Code Context

## Project Overview
Dev/staging playground for AI-powered English teaching tools. Tools are built and tested here, then graduate to kniph.app (production).

## Architecture

### Frontend (this repo)
- **GitHub Pages**: `https://kniph.github.io`
- Remote: `https://github.com/kniph/kniph.github.io.git`
- Branch: `main`

### Shared Backend (Railway)
- URL: `https://railway-backend-production-55cf.up.railway.app`
- Code: `Essay Grader/railway-backend/server.js`
- Key endpoints:
  - `POST /api/grade-essay`
  - `POST /api/grade-sentence`
  - `POST /api/grade-sentence-batch`
  - `POST /api/generate-questions`
  - `POST /api/save-sentence-session`
  - `POST /api/speaking/generate-questions`
  - `POST /api/save-question-set` *(JWT required)*
  - `GET /api/question-sets` *(JWT required — returns org's saved sets)*
  - `GET /api/question-sets/:id` *(JWT required)*
  - `DELETE /api/question-sets/:id` *(JWT required)*

### Spelling SRS Backend
- Repo: `kniph/spelling-srs-backend` (separate deployment)

## Tools

| File | Tool | Status |
|------|------|--------|
| `sentence_grader.html` | Sentence Grader landing | Live |
| `sentence_grader_teacher.html` | Sentence grading UI (legacy — canonical is in spelling-app-backend) | Live |
| `essay_grader.html` | Essay Grader | Live |
| `essay_batch.html` | Batch Essay Grader | Live |
| `speaking_part1.html` | Speaking Grader Part 1 | Live |
| `speaking_part2.html` | Speaking Grader Part 2 | Live |
| `speaking_part3.html` | Speaking Grader Part 3 | Live |
| `speaking_admin.html` | Speaking admin/question gen | Live |
| `stc/index.html` | STC tool | Live |

## Models in Use (as of 2026-03-26)
- `claude-sonnet-4-6` — primary grading model
- `claude-haiku-4-5-20251001` — fast/cheap tasks
- `claude-opus-4-6` — complex tasks if needed
- `gpt-5.4`, `gpt-4o-mini` — OpenAI alternatives

## Sentence Grader

### Scoring Rules
- `2` = perfect answer
- `1` = grammar correct + minor surface error (e.g. punctuation/spacing)
- `0` = any grammar error (instant fail — no partial credit)

### Question Types
- 句子改寫 (sentence rewriting)
- 句子合併 (sentence combining)
- 重組 (sentence unscrambling)

### Sources
- GEPT-1, AMC-3 through AMC-8

### Test Suite
- File: `/tests/sentence-grader-test-cases.json`
- 40 questions, 116 answer variations
- Grading prompt validated at 100% accuracy (116/116) using Claude Sonnet 4

## Key Conventions
- Backend is shared across ALL tools — changes affect essay grader, sentence grader, and speaking grader simultaneously
- Deploy frontend by pushing to `main` (GitHub Pages auto-deploys)
- Backend deploys separately on Railway
- **Auth rule**: Tools requiring login go in `spelling-app-backend/public/` (JWT token already in localStorage). kniph.github.io is for public/unauthenticated tools only.
