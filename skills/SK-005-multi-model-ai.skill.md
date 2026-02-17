# Multi-Model AI Selection Skill

**Skill ID**: SK-005
**Category**: Premium Add-on
**Pricing**: +NT$1,000/month
**Status**: ✅ Production Ready
**Last Updated**: 2025-02-17 (v1.0)

---

## Purpose

Lets teachers choose which AI model grades their students' work. Different models offer different trade-offs between speed, cost, and grading depth.

---

## Available Models

### Essay Grader (SK-001)

| Model | Value | Strengths | Speed |
|---|---|---|---|
| **GPT-5.2** | `gpt-5.2` | Latest flagship, 30% fewer hallucinations | 8-12s |
| **GPT-5.1** | `gpt-5.1` | Fast and strong, recommended default | 6-10s |
| **GPT-5 mini** | `gpt-5-mini` | Budget-friendly, good for high volume | 3-5s |
| **Claude 4.5 Sonnet** | `claude-sonnet-4.5` | Deep language analysis, Anthropic | 10-15s |
| **Fine-tuned GPT-4o** | `fine-tuned` | Custom-trained on GEPT data | 8-12s |

### Sentence Grader (SK-014)

| Model | Value | Notes |
|---|---|---|
| **Claude Sonnet 4.5** | `claude-sonnet-4.5` | Default, excellent for sentence tasks |
| **GPT-5.2** | `gpt-5.2` | Alternative, faster |

---

## How It Works

The selected model value is sent as a parameter to the backend on every grading request. The backend maps the value to the actual API call.

```javascript
// Frontend sends:
{
  "essay": "I like play basketball...",
  "level": "elementary",
  "model": "gpt-5.2"   // ← this is the model selector
}

// Backend maps to actual OpenAI/Anthropic API call
const modelMap = {
  'gpt-5.2': 'gpt-5.2',
  'gpt-5.1': 'gpt-5.1',
  'gpt-5-mini': 'gpt-5-mini',
  'claude-sonnet-4.5': 'claude-sonnet-4.5',
  'fine-tuned': process.env.FINE_TUNED_MODEL_ID
};
```

---

## UI Component

### Essay Grader Dropdown (essay_grader.html)

```html
<select id="modelSelect">
  <option value="gpt-5.2">GPT-5.2 (最新 - 更少幻覺)</option>
  <option value="gpt-5.1">GPT-5.1 (推薦 - 更快更強)</option>
  <option value="gpt-5-mini">GPT-5 mini (經濟實惠)</option>
  <option value="claude-sonnet-4.5">Claude 4.5 Sonnet (深度分析)</option>
  <option value="fine-tuned">Fine-tuned GPT-4o (詳細分析 - 較慢)</option>
</select>
```

### Sentence Grader Dropdown (sentence_grader_teacher.html)

```html
<select id="modelSelect" onchange="updateModelDisplay()">
  <option value="claude-sonnet-4.5">Claude Sonnet 4.5</option>
  <option value="gpt-5.2">GPT 5.2</option>
</select>
```

---

## Cost Per Grading (Approximate)

| Model | Input cost | Output cost | Total (NTD) |
|---|---|---|---|
| GPT-5.2 | High | High | ~NT$15 |
| GPT-5.1 | High | High | ~NT$12 |
| GPT-5 mini | Low | Low | ~NT$3 |
| Claude 4.5 Sonnet | High | High | ~NT$18 |
| Fine-tuned GPT-4o | High | High | ~NT$20 |

---

## White-Label Customisation

Per customer you can:
- **Hide models** they don't need (e.g., remove Fine-tuned for schools that don't need it)
- **Set a default model** per school (e.g., always use GPT-5-mini for high-volume schools)
- **Lock the model** (remove dropdown entirely, use fixed model in backend)

---

## Dependencies

### Works With
- **SK-001**: GEPT Essay Grader (passes model to grading endpoint)
- **SK-014**: Sentence Grader (passes model to sentence grading endpoint)

---

## Changelog

### v1.0 — Initial Release
- 5 models available for essay grading
- 2 models available for sentence grading
- Dynamic info text updates when model is changed
