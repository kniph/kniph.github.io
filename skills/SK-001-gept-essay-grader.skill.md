# GEPT Essay Grader Skill

**Skill ID**: SK-001
**Category**: Core
**Pricing**: Included in base package (NT$6,800/month)
**Status**: ✅ Production Ready

---

## Purpose

AI-powered essay grading system for GEPT (General English Proficiency Test) with detailed error analysis, scoring, and improvement suggestions.

---

## Features

- ✅ Multi-level support (Elementary A2, Intermediate B1, High-Intermediate B2)
- ✅ Multi-model AI (GPT-5.2, GPT-5.1, Claude 4.5 Sonnet, Fine-tuned GPT-4o)
- ✅ Detailed error analysis (critical/medium/minor classification)
- ✅ Sentence-by-sentence error breakdown
- ✅ Revised versions (basic correction + advanced model answer)
- ✅ GEPT score (0-5 scale)
- ✅ Tiered improvement suggestions (immediate/mid-term/long-term)
- ✅ Error type statistics (grammar, word choice, logic, spelling, etc.)

---

## Input Schema

```json
{
  "essay": "string (required) - Student's essay text",
  "level": "enum (optional) - elementary|intermediate|high-intermediate (default: elementary)",
  "model": "enum (optional) - gpt-5.2|gpt-5.1|gpt-5-mini|claude-sonnet-4.5|fine-tuned (default: gpt-5.2)"
}
```

### Example Request

```json
{
  "essay": "I like play basketball. It very fun and I playing with my friend every weekend.",
  "level": "elementary",
  "model": "gpt-5.2"
}
```

---

## Output Schema

```json
{
  "success": true,
  "result": {
    "error_statistics": {
      "critical": 2,
      "medium": 1,
      "minor": 0
    },
    "sentence_error_analysis": [
      {
        "location": "I like play basketball",
        "issue": "Missing 'to' before infinitive verb. Should be 'I like to play basketball' or 'I like playing basketball'."
      },
      {
        "location": "It very fun",
        "issue": "Missing verb 'is'. Should be 'It is very fun'."
      }
    ],
    "revised_versions": {
      "basic_correction": "I like to play basketball. It is very fun and I play with my friends every weekend.",
      "advanced_model_answer": "I enjoy playing basketball. It's really enjoyable, and I play with my friends every weekend."
    },
    "gept_rating": {
      "score": 2,
      "comment": "Elementary level (A2). Shows basic communication but has grammar errors that affect clarity."
    },
    "improvement_suggestions": {
      "immediate": "Practice using 'to' with infinitive verbs (like to play, like to eat)",
      "mid_term": "Study present simple vs present continuous tenses",
      "long_term": "Expand vocabulary for expressing preferences and hobbies"
    },
    "main_error_types_statistics": {
      "grammar": 2,
      "word_choice": 1,
      "spelling": 0,
      "punctuation": 0,
      "logic": 0,
      "chinglish": 0
    }
  },
  "model_used": "gpt-5.2"
}
```

---

## API Endpoint

**URL**: `https://railway-backend-production-55cf.up.railway.app/grade-fine-tuned`
**Method**: `POST`
**Headers**: `Content-Type: application/json`

### cURL Example

```bash
curl -X POST https://railway-backend-production-55cf.up.railway.app/grade-fine-tuned \
  -H "Content-Type: application/json" \
  -d '{
    "essay": "I like play basketball. It very fun.",
    "level": "elementary",
    "model": "gpt-5.2"
  }'
```

---

## Pricing per Level

| GEPT Level | Word Count | Complexity | AI Cost (NTD) | Your Price (NTD) |
|---|---|---|---|---|
| Elementary (A2) | ~50 words | Low | NT$5 | Included in base |
| Intermediate (B1) | ~120 words | Medium | NT$8 | Included in Pro tier |
| High-Intermediate (B2) | ~180 words | High | NT$12 | Included in Enterprise |

---

## Dependencies

### Required Skills
- None (standalone skill)

### Optional Enhancement Skills
- **SK-004**: OCR Handwriting Recognition (for photo uploads)
- **SK-005**: Multi-Model AI Selection (already included)
- **SK-006**: Multi-Level GEPT Support (already included)
- **SK-008**: Session Persistence (to save results)

---

## Configuration

### Environment Variables (Backend)

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
FINE_TUNED_MODEL_ID=ft:gpt-4o-2024-08-06:...
```

### Prompt Customization

Different prompts per GEPT level (in backend `server.js`):

```javascript
const promptsByLevel = {
  elementary: "Grade this GEPT Elementary (A2) essay. Expected ~50 words...",
  intermediate: "Grade this GEPT Intermediate (B1) essay. Expected ~120 words...",
  "high-intermediate": "Grade this GEPT High-Intermediate (B2) essay. Expected ~180 words..."
};
```

---

## Usage Examples

### Frontend Integration (HTML/JS)

```javascript
async function gradeEssay() {
  const response = await fetch('https://railway-backend-production-55cf.up.railway.app/grade-fine-tuned', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      essay: document.getElementById('essayInput').value,
      level: document.getElementById('levelSelect').value,
      model: document.getElementById('modelSelect').value
    })
  });

  const data = await response.json();
  displayResults(data.result);
}
```

### Python Integration

```python
import requests

response = requests.post(
    'https://railway-backend-production-55cf.up.railway.app/grade-fine-tuned',
    json={
        'essay': 'I like play basketball. It very fun.',
        'level': 'elementary',
        'model': 'gpt-5.2'
    }
)

result = response.json()
print(f"Score: {result['result']['gept_rating']['score']}/5")
```

---

## Performance Metrics

| Model | Avg Response Time | Cost per Essay | Quality Score |
|---|---|---|---|
| GPT-5.2 | 8-12 seconds | NT$15 | ⭐⭐⭐⭐⭐ (最新) |
| GPT-5.1 | 6-10 seconds | NT$12 | ⭐⭐⭐⭐⭐ (推薦) |
| GPT-5-mini | 3-5 seconds | NT$3 | ⭐⭐⭐⭐ (經濟) |
| Claude 4.5 | 10-15 seconds | NT$18 | ⭐⭐⭐⭐⭐ (深度分析) |
| Fine-tuned | 8-12 seconds | NT$20 | ⭐⭐⭐⭐⭐ (GEPT專用) |

---

## Error Handling

### Common Errors

```json
// Empty essay
{
  "success": false,
  "error": "Essay text is required"
}

// Invalid level
{
  "success": false,
  "error": "Invalid level. Must be: elementary, intermediate, or high-intermediate"
}

// API rate limit
{
  "success": false,
  "error": "Rate limit exceeded. Please try again in 60 seconds."
}
```

### Robust JSON Parsing

Frontend includes fallback parser for malformed AI responses:

```javascript
function parseRobustJSON(response) {
  try {
    return JSON.parse(response);
  } catch (e) {
    // Extract from markdown code blocks
    // Fix trailing commas
    // Return partial data with fallback
  }
}
```

---

## Testing

### Test Cases

```bash
# Test 1: Perfect elementary essay
Essay: "I like to play basketball. It is very fun. I play with my friends every weekend."
Expected Score: 4-5

# Test 2: Elementary with errors
Essay: "I like play basketball. It very fun."
Expected Score: 2-3
Expected Errors: 2+ critical/medium

# Test 3: Empty essay
Essay: ""
Expected: Error message
```

---

## Changelog

- **v3.0** (2025-01): Added GPT-5.2 and Claude 4.5 Sonnet support
- **v2.5** (2024-12): Added multi-level GEPT support (Elementary/Intermediate/High-Intermediate)
- **v2.0** (2024-11): Migrated to Railway backend
- **v1.5** (2024-10): Added robust JSON parser
- **v1.0** (2024-09): Initial release with fine-tuned GPT-4o

---

## Support

For technical issues or customization requests:
- **Email**: support@your-domain.com
- **Documentation**: https://your-docs-site.com/gept-grader
- **Status Page**: https://status.your-domain.com
