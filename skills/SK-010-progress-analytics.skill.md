# Progress Analytics Skill

**Skill ID**: SK-010
**Category**: Premium Add-on (Professional+)
**Pricing**: +NT$4,000/month
**Status**: 🚧 In Development (Q2 2025)

---

## Purpose

Track student progress over time with visual dashboards, charts, and insights. Helps teachers identify trends, improvement patterns, and students who need extra help.

---

## Features

- ✅ Student progress timeline (score over time)
- ✅ Error trend analysis (common mistakes)
- ✅ Class-wide statistics (average score, improvement rate)
- ✅ Individual student profiles
- ✅ Comparison charts (before/after)
- ✅ Exportable reports (PDF, CSV, Excel)
- ✅ Customizable date ranges
- ✅ Automated insights ("王小明 improved by 2 levels!")
- ✅ Teacher dashboards (all students at a glance)

---

## Use Cases

### Use Case 1: Track Individual Student Progress
**Scenario**: Teacher wants to see if 王小明 is improving

**Dashboard View**:
```
┌──────────────────────────────────────────────────┐
│  王小明's Progress (Last 8 Weeks)                 │
├──────────────────────────────────────────────────┤
│                                                  │
│  Score  5 ┤                              ●      │
│         4 ┤                      ●     ●        │
│         3 ┤            ●     ●                  │
│         2 ┤      ●   ●                          │
│         1 ┤  ●                                  │
│         0 ┴──────────────────────────────────── │
│           W1  W2  W3  W4  W5  W6  W7  W8       │
│                                                  │
│  📈 Improvement: +3 levels in 8 weeks            │
│  🎯 Most improved area: Grammar (75% fewer errors)│
│  ⚠️ Still needs work: Word choice               │
└──────────────────────────────────────────────────┘
```

---

### Use Case 2: Class Performance Dashboard
**Scenario**: Teacher wants to see how entire class is doing

**Class Dashboard**:
```
┌──────────────────────────────────────────────────┐
│  Class: Tuesday 5PM (15 students)                │
├──────────────────────────────────────────────────┤
│  Average Score: 3.2/5 (↑ 0.8 from last month)   │
│  Total Essays Graded: 120                        │
│  Improvement Rate: 68% of students improved      │
│                                                  │
│  Top Performers:                                 │
│  🥇 李小華 (4.8 avg)                             │
│  🥈 陳大明 (4.5 avg)                             │
│  🥉 張小美 (4.2 avg)                             │
│                                                  │
│  Needs Attention:                                │
│  ⚠️ 王小強 (1.5 avg, no improvement)            │
│  ⚠️ 林小婷 (2.1 avg, declining)                 │
│                                                  │
│  Common Errors:                                  │
│  #1 Grammar (45% of students)                    │
│  #2 Word Choice (32% of students)                │
│  #3 Spelling (18% of students)                   │
└──────────────────────────────────────────────────┘
```

---

### Use Case 3: Parent-Teacher Conference
**Scenario**: Teacher shows parent detailed progress report

**Printable Report**:
```pdf
┌─────────────────────────────────────────────────┐
│  王小明 - 學期進度報告                           │
│  Period: 2024-09-01 to 2025-02-01               │
├─────────────────────────────────────────────────┤
│                                                 │
│  Overall Progress:           ★★★★☆ (Excellent) │
│  Starting Score (Sep):       2.1/5              │
│  Current Score (Feb):        4.3/5              │
│  Improvement:                +2.2 levels        │
│                                                 │
│  Essays Completed:           16                 │
│  Average Word Count:         62 words           │
│  Attendance:                 94%                │
│                                                 │
│  Strengths:                                     │
│  ✅ Grammar significantly improved              │
│  ✅ Vocabulary expanding steadily               │
│  ✅ Consistent improvement trend                │
│                                                 │
│  Areas for Improvement:                         │
│  📝 Complex sentence structures                 │
│  📝 Essay organization (intro/body/conclusion)  │
│                                                 │
│  Teacher Comments:                              │
│  "王小明 shows excellent dedication and steady   │
│   improvement. Continue practicing writing      │
│   2-3 essays per week to maintain momentum."    │
│                                                 │
│  Next Steps:                                    │
│  1. Practice GEPT Intermediate level essays     │
│  2. Focus on using conjunctions (but, however)  │
│  3. Read more English books (30min/day)         │
└─────────────────────────────────────────────────┘
```

---

## Data Sources

### Required: Session Persistence (SK-008)

Progress analytics depends on saved grading sessions:

```sql
-- Get all sessions for a student
SELECT
  session_id,
  created_at,
  grading_data->>'gept_rating'->'score' as score,
  grading_data->>'error_statistics' as errors
FROM grading_sessions
WHERE student_name = '王小明'
ORDER BY created_at ASC;
```

### Data Points Tracked

```json
{
  "studentName": "王小明",
  "sessions": [
    {
      "sessionId": "abc123",
      "date": "2024-09-15",
      "score": 2,
      "wordCount": 45,
      "errors": {
        "critical": 3,
        "medium": 5,
        "minor": 2
      },
      "errorTypes": {
        "grammar": 4,
        "wordChoice": 3,
        "spelling": 2
      }
    },
    // ... more sessions
  ],
  "analytics": {
    "totalEssays": 16,
    "averageScore": 3.2,
    "trend": "improving",
    "improvementRate": 2.2,
    "strongestArea": "grammar",
    "weakestArea": "word choice"
  }
}
```

---

## API Endpoints

### 1. Get Student Progress

**URL**: `/api/analytics/student/:studentName`
**Method**: `GET`
**Query Params**: `?from=2024-09-01&to=2025-02-01`

```javascript
// Example request
const response = await fetch('/api/analytics/student/王小明?from=2024-09-01&to=2025-02-01');
const data = await response.json();

// Response
{
  "success": true,
  "student": {
    "name": "王小明",
    "totalEssays": 16,
    "dateRange": {
      "from": "2024-09-01",
      "to": "2025-02-01"
    },
    "scores": [
      { "date": "2024-09-15", "score": 2 },
      { "date": "2024-09-22", "score": 2 },
      { "date": "2024-09-29", "score": 2 },
      // ... more scores
      { "date": "2025-02-01", "score": 4 }
    ],
    "statistics": {
      "averageScore": 3.2,
      "medianScore": 3,
      "trend": "improving",
      "improvementRate": 2.2,
      "totalErrors": {
        "critical": 24,
        "medium": 38,
        "minor": 15
      }
    },
    "insights": [
      "Improved by 2.2 levels in 5 months",
      "Grammar errors reduced by 75%",
      "Word choice still needs improvement"
    ]
  }
}
```

---

### 2. Get Class Analytics

**URL**: `/api/analytics/class/:classId`
**Method**: `GET`

```javascript
const response = await fetch('/api/analytics/class/tuesday-5pm');
const data = await response.json();

// Response
{
  "success": true,
  "class": {
    "classId": "tuesday-5pm",
    "className": "Tuesday 5PM Elementary",
    "totalStudents": 15,
    "totalEssays": 120,
    "statistics": {
      "averageScore": 3.2,
      "medianScore": 3,
      "improvementRate": 68,
      "topPerformers": [
        { "name": "李小華", "score": 4.8 },
        { "name": "陳大明", "score": 4.5 },
        { "name": "張小美", "score": 4.2 }
      ],
      "needsAttention": [
        { "name": "王小強", "score": 1.5, "trend": "stagnant" },
        { "name": "林小婷", "score": 2.1, "trend": "declining" }
      ]
    },
    "commonErrors": {
      "grammar": 45,
      "wordChoice": 32,
      "spelling": 18
    }
  }
}
```

---

### 3. Generate Report

**URL**: `/api/analytics/report`
**Method**: `POST`

```javascript
const response = await fetch('/api/analytics/report', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'student', // or 'class'
    studentName: '王小明',
    dateRange: { from: '2024-09-01', to: '2025-02-01' },
    format: 'pdf' // or 'csv', 'excel'
  })
});

// Response
{
  "success": true,
  "reportUrl": "https://your-domain.com/reports/wang-xiaoming-2025-02.pdf",
  "expiresAt": "2025-02-20T10:00:00Z"
}
```

---

## Frontend Implementation

### Dashboard UI (React/Vue Example)

```javascript
// Student Progress Chart Component
function StudentProgressChart({ studentName }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/analytics/student/${studentName}`)
      .then(res => res.json())
      .then(data => setData(data.student));
  }, [studentName]);

  if (!data) return <Loading />;

  return (
    <div className="progress-chart">
      <h2>{studentName}'s Progress</h2>

      {/* Line chart showing score over time */}
      <LineChart
        data={data.scores}
        xKey="date"
        yKey="score"
        height={300}
      />

      {/* Statistics cards */}
      <div className="stats-grid">
        <StatCard
          label="Average Score"
          value={data.statistics.averageScore}
          icon="📊"
        />
        <StatCard
          label="Total Essays"
          value={data.totalEssays}
          icon="📝"
        />
        <StatCard
          label="Improvement"
          value={`+${data.statistics.improvementRate}`}
          icon="📈"
        />
      </div>

      {/* AI Insights */}
      <div className="insights">
        <h3>💡 Insights</h3>
        {data.insights.map((insight, i) => (
          <p key={i}>{insight}</p>
        ))}
      </div>
    </div>
  );
}
```

---

## Database Queries (PostgreSQL)

### Calculate Student Trend

```sql
-- Get student's score trend (improving/declining/stagnant)
WITH student_scores AS (
  SELECT
    created_at,
    CAST(grading_data->'gept_rating'->>'score' AS INTEGER) as score,
    ROW_NUMBER() OVER (ORDER BY created_at) as essay_num
  FROM grading_sessions
  WHERE student_name = '王小明'
  ORDER BY created_at
),
regression AS (
  SELECT
    REGR_SLOPE(score, essay_num) as slope
  FROM student_scores
)
SELECT
  CASE
    WHEN slope > 0.1 THEN 'improving'
    WHEN slope < -0.1 THEN 'declining'
    ELSE 'stagnant'
  END as trend,
  slope
FROM regression;
```

---

### Find Common Class Errors

```sql
-- What errors do most students in this class make?
SELECT
  error_type,
  COUNT(*) as student_count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(DISTINCT student_name) FROM grading_sessions), 0) as percentage
FROM (
  SELECT
    student_name,
    jsonb_object_keys(grading_data->'main_error_types_statistics') as error_type
  FROM grading_sessions
  WHERE class_id = 'tuesday-5pm'
) as errors
GROUP BY error_type
ORDER BY student_count DESC
LIMIT 5;
```

---

## Charts & Visualizations

### Chart Types Available

1. **Line Chart**: Score over time
2. **Bar Chart**: Error type distribution
3. **Scatter Plot**: All students' scores
4. **Heat Map**: Error frequency by week
5. **Pie Chart**: Error type breakdown
6. **Radar Chart**: Skill areas (grammar, vocab, logic, etc.)

### Chart Libraries

**Recommended**: Chart.js or Recharts

```javascript
import { Line } from 'react-chartjs-2';

const chartData = {
  labels: ['Week 1', 'Week 2', 'Week 3', ...],
  datasets: [{
    label: 'Score',
    data: [2, 2, 3, 3, 4, 4, 4],
    borderColor: '#4f46e5',
    tension: 0.3
  }]
};

<Line data={chartData} />;
```

---

## Pricing & Costs

### Infrastructure Costs

| Component | Cost per Month |
|---|---|
| Additional database queries | NT$50 |
| Chart rendering (server-side) | NT$20 |
| Report generation | NT$30 |
| Storage (cached reports) | NT$10 |
| **Total** | **NT$110/month** |

### Pricing Tiers

**Professional Tier** (+NT$4,000/month):
- Up to 500 students tracked
- 1-year historical data
- Basic charts (line, bar)
- Export to PDF/CSV

**Enterprise Tier** (included in NT$38,000/month):
- Unlimited students
- Permanent historical data
- Advanced charts (radar, heatmap)
- Export to PDF/CSV/Excel
- Automated email reports (weekly/monthly)
- Custom analytics on demand

---

## Performance Optimization

### Caching Strategy

```javascript
// Cache analytics data for 1 hour
const cache = new Map();

app.get('/api/analytics/student/:studentName', async (req, res) => {
  const { studentName } = req.params;
  const cacheKey = `analytics:${studentName}:${req.query.from}:${req.query.to}`;

  // Check cache first
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < 3600000) { // 1 hour
      return res.json(cached.data);
    }
  }

  // Calculate analytics
  const analytics = await calculateStudentAnalytics(studentName, req.query);

  // Store in cache
  cache.set(cacheKey, {
    data: analytics,
    timestamp: Date.now()
  });

  res.json(analytics);
});
```

---

## Dependencies

### Required Skills
- **SK-008**: Session Persistence (source of historical data)

### Enhanced By
- **SK-001**: GEPT Essay Grader (generates data to analyze)
- **SK-011**: Parent Portal (parents view progress)
- **SK-012**: Custom Branding (branded analytics dashboards)

### Technical Dependencies
- PostgreSQL (time-series queries)
- Chart library (Chart.js, Recharts, D3.js)
- PDF generation (for reports)
- CSV/Excel export library

---

## AI-Powered Insights

### Automated Insight Generation

```javascript
function generateInsights(studentData) {
  const insights = [];

  // Improvement detection
  const firstScore = studentData.scores[0].score;
  const lastScore = studentData.scores[studentData.scores.length - 1].score;
  const improvement = lastScore - firstScore;

  if (improvement >= 2) {
    insights.push(`Excellent progress! Improved by ${improvement} levels in ${studentData.scores.length} weeks.`);
  } else if (improvement >= 1) {
    insights.push(`Good progress. Improved by ${improvement} level.`);
  } else if (improvement <= -1) {
    insights.push(`⚠️ Declining performance. Score dropped by ${Math.abs(improvement)} levels.`);
  }

  // Error trend analysis
  const grammarErrors = calculateErrorTrend(studentData, 'grammar');
  if (grammarErrors.reduction > 50) {
    insights.push(`Grammar errors reduced by ${grammarErrors.reduction}% - great improvement!`);
  }

  // Consistency check
  const variance = calculateVariance(studentData.scores);
  if (variance < 0.5) {
    insights.push(`Consistent performance - scores are stable.`);
  } else {
    insights.push(`⚠️ Inconsistent performance - scores vary widely.`);
  }

  return insights;
}
```

---

## Upsell Talking Points

### Why Schools Should Buy This

1. **Data-Driven Teaching**
   - "Know exactly which students need help"
   - "See what's working and what's not"
   - "Make informed decisions about curriculum"

2. **Parent Communication**
   - "Show parents concrete proof of improvement"
   - "Justify tuition with visible results"
   - "Impress parents with professional reports"

3. **Student Motivation**
   - "Students see their own progress"
   - "Gamify learning (leaderboards, badges)"
   - "Celebrate achievements with data"

4. **Regulatory Compliance**
   - "Keep records for inspections"
   - "Prove educational outcomes to authorities"
   - "Track class-wide performance for reports"

---

## Roadmap

### Phase 1 (Q2 2025): Core Analytics
- ✅ Student progress timeline
- ✅ Basic charts (line, bar)
- ✅ Class statistics
- ✅ PDF export

### Phase 2 (Q3 2025): Advanced Features
- 📋 Predictive analytics (will student improve?)
- 📋 Automated insights (AI-generated recommendations)
- 📋 Comparison mode (compare 2 students)
- 📋 Email reports (auto-send weekly summaries)

### Phase 3 (Q4 2025): AI Insights
- 📋 Learning style detection
- 📋 Personalized study plans
- 📋 Early warning system (detect declining students)
- 📋 Benchmark against similar students

---

## Support

For analytics features:
- **Setup**: analytics-help@your-domain.com
- **Technical Issues**: support@your-domain.com
- **Custom Reports**: reports@your-domain.com
- **Data Export**: export-help@your-domain.com
