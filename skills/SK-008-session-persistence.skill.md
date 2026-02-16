# Session Persistence Skill

**Skill ID**: SK-008
**Category**: Premium Add-on
**Pricing**: +NT$1,500/month
**Status**: ✅ Production Ready

---

## Purpose

Save grading sessions to database with QR code generation, enabling students to review their grading results later and teachers to access historical data.

---

## Features

- ✅ PostgreSQL database storage
- ✅ Unique session IDs
- ✅ QR code generation (student access)
- ✅ Shareable review URLs
- ✅ Optional student names
- ✅ Timestamp tracking
- ✅ Session retrieval by ID
- ✅ Data retention (customizable)

---

## Use Cases

### Use Case 1: Student Self-Review
**Scenario**: Student wants to review grading results at home

**Flow**:
```
1. Teacher grades essay → Session saved
2. System generates QR code
3. Student scans QR code with phone
4. Student views detailed grading report
5. Student can download PDF anytime
```

### Use Case 2: Parent Portal
**Scenario**: Parent wants to see child's progress

**Flow**:
```
1. Teacher sends session URL to parent
2. Parent opens link (no login required)
3. Parent sees essay, errors, score, suggestions
4. Parent can print report
```

### Use Case 3: Progress Tracking
**Scenario**: Teacher wants to see student improvement over time

**Flow**:
```
1. Teacher views student profile
2. System shows all sessions for this student
3. Teacher compares scores: Week 1 (2/5) → Week 8 (4/5)
4. Teacher identifies common error patterns
```

---

## Input Schema

### Save Session

```json
{
  "gradingData": {
    "error_statistics": { "critical": 2, "medium": 1, "minor": 0 },
    "sentence_error_analysis": [...],
    "revised_versions": {...},
    "gept_rating": {...},
    "improvement_suggestions": {...},
    "main_error_types_statistics": {...}
  },
  "originalEssay": "string (required) - Original essay text",
  "studentName": "string (optional) - Student name for display"
}
```

### Example Request

```json
{
  "gradingData": {
    "gept_rating": {
      "score": 3,
      "comment": "Shows good basic communication with some errors"
    },
    "error_statistics": {
      "critical": 1,
      "medium": 2,
      "minor": 1
    }
  },
  "originalEssay": "I like to play basketball. It is very fun.",
  "studentName": "王小明"
}
```

---

## Output Schema

### Save Response

```json
{
  "success": true,
  "sessionId": "abc123def456",
  "qrCodeDataUrl": "data:image/png;base64,iVBORw0KGgo...",
  "studentUrl": "https://your-domain.com/student_review.html?session=abc123def456",
  "createdAt": "2025-02-17T10:30:00Z"
}
```

### Retrieve Response

```json
{
  "success": true,
  "session": {
    "sessionId": "abc123def456",
    "studentName": "王小明",
    "originalEssay": "I like to play basketball. It is very fun.",
    "gradingData": {...},
    "createdAt": "2025-02-17T10:30:00Z"
  }
}
```

---

## API Endpoints

### 1. Save Session

**URL**: `https://railway-backend-production-55cf.up.railway.app/api/save-session`
**Method**: `POST`
**Headers**: `Content-Type: application/json`

```bash
curl -X POST https://railway-backend-production-55cf.up.railway.app/api/save-session \
  -H "Content-Type: application/json" \
  -d '{
    "gradingData": {...},
    "originalEssay": "I like to play basketball.",
    "studentName": "王小明"
  }'
```

### 2. Get Session

**URL**: `https://railway-backend-production-55cf.up.railway.app/api/get-session/:sessionId`
**Method**: `GET`

```bash
curl https://railway-backend-production-55cf.up.railway.app/api/get-session/abc123def456
```

---

## Database Schema

### PostgreSQL Table: `grading_sessions`

```sql
CREATE TABLE grading_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  student_name VARCHAR(255),
  original_essay TEXT NOT NULL,
  grading_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Optional fields for future features
  teacher_id INTEGER,
  school_id INTEGER,
  deleted_at TIMESTAMP NULL,

  -- Indexes for performance
  INDEX idx_session_id (session_id),
  INDEX idx_student_name (student_name),
  INDEX idx_created_at (created_at)
);
```

---

## Frontend Integration

### Save Session (from essay_grader.html)

```javascript
async function downloadPDF() {
  if (!analysisResult) {
    alert('No grading results to save');
    return;
  }

  // Open window immediately (iOS Safari fix)
  const printWindow = window.open('about:blank', '_blank');

  try {
    // Get student name
    const studentName = document.getElementById('studentName').value.trim();

    // Save session to backend
    const response = await fetch('https://railway-backend-production-55cf.up.railway.app/api/save-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gradingData: analysisResult,
        originalEssay: essayText,
        studentName: studentName || null
      })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Save failed');
    }

    console.log('✅ Session saved:', data.sessionId);

    // Navigate to print page with session ID
    printWindow.location.href = `printable_report.html?session=${data.sessionId}`;

  } catch (error) {
    console.error('Error saving session:', error);
    printWindow.document.body.innerHTML = `
      <div style="text-align:center;padding:40px;">
        <h2 style="color:#dc2626;">❌ Error</h2>
        <p>Failed to save session. Please try again.</p>
      </div>
    `;
  }
}
```

### Retrieve Session (from student_review.html)

```javascript
async function loadSession() {
  // Get session ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session');

  if (!sessionId) {
    alert('No session ID provided');
    return;
  }

  try {
    const response = await fetch(`https://railway-backend-production-55cf.up.railway.app/api/get-session/${sessionId}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Session not found');
    }

    // Display session data
    displayGradingResults(data.session);

  } catch (error) {
    console.error('Error loading session:', error);
    alert('Failed to load grading results');
  }
}

// Load session on page load
window.onload = loadSession;
```

---

## QR Code Generation

### Backend Implementation (Node.js)

```javascript
const QRCode = require('qrcode');

app.post('/api/save-session', async (req, res) => {
  try {
    const { gradingData, originalEssay, studentName } = req.body;

    // Generate unique session ID
    const sessionId = generateUniqueId(); // e.g., uuid or nanoid

    // Save to database
    await db.query(
      'INSERT INTO grading_sessions (session_id, student_name, original_essay, grading_data) VALUES ($1, $2, $3, $4)',
      [sessionId, studentName, originalEssay, JSON.stringify(gradingData)]
    );

    // Generate student review URL
    const studentUrl = `https://your-domain.com/student_review.html?session=${sessionId}`;

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(studentUrl);

    res.json({
      success: true,
      sessionId,
      qrCodeDataUrl,
      studentUrl,
      createdAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Save session error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

---

## Pricing & Cost Analysis

### Infrastructure Costs

| Component | Service | Cost |
|---|---|---|
| Database | Railway PostgreSQL | NT$150/month (Hobby plan) |
| Storage | 1GB data storage | Included |
| Bandwidth | < 100GB/month | Included |
| **Total Cost** | - | **NT$150/month** |

### Pricing Tiers

**Starter Tier** (+NT$1,500/month):
- Store up to 1,000 sessions
- 30-day data retention
- Basic QR codes

**Professional Tier** (included in NT$18,000/month):
- Store up to 10,000 sessions
- 1-year data retention
- Custom QR code branding

**Enterprise Tier** (included in NT$38,000/month):
- Unlimited sessions
- Permanent data retention
- Advanced analytics on sessions
- Export all sessions to CSV

---

## Data Retention Policies

### Default Retention

| Tier | Retention Period | Auto-Delete After |
|---|---|---|
| Starter | 30 days | Session deleted after 30 days |
| Professional | 1 year | Session deleted after 365 days |
| Enterprise | Permanent | Never deleted (unless requested) |

### Compliance

- **GDPR**: Students can request session deletion
- **台灣個資法**: Data stored in Taiwan region (Railway Asia-Pacific)
- **Backup**: Daily automated backups (7-day retention)

---

## Security

### Access Control

- ✅ Sessions accessible via unique ID only (no listing endpoint)
- ✅ No authentication required (public read access via URL)
- ⚠️ URLs should be treated as sensitive (contains student data)

### Privacy Considerations

**What's Stored**:
- ✅ Essay text
- ✅ Grading results
- ✅ Student name (optional)
- ❌ NO email addresses
- ❌ NO login credentials
- ❌ NO payment information

**Sharing**:
- Session URLs can be shared freely
- QR codes can be printed/emailed
- Teachers should warn students not to share publicly

---

## Dependencies

### Required Skills
- **SK-001**: GEPT Essay Grader (generates data to save)

### Works Best With
- **SK-003**: Basic PDF Report (download saved sessions)
- **SK-010**: Progress Analytics (track multiple sessions over time)
- **SK-011**: Parent Portal (parents access saved sessions)

### Technical Dependencies
- PostgreSQL database
- QR code library (qrcode npm package)
- UUID generator

---

## Usage Examples

### Example 1: Teacher Grades Essay

```javascript
// 1. Grade essay (SK-001)
const gradingResult = await gradeEssay(essayText);

// 2. Save session (SK-008)
const session = await fetch('/api/save-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    gradingData: gradingResult,
    originalEssay: essayText,
    studentName: '王小明'
  })
});

// 3. Show QR code to student
displayQRCode(session.qrCodeDataUrl);
console.log('Student can review at:', session.studentUrl);
```

### Example 2: Student Reviews Results

```javascript
// Student scans QR code or clicks link
// URL: https://your-domain.com/student_review.html?session=abc123

// Page loads and fetches session
const sessionId = new URLSearchParams(window.location.search).get('session');
const response = await fetch(`/api/get-session/${sessionId}`);
const data = await response.json();

// Display results
document.getElementById('essay').textContent = data.session.originalEssay;
document.getElementById('score').textContent = data.session.gradingData.gept_rating.score;
```

---

## Performance Metrics

| Metric | Value |
|---|---|
| Save Session Time | < 200ms |
| Retrieve Session Time | < 100ms |
| QR Code Generation | < 50ms |
| Database Query Time | < 50ms |
| Max Concurrent Saves | 100/second |

---

## Monitoring & Analytics

### Key Metrics to Track

```sql
-- Total sessions created
SELECT COUNT(*) FROM grading_sessions;

-- Sessions per day (last 30 days)
SELECT DATE(created_at) as date, COUNT(*) as sessions
FROM grading_sessions
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date;

-- Average score over time
SELECT DATE(created_at) as date,
       AVG(CAST(grading_data->>'gept_rating'->>'score' AS INTEGER)) as avg_score
FROM grading_sessions
GROUP BY DATE(created_at);

-- Most common student names (leaderboard)
SELECT student_name, COUNT(*) as essay_count
FROM grading_sessions
WHERE student_name IS NOT NULL
GROUP BY student_name
ORDER BY essay_count DESC
LIMIT 10;
```

---

## Error Handling

### Common Errors

```json
// Missing required fields
{
  "success": false,
  "error": "gradingData and originalEssay are required"
}

// Session not found
{
  "success": false,
  "error": "Session not found"
}

// Database connection error
{
  "success": false,
  "error": "Database connection failed"
}

// Quota exceeded (Starter tier)
{
  "success": false,
  "error": "Session storage limit reached. Please upgrade to Professional tier."
}
```

---

## Upsell Talking Points

### Why Schools Should Buy This Add-on

1. **Student Engagement**
   - "Students can review their mistakes at home"
   - "QR code makes it easy to share results"

2. **Parent Communication**
   - "Parents see exactly what their child needs to improve"
   - "No need to print and send home paper reports"

3. **Progress Tracking**
   - "See student improvement over weeks/months"
   - "Identify students who need extra help"

4. **Compliance**
   - "Keep grading records for audits"
   - "Export data for school reports"

---

## Roadmap

### Planned Enhancements

- **v2.0** (Q2 2025): Bulk session export (CSV/Excel)
- **v2.1** (Q3 2025): Session comparison (compare 2 essays side-by-side)
- **v2.2** (Q4 2025): Email notifications (auto-send results to students)
- **v3.0** (2026): Mobile app (view sessions on iOS/Android)

---

## Support

For session persistence issues:
- **Database errors**: Check Railway PostgreSQL status
- **QR codes not working**: Verify URL is accessible
- **Data retention**: Contact support@your-domain.com
