# Batch Processing Skill

**Skill ID**: SK-009
**Category**: Premium Add-on (Professional+)
**Pricing**: +NT$3,000/month
**Status**: 🔶 Partially Ready (sentence batch ✅, essay batch 🚧)
**Last Updated**: 2025-02-17

---

## Purpose

Grade multiple students' work in one operation instead of one at a time. This is the **#1 time-saver for teachers** and the strongest upsell driver from Starter → Professional.

---

## Current Coverage

| What | Status | Where |
|---|---|---|
| **Sentence batch** (15 questions × N students) | ✅ Production Ready | `sentence_grader_teacher.html` |
| **Essay batch** (N essays at once) | 🚧 To Be Built | Planned for `essay_grader.html` or new `essay_batch.html` |

---

## Part A: Sentence Batch Grading (✅ Ready)

### How It Works

Teacher pastes multiple students' answers in one textarea, system grades everyone automatically:

```
Input format (paste into batch textarea):

王小明
The bag is so heavy that I can't carry it.
She is too young to drive.
... (15 answers total)
李小華
The bag was so heavy that I couldn't carry it.
She is so young that she can't drive.
... (15 answers total)
陳大明
... (15 answers)
```

### Processing Flow

```
Teacher pastes 30 students × 15 answers
  ↓
Frontend parses: student name → 15 answers
  ↓
For each student:
  POST /api/grade-sentence-batch
    { questions: [...], model: "claude-sonnet-4.5" }
  ↓
  500ms delay between students (rate limiting)
  ↓
  Progress: "正在批次評分 王小明 (1 / 30)..."
  ↓
Results collected for all students
  ↓
Display summary table
  ↓
Export to PDF (per student or class report)
```

### Backend Endpoint

**URL**: `POST /api/grade-sentence-batch`

```json
{
  "questions": [
    {
      "questionNum": 1,
      "question_type": "改寫",
      "original": "The bag is too heavy for me to carry.",
      "prompt": "so...that",
      "correct_answers": ["The bag is so heavy that I can't carry it."],
      "student_answer": "The bag is so heavy that I can't carry it."
    }
    // ... 15 questions total
  ],
  "model": "claude-sonnet-4.5"
}
```

### Performance

| Metric | Value |
|---|---|
| Time per student (15 questions) | ~5-8 seconds |
| Time for 30 students | ~3-5 minutes |
| Cost per student (Claude 4.5) | ~NT$8-12 |
| Cost for class of 30 | ~NT$240-360 |

### Key Implementation Details

```javascript
// From sentence_grader_teacher.html

// Parse batch input: name followed by 15 answers
const lines = input.split('\n').map(l => l.trim()).filter(l => l);
const students = [];
let currentStudent = null;

for (const line of lines) {
    if (!currentStudent || currentStudent.answers.length === 15) {
        currentStudent = { name: line, answers: [] };
        students.push(currentStudent);
    } else {
        currentStudent.answers.push(line);
    }
}

// Validate all students have exactly 15 answers
const invalidStudents = students.filter(s => s.answers.length !== 15);
if (invalidStudents.length > 0) {
    alert(`以下學生答案數量不正確（需要15題）：\n${invalidStudents.map(
        s => `${s.name}: ${s.answers.length}題`
    ).join('\n')}`);
    return;
}

// Grade each student sequentially (with 500ms delay for rate limiting)
for (let i = 0; i < students.length; i++) {
    const student = students[i];

    // Show progress
    document.getElementById('loadingProgress').textContent =
        `正在批次評分 ${student.name} (${i + 1} / ${students.length})...`;

    // One batch API call per student (all 15 questions at once)
    const response = await fetch(`${API_BASE_URL}/api/grade-sentence-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: questionsToGrade, model: selectedModel })
    });

    // 500ms pause between students
    if (i < students.length - 1) {
        await new Promise(r => setTimeout(r, 500));
    }
}
```

---

## Part B: Essay Batch Grading (🚧 To Be Built)

### Design Spec

#### Option 1: Text-Based Batch (Simpler)

Teacher pastes multiple essays with student names:

```
Input format:

---王小明---
I like to play basketball. It is very fun. I play with my friends every weekend.
---李小華---
My favorite hobby is reading. I read books every day after school.
---陳大明---
I have a dog. His name is Lucky. He is very cute and I love him.
```

#### Option 2: Photo-Based Batch (More Useful)

Teacher uploads a folder of essay photos:

```
Upload multiple files:
  ├── 王小明.jpg
  ├── 李小華.jpg
  ├── 陳大明.jpg
  └── ... (30 photos)

Each photo is:
  1. Preprocessed (SK-004 preprocessing)
  2. OCR'd (SK-004)
  3. Graded (SK-001)
  4. Session saved (SK-008)
```

#### Option 3: Hybrid (Best UX)

```
Step 1: Upload photos or paste text (teacher's choice per student)
Step 2: Review OCR results (edit if needed)
Step 3: Click "Batch Grade All"
Step 4: See all results + download class report PDF
```

### Proposed Processing Flow

```
Teacher uploads 30 essay photos
  ↓
For each photo (parallel where possible):
  ├── preprocessImage() (SK-004 v1.1)
  ├── performBackendOCR() → text extracted
  └── Teacher reviews/edits OCR result
  ↓
Teacher clicks "批次評分 (Grade All)"
  ↓
For each essay (sequential, with progress):
  ├── POST /grade-fine-tuned { essay, model, level }
  ├── Save session (SK-008)
  ├── Progress: "正在評分 王小明 (3/30)..."
  └── 1s delay (rate limiting)
  ↓
All results displayed:
  ├── Summary table (name, score, key errors)
  ├── Export class report PDF
  ├── Export CSV (scores only)
  └── Individual PDF reports per student
```

### Proposed Backend Changes

**No new endpoints needed!** Batch processing calls existing endpoints in a loop:

| Step | Endpoint | Exists? |
|---|---|---|
| OCR each photo | `POST /OCR` | ✅ Already exists |
| Grade each essay | `POST /grade-fine-tuned` | ✅ Already exists |
| Save each session | `POST /api/save-session` | ✅ Already exists |

The batch logic lives entirely in the **frontend** — loop through students and call existing APIs.

### Proposed UI

**New page**: `essay_batch.html` (or new tab in `essay_grader.html`)

```
┌────────────────────────────────────────────────────────┐
│  🎯 批次作文評分 — Batch Essay Grading                  │
│  GEPT Elementary | AI: GPT-5.2                         │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Upload essays:                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  📁 Drag & drop photos here (or click to upload) │  │
│  │     Supports: JPG, PNG, HEIC                     │  │
│  │     Max: 50 photos per batch                     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  Or paste essays directly:                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ---王小明---                                     │  │
│  │  I like to play basketball...                     │  │
│  │  ---李小華---                                     │  │
│  │  My favorite hobby is reading...                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────┐  ┌────────────┐  ┌──────────────┐   │
│  │ 🎯 批次評分   │  │ 📊 匯出CSV  │  │ 📄 下載報告   │   │
│  └──────────────┘  └────────────┘  └──────────────┘   │
│                                                        │
│  Results:                                              │
│  ┌────────┬───────┬───────┬──────┬─────────────────┐  │
│  │ Student │ Score │ Words │ Errs │ Actions          │  │
│  ├────────┼───────┼───────┼──────┼─────────────────┤  │
│  │ 王小明  │ 3/5   │ 52    │ 4    │ [View] [PDF]    │  │
│  │ 李小華  │ 4/5   │ 48    │ 2    │ [View] [PDF]    │  │
│  │ 陳大明  │ 2/5   │ 38    │ 7    │ [View] [PDF]    │  │
│  │ ...     │       │       │      │                 │  │
│  └────────┴───────┴───────┴──────┴─────────────────┘  │
│                                                        │
│  Class Summary:                                        │
│  Average: 3.1/5 | Highest: 4/5 | Lowest: 2/5          │
│  Common Errors: Grammar (45%), Word Choice (30%)       │
└────────────────────────────────────────────────────────┘
```

---

## Pricing & Cost Analysis

### Cost per Batch (30 Students)

| Component | Per Student | Per Class of 30 |
|---|---|---|
| OCR (if photo upload) | NT$0.05 | NT$1.50 |
| Preprocessing | NT$0 (client-side) | NT$0 |
| Essay grading (GPT-5.2) | NT$10-15 | NT$300-450 |
| Session save | NT$0.01 | NT$0.30 |
| **Total** | **NT$10-15** | **NT$300-450** |

### Pricing

**Add-on**: +NT$3,000/month
- Includes up to 500 batch essays/month
- Overage: NT$15 per additional essay

**Margin at 500 essays/month**:
- Cost: ~NT$5,000-7,500
- Revenue: NT$3,000 (add-on) + NT$6,800-18,000 (base)
- Batch processing drives tier upgrades more than add-on revenue!

### The Real Value: Tier Upgrade Driver

```
Without batch:
  Teacher grades essays one at a time
  → Takes 2 hours for 30 students
  → Stays on Starter (NT$6,800)

With batch:
  Teacher grades all 30 in 5 minutes
  → Saves 115 minutes per class
  → Willing to pay Professional (NT$18,000)
  → Revenue increase: +NT$11,200/month!
```

**Batch processing doesn't just sell as a +NT$3,000 add-on — it's the reason schools upgrade from NT$6,800 to NT$18,000.**

---

## Dependencies

### Required Skills
- **SK-001**: GEPT Essay Grader (grades each essay)

### Optional Enhancements
- **SK-004**: OCR Handwriting (for photo-based batch upload)
- **SK-008**: Session Persistence (save each result + QR codes)
- **SK-003**: PDF Report (individual + class report)
- **SK-005**: Multi-Model AI (choose model for batch)
- **SK-006**: Multi-Level GEPT (select level for batch)

---

## Upsell Talking Points

### The 2-Hour vs 5-Minute Pitch

> "Right now you grade 30 essays one by one. Takes about 2 hours.
> With batch processing, upload all 30 photos, click one button,
> get all results in 5 minutes. That's 115 minutes saved per class.
> If you teach 3 classes a week, you save 6 hours every week."

### The ROI Calculation

```
Teacher hourly rate: ~NT$800-1,500/hour
Time saved per week: 6 hours
Value saved per week: NT$4,800-9,000
Monthly savings: NT$19,200-36,000

Your cost: NT$3,000 add-on (or upgrade to Professional NT$18,000)
ROI: 6.4x to 12x return on investment

→ "This feature pays for itself in the first week."
```

### Feature Comparison Table (for sales)

| Manual (No Batch) | With Batch |
|---|---|
| Grade 1 essay at a time | Grade 30+ at once |
| 2 hours per class | 5 minutes per class |
| No class summary | Class report with averages |
| Individual PDFs only | Bulk PDF download |
| Type each essay | Upload photos in bulk |
| No score comparison | See who needs help instantly |

---

## Implementation Priority

### Phase 1: Document Existing (✅ Done)
- Sentence batch grading is documented above

### Phase 2: Build Essay Batch — Text Mode (1-2 weeks)
- New page or tab in essay_grader.html
- Teacher pastes multiple essays with `---name---` separators
- Sequential grading with progress bar
- Summary table with scores
- **No backend changes needed**

### Phase 3: Build Essay Batch — Photo Mode (2-3 weeks)
- Multi-file upload (drag & drop)
- Parallel OCR processing
- Review step (edit OCR results before grading)
- One-click "Grade All"
- **No backend changes needed** (uses existing /OCR and /grade-fine-tuned)

### Phase 4: Class Reports (1 week)
- Class summary PDF (all students on one page)
- CSV export (import into Excel/Google Sheets)
- Error analysis across entire class

---

## Technical Notes

### Rate Limiting Strategy

```javascript
// Grade sequentially with delay to avoid overwhelming backend
for (let i = 0; i < essays.length; i++) {
    // Show progress
    updateProgress(`正在評分 ${essays[i].name} (${i + 1}/${essays.length})...`);

    // Grade this essay
    const result = await gradeEssay(essays[i]);
    results.push(result);

    // Rate limit: 1 second between requests
    if (i < essays.length - 1) {
        await new Promise(r => setTimeout(r, 1000));
    }
}
```

### Parallel OCR (Phase 3)

```javascript
// OCR can run in parallel (Google Cloud Vision handles concurrency)
const ocrPromises = photos.map(photo => performBackendOCR(photo));
const ocrResults = await Promise.all(ocrPromises);

// But grading should be sequential (costs more, needs rate limiting)
for (const essay of ocrResults) {
    const result = await gradeEssay(essay);
    // ...
}
```

### Error Handling

```javascript
// If one essay fails, continue grading the rest
for (const essay of essays) {
    try {
        const result = await gradeEssay(essay);
        results.push({ ...result, status: 'success' });
    } catch (error) {
        results.push({
            name: essay.name,
            status: 'failed',
            error: error.message
        });
        // Continue to next essay
    }
}
```

---

## Roadmap

### v1.0 — Sentence Batch (✅ Shipped)
- Batch grading for 15-question sentence tests
- Text-based input (paste student names + answers)
- Sequential processing with progress indicator

### v1.1 — Essay Batch Text Mode (🚧 Next)
- Paste multiple essays with `---name---` separators
- Sequential grading with progress
- Summary table + CSV export

### v2.0 — Essay Batch Photo Mode
- Multi-photo upload (drag & drop)
- Parallel OCR → sequential grading
- Review step before grading

### v2.1 — Class Reports
- Class summary PDF
- Error pattern analysis across students
- "Students who need help" highlighting

### v3.0 — Smart Batch
- Auto-detect student names from photos (OCR header)
- Auto-match photos to student roster
- Scheduled batch (grade overnight, results ready in morning)

---

## Changelog

### v1.0 — Sentence Batch (Production)
- ✅ Batch grading for sentence tests (15 questions × N students)
- ✅ Text-based input parsing
- ✅ Sequential processing with progress
- ✅ Per-student results display
- ✅ 500ms rate limiting between students
- ✅ Validation (exactly 15 answers per student)

---

## Support

For batch processing issues:
- **Rate limit errors**: Increase delay between students
- **Timeout errors**: Reduce batch size (max 50 students recommended)
- **Wrong results**: Verify answer parsing (one answer per line)
