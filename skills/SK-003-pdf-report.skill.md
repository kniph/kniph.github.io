# PDF Report Skill

**Skill ID**: SK-003
**Category**: Core (Base Package)
**Pricing**: Included in all tiers
**Status**: ✅ Production Ready
**Last Updated**: 2025-02-17 (v1.0)

---

## Purpose

Generate a printable, downloadable PDF report for a graded essay or sentence test. Two variants exist — one for essays (SK-001) and one for sentence grading (SK-014).

---

## Variants

| Variant | File | Session API | Used By |
|---|---|---|---|
| **Essay Report** | `printable_report.html` | `/api/get-session/:id` | SK-001 (Essay Grader) |
| **Sentence Report** | `printable_sentence_report.html` | `/api/get-sentence-session/:id` | SK-014 (Sentence Grader) |

---

## Features

- ✅ Full grading results in print-ready layout
- ✅ Student name in title and header
- ✅ QR code embedded (student can re-access online)
- ✅ Session ID for record-keeping
- ✅ Error analysis with corrections
- ✅ GEPT score prominently displayed
- ✅ Improvement suggestions
- ✅ iOS Safari compatible (window opened before async to bypass popup blocker)
- ✅ Auto-print dialog on load (`window.print()`)
- ✅ Branded with school logo/colours when SK-012 is enabled

---

## How It Works

```
Teacher clicks "下載PDF報告"
  ↓
New browser window opens immediately
  (iOS Safari requires this BEFORE async calls)
  ↓
Session data POSTed to /api/save-session
  ↓
Backend returns sessionId
  ↓
New window navigates to:
  printable_report.html?session={sessionId}
  ↓
Report page fetches session data
  ↓
Report rendered in print-friendly CSS
  ↓
window.print() fires automatically after 1 second
  ↓
User saves as PDF / prints
```

---

## URL Schema

### Essay Report
```
https://kniph.github.io/printable_report.html?session={sessionId}
```

### Sentence Report
```
https://kniph.github.io/printable_sentence_report.html?session={sessionId}
```

---

## Essay Report Sections

1. **Header** — School branding, student name, date, session ID
2. **GEPT Score** — Large score display with comment
3. **Original Essay** — Full student text
4. **Error Analysis** — Each error with location, issue, correction
5. **Revised Versions** — Basic correction + advanced model answer
6. **Improvement Suggestions** — Three-tier (immediate / mid-term / long-term)
7. **QR Code** — Link back to interactive review (SK-002)

## Sentence Report Sections

1. **Header** — School branding, student name, date, test ID
2. **Summary** — Total questions, score, time taken
3. **Question-by-question results** — Original answer, correct answer, explanation
4. **QR Code** — Link back to results

---

## iOS Safari Fix (Important)

```javascript
// ✅ Window must open BEFORE any async/await
// Otherwise iOS Safari blocks the popup
async function downloadPDF() {
    const printWindow = window.open('about:blank', '_blank'); // ← FIRST

    if (!printWindow) {
        alert('請允許彈出式視窗以下載PDF報告');
        return;
    }

    // Show loading in new window
    printWindow.document.write(`<html><body>正在準備...</body></html>`);

    try {
        // NOW do async work
        const response = await fetch('/api/save-session', { ... });
        const data = await response.json();

        // Navigate the already-opened window
        printWindow.location.href = `printable_report.html?session=${data.sessionId}`;

    } catch (error) {
        printWindow.document.body.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}
```

---

## Dependencies

### Required Skills
- **SK-008**: Session Persistence (provides session data to render)

### Works With
- **SK-001**: GEPT Essay Grader (essay PDF)
- **SK-014**: Sentence Grader (sentence PDF)
- **SK-012**: Custom Branding (school letterhead on PDF)

---

## Changelog

### v1.0 — Initial Release
- Essay PDF report (`printable_report.html`)
- Sentence PDF report (`printable_sentence_report.html`)
- iOS Safari popup fix
- QR code embedded in report
- Auto-print on load
