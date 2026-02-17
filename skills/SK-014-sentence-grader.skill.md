# Sentence Grader Skill

**Skill ID**: SK-014
**Category**: Premium Add-on
**Pricing**: +NT$2,000/month
**Status**: ✅ Production Ready
**Last Updated**: 2025-02-17 (v1.0)

---

## Purpose

AI-powered grading of GEPT sentence writing tasks (Writing Part 1). Covers all three GEPT sentence task types: sentence rewriting (改寫), sentence combining (合併), and sentence reordering (重組). Together with SK-001 (essay grader), this covers the **complete GEPT Writing module**.

---

## GEPT Writing Coverage

```
GEPT Second Stage — Writing Module
  ├─ Part 1: Sentence Writing (16 questions, 40 mins)
  │     └─ SK-014 ← This skill
  └─ Part 2: Paragraph Writing (essay)
        └─ SK-001 (GEPT Essay Grader)
```

---

## Features

- ✅ 3 GEPT sentence task types (改寫 / 合併 / 重組)
- ✅ Pre-loaded question sets (AMC mock tests + official GEPT samples)
- ✅ AI-generated question sets (on demand)
- ✅ Two grading modes: single-student and batch (class-wide)
- ✅ Multi-model AI (Claude 4.5 Sonnet / GPT-5.2)
- ✅ Per-question detailed feedback
- ✅ Session saving + PDF report (SK-003 / SK-008)
- ✅ Teacher mode and student mode (separate UIs)
- ✅ Elapsed time tracking
- ✅ Export results

---

## Files

| File | Role |
|---|---|
| `sentence_grader.html` | Role selector (student vs teacher) |
| `sentence_grader_teacher.html` | Full teacher grading interface |
| `printable_sentence_report.html` | PDF report for sentence results |

---

## Question Sets

### Pre-loaded Sets

| Set ID | Description |
|---|---|
| A-1 through A-8 | AMC 模擬試題 1-8 (mock tests) |
| G-1 | GEPT 官方範例 (official sample) |
| AI | 🤖 AI 生成題目 (on-demand generated) |

### Question Types (per GEPT spec)

| Type | Chinese | Description | Example |
|---|---|---|---|
| 改寫 | Rewriting | Rewrite sentence using given cue word | "The bag is too heavy for me to carry." → using "so…that" |
| 合併 | Combining | Combine two sentences into one | Two short sentences → one complex sentence |
| 重組 | Reordering | Rearrange scrambled words into correct sentence | Scrambled words given |

---

## Backend Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/generate-questions` | POST | AI generates a new question set |
| `/api/grade-sentence` | POST | Grade a single sentence answer |
| `/api/grade-sentence-batch` | POST | Grade multiple answers at once |
| `/api/save-sentence-session` | POST | Save results for PDF/QR access |
| `/api/get-sentence-session/:id` | GET | Retrieve saved sentence session |

---

## Input Schema

### Grade Single Sentence

```json
{
  "question": {
    "num": 1,
    "type": "改寫",
    "original": "The bag is too heavy for me to carry.",
    "cue": "so...that",
    "target_grammar": "so...that clause"
  },
  "answer": "The bag is so heavy that I can't carry it.",
  "model": "claude-sonnet-4.5"
}
```

### Grade Batch

```json
{
  "questions": [ /* array of question objects */ ],
  "answers": [ /* array of student answer strings */ ],
  "model": "claude-sonnet-4.5",
  "studentName": "王小明"
}
```

---

## Output Schema

### Single Grade Result

```json
{
  "success": true,
  "result": {
    "questionNum": 1,
    "studentAnswer": "The bag is so heavy that I can't carry it.",
    "isCorrect": true,
    "score": 2,
    "maxScore": 2,
    "feedback": "Excellent! Correct use of 'so...that' clause structure.",
    "modelAnswer": "The bag is so heavy that I cannot carry it.",
    "errorType": null
  }
}
```

---

## Grading Modes

### Single Mode (gradeSingleMode)
- One student's answers graded at once
- Teacher enters student name
- Results displayed per question with detailed feedback

### Batch Mode (gradeBatchMode)
- Multiple students graded simultaneously
- Each student's answers graded via `/api/grade-sentence-batch`
- Results collected and displayed in summary table

---

## AI Question Generation

When "AI 生成題目" is selected:

```javascript
const response = await fetch(`${API_BASE_URL}/api/generate-questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: selectedModel })
});
```

AI generates 15 questions across the 3 task types, calibrated to GEPT Elementary level.

---

## Session & PDF Flow

```
Teacher grades all answers
  ↓
Teacher clicks "匯出結果"
  ↓
Results POSTed to /api/save-sentence-session
  ↓
sessionId returned
  ↓
printable_sentence_report.html?session={id} opens
  ↓
Auto-print dialog appears
  ↓
Teacher saves/prints PDF report
  ↓
QR code in report links student to their results
```

---

## Sentence Report Content

`printable_sentence_report.html` displays:

1. Student name + date + test ID
2. Total score + time elapsed
3. Per-question breakdown:
   - Question text and type
   - Student's answer
   - Correct / incorrect indicator
   - Model answer
   - Feedback explanation
4. QR code for online access

---

## Model Selection

```html
<select id="modelSelect" onchange="updateModelDisplay()">
  <option value="claude-sonnet-4.5">Claude Sonnet 4.5</option>
  <option value="gpt-5.2">GPT 5.2</option>
</select>
```

Header subtitle updates dynamically to show active model.

---

## Cost Analysis

| Component | Cost per session (15 questions) |
|---|---|
| AI grading (Claude 4.5) | ~NT$8-12 |
| AI grading (GPT-5.2) | ~NT$6-10 |
| Session storage | ~NT$0.01 |
| **Total per student** | **~NT$8-12** |

At NT$2,000/month add-on pricing:
- Break-even: ~170 student sessions/month
- Typical school: 300-500 sessions/month
- **Margin: 85-95%**

---

## Dependencies

### Required Skills
- **SK-001**: GEPT Essay Grader context (shares backend infrastructure)
- **SK-008**: Session Persistence (save sentence session)
- **SK-003**: PDF Report (printable_sentence_report.html)

### Works With
- **SK-005**: Multi-Model AI Selection (choose Claude vs GPT)
- **SK-012**: Custom Branding (branded sentence reports)

---

## White-Label Customisation

Per customer you can:
- Pre-select question sets relevant to their curriculum
- Lock AI model (remove selector)
- Add custom question sets (beyond A-1 to G-1)
- Adjust passing score threshold
- Customise report header/footer with school branding

---

## Upsell Talking Points

1. **Complete GEPT Writing coverage** — "Grade both essay AND sentences — the full writing module"
2. **Saves marking time** — "Grade 30 students' 15-question tests in seconds"
3. **Fair and consistent** — "Every student marked by the same AI standard"
4. **Instant feedback** — "Students see corrections immediately, not next week"
5. **Official question sets** — "Real AMC mock tests + official GEPT samples included"

---

## Roadmap

- **v1.1**: Intermediate + High-Intermediate sentence tasks
- **v1.2**: Student self-practice mode (student submits own answers)
- **v2.0**: Listening-based sentence questions (audio prompts)

---

## Changelog

### v1.0 — Initial Release
- 3 sentence task types (改寫 / 合併 / 重組)
- 9 pre-loaded question sets (A-1 to A-8 + G-1)
- AI-generated question mode
- Single and batch grading modes
- Claude 4.5 and GPT-5.2 model support
- Session saving + printable PDF report
- Teacher and student role separation
