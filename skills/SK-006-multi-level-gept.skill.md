# Multi-Level GEPT Support Skill

**Skill ID**: SK-006
**Category**: Premium Add-on
**Pricing**: +NT$3,500/month
**Status**: ✅ Production Ready
**Last Updated**: 2025-02-17 (v1.0)

---

## Purpose

Extends the base essay grader (SK-001) beyond Elementary level to support all three GEPT writing levels. Each level uses different word-count targets, scoring criteria, and AI prompts optimised for that level's expectations.

---

## GEPT Context

From the official GEPT test structure, the **Writing module (Second Stage)** covers:

| Part | Task | Level Coverage |
|---|---|---|
| Part 1 | Sentence Writing (16 questions) | All levels → handled by SK-014 |
| Part 2 | Paragraph Writing (essay) | All levels → handled by SK-001 + SK-006 |

---

## Levels Supported

| Level | CEFR | Value | Word Count | Base Package? |
|---|---|---|---|---|
| **Elementary** | A2 | `elementary` | ~50 words | ✅ Included in base |
| **Intermediate** | B1 | `intermediate` | ~120 words | 🔒 Requires SK-006 |
| **High-Intermediate** | B2 | `high-intermediate` | ~150-180 words | 🔒 Requires SK-006 |

---

## How It Works

The selected level is sent as a parameter alongside the essay to the backend. The backend selects a different prompt for each level, calibrating the AI's expectations for vocabulary complexity, grammar range, and essay structure.

```javascript
// Frontend sends:
{
  "essay": "...",
  "level": "intermediate",  // ← level selector
  "model": "gpt-5.2"
}

// Backend selects prompt:
const promptsByLevel = {
  elementary:        "Grade this GEPT Elementary (A2) essay. Expected ~50 words...",
  intermediate:      "Grade this GEPT Intermediate (B1) essay. Expected ~120 words...",
  "high-intermediate": "Grade this GEPT High-Intermediate (B2) essay. Expected ~150-180 words..."
};
```

---

## UI Component (essay_grader.html)

```html
<select id="levelSelect">
  <option value="elementary">Elementary (A2) - 初級 ~50字</option>
  <option value="intermediate">Intermediate (B1) - 中級 ~120字</option>
  <option value="high-intermediate">High-Intermediate (B2) - 中高級 ~150-180字</option>
</select>
```

Dynamic info text updates on change:
```javascript
const levelInfoText = {
  'elementary':        '📝 Elementary (A2) 初級 | 預期字數約 50 字',
  'intermediate':      '📝 Intermediate (B1) 中級 | 預期字數約 120 字',
  'high-intermediate': '📝 High-Intermediate (B2) 中高級 | 預期字數約 150-180 字'
};
```

---

## Grading Criteria per Level

### Elementary (A2) — Base Package
- Basic sentence structures
- Simple vocabulary
- Can communicate simple ideas
- Errors tolerated if meaning is clear

### Intermediate (B1) — SK-006 Required
- Paragraph organisation expected
- Wider vocabulary range
- Fewer critical grammar errors expected
- Some complex sentences expected

### High-Intermediate (B2) — SK-006 Required
- Well-organised paragraphs with transitions
- Rich vocabulary and idiomatic expressions
- Complex grammar (conditionals, passive voice)
- Clear introduction, body, conclusion structure

---

## White-Label Customisation

Per customer you can:
- **Restrict levels** — e.g., Elementary-only for a primary school
- **Show only relevant levels** — hide levels the school doesn't teach
- **Rename levels** — e.g., "Junior" / "Senior" instead of CEFR labels

---

## Dependencies

### Required Skills
- **SK-001**: GEPT Essay Grader (SK-006 extends it)

---

## Pricing Rationale

Higher-level essays are longer and more complex:

| Level | Essay Length | AI Cost | Your Base Cost |
|---|---|---|---|
| Elementary | ~50 words | NT$5 | NT$5 |
| Intermediate | ~120 words | NT$8 | NT$8 |
| High-Intermediate | ~180 words | NT$12 | NT$12 |

SK-006 is priced at +NT$3,500/month — well above the marginal AI cost increase — because it unlocks a larger student population (older students, more serious test-takers).

---

## Changelog

### v1.0 — Initial Release
- Three GEPT levels supported (Elementary, Intermediate, High-Intermediate)
- Level-specific prompts on backend
- Dynamic UI info text per level
- Elementary included in base; Intermediate + High-Intermediate require SK-006
