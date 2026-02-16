# Custom Branding Skill

**Skill ID**: SK-012
**Category**: Premium Add-on (Enterprise)
**Pricing**: +NT$1,500/month (setup fee: NT$5,000)
**Status**: 📋 Planned (Q3 2025)

---

## Purpose

White-label the essay grading system with school's branding, making it appear as the school's own proprietary tool rather than a third-party service.

---

## Features

- ✅ School logo on all pages (header, footer, reports)
- ✅ Custom color scheme (primary, secondary, accent colors)
- ✅ School name throughout UI
- ✅ Custom domain (grader.yourschool.com)
- ✅ Branded PDF reports with school letterhead
- ✅ Custom email templates (if using email notifications)
- ✅ Remove "Powered by [Your Brand]" attribution (optional)
- ✅ Custom favicon and app icons
- ✅ Branded QR codes with school logo

---

## Use Cases

### Use Case 1: Large Cram School Chain
**Scenario**: 何嘉仁美語 wants parents to think they built the system

**Before**:
```
URL: essay-grader.com/hess
Header: "AI Essay Grader"
Footer: "Powered by Your Company"
PDF: Generic template
```

**After**:
```
URL: grader.hess.com.tw
Header: "何嘉仁美語 AI評分系統"
Footer: "© 2025 何嘉仁美語. All rights reserved."
PDF: Hess letterhead with logo
```

**Result**: Parents believe it's Hess's proprietary technology → Higher perceived value

---

### Use Case 2: Public School District
**Scenario**: Taipei City Education Bureau wants branded system for 100 schools

**Setup**:
```
URL: gept-grader.tp.edu.tw
Primary Color: #0066cc (Taipei blue)
Logo: Taipei City Department of Education seal
Reports: Official government letterhead
```

**Benefit**: Standardized grading across district with official branding

---

### Use Case 3: International School
**Scenario**: Taipei American School wants English-only interface

**Customization**:
```
Language: English only (remove Chinese)
Logo: TAS eagle mascot
Colors: School colors (navy + gold)
Domain: grading.tas.edu.tw
Terminology: "TAS Writing Assessment" (not "GEPT")
```

---

## Configuration Schema

### School Branding Configuration

Each school gets a config file: `config/schools/{school-id}/branding.json`

```json
{
  "schoolId": "hess-taipei-main",
  "schoolName": "何嘉仁美語南京分校",
  "schoolNameEn": "HESS Nanjing Campus",

  "branding": {
    "logoUrl": "/uploads/branding/hess-logo.png",
    "faviconUrl": "/uploads/branding/hess-favicon.ico",
    "primaryColor": "#0066cc",
    "secondaryColor": "#ffcc00",
    "accentColor": "#ff6600",
    "fontFamily": "Microsoft JhengHei, Arial, sans-serif"
  },

  "domain": {
    "custom": "grader.hess.com.tw",
    "ssl": true,
    "autoRedirect": true
  },

  "pdf": {
    "templateUrl": "/uploads/branding/hess-letterhead.html",
    "logoPosition": "top-left",
    "showPoweredBy": false,
    "footerText": "© 2025 何嘉仁美語. 本報告僅供教學使用。"
  },

  "qrCode": {
    "logoOverlay": true,
    "logoUrl": "/uploads/branding/hess-logo-small.png",
    "colors": {
      "foreground": "#0066cc",
      "background": "#ffffff"
    }
  },

  "ui": {
    "showAttribution": false,
    "customFooter": "何嘉仁美語 AI評分系統 | 技術支援: support@hess.com.tw",
    "language": "zh-TW",
    "customCSS": "/uploads/branding/hess-custom.css"
  }
}
```

---

## Implementation

### Frontend (Dynamic Branding)

```javascript
// Load school branding on page load
async function loadSchoolBranding() {
  const schoolId = getSchoolIdFromDomain(); // e.g., from subdomain

  const response = await fetch(`/api/branding/${schoolId}`);
  const branding = await response.json();

  // Apply branding
  document.documentElement.style.setProperty('--primary-color', branding.branding.primaryColor);
  document.documentElement.style.setProperty('--secondary-color', branding.branding.secondaryColor);

  document.querySelector('.header-logo').src = branding.branding.logoUrl;
  document.querySelector('.school-name').textContent = branding.schoolName;
  document.title = `${branding.schoolName} - AI評分系統`;

  // Load custom CSS if provided
  if (branding.ui.customCSS) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = branding.ui.customCSS;
    document.head.appendChild(link);
  }
}

window.addEventListener('DOMContentLoaded', loadSchoolBranding);
```

---

### Backend (Multi-Tenant Setup)

```javascript
// API endpoint to get branding config
app.get('/api/branding/:schoolId', async (req, res) => {
  const { schoolId } = req.params;

  try {
    // Load from database or file
    const branding = await db.query(
      'SELECT branding_config FROM schools WHERE school_id = $1',
      [schoolId]
    );

    if (!branding.rows[0]) {
      // Return default branding
      return res.json(getDefaultBranding());
    }

    res.json(branding.rows[0].branding_config);

  } catch (error) {
    console.error('Branding error:', error);
    res.status(500).json({ error: 'Failed to load branding' });
  }
});

// Middleware to identify school from custom domain
app.use(async (req, res, next) => {
  const hostname = req.hostname;

  // Check if custom domain
  if (hostname !== 'essay-grader.com') {
    const school = await db.query(
      'SELECT school_id FROM schools WHERE custom_domain = $1',
      [hostname]
    );

    if (school.rows[0]) {
      req.schoolId = school.rows[0].school_id;
    }
  }

  next();
});
```

---

### PDF Report Branding

```javascript
function generateBrandedPDF(gradingData, schoolBranding) {
  const template = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        :root {
          --primary: ${schoolBranding.branding.primaryColor};
          --secondary: ${schoolBranding.branding.secondaryColor};
        }

        .letterhead {
          background: white;
          border-top: 5px solid var(--primary);
        }

        .logo {
          position: absolute;
          top: 20px;
          left: 20px;
          height: 60px;
        }

        .school-name {
          color: var(--primary);
          font-size: 24px;
          font-weight: bold;
          margin-top: 80px;
        }

        footer {
          position: fixed;
          bottom: 0;
          width: 100%;
          text-align: center;
          color: #666;
          font-size: 10px;
          border-top: 1px solid #ccc;
          padding: 10px;
        }
      </style>
    </head>
    <body>
      <div class="letterhead">
        <img src="${schoolBranding.branding.logoUrl}" class="logo" alt="School Logo">
        <h1 class="school-name">${schoolBranding.schoolName}</h1>
        <h2>AI作文評分報告</h2>
      </div>

      <!-- Grading content here -->
      <div class="content">
        ${generateGradingContent(gradingData)}
      </div>

      <footer>
        ${schoolBranding.pdf.footerText}
        ${!schoolBranding.pdf.showPoweredBy ? '' : '<br>Powered by Your Company'}
      </footer>
    </body>
    </html>
  `;

  return template;
}
```

---

## Custom Domain Setup

### DNS Configuration

**School needs to configure**:
```
Type: CNAME
Host: grader
Target: essay-grader.com
TTL: 3600
```

**Result**: `grader.hess.com.tw` → Your server

### SSL Certificate (Let's Encrypt)

```bash
# Auto-provision SSL for custom domain
certbot --nginx -d grader.hess.com.tw
```

### Nginx Configuration

```nginx
server {
  listen 443 ssl;
  server_name grader.hess.com.tw;

  ssl_certificate /etc/letsencrypt/live/grader.hess.com.tw/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/grader.hess.com.tw/privkey.pem;

  location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-School-Domain $host;
  }
}
```

---

## Pricing & Costs

### Setup Fee: NT$5,000 (One-Time)

Includes:
- Logo upload and optimization
- Color scheme configuration
- Custom domain setup (DNS + SSL)
- PDF template customization
- Initial testing and QA

### Monthly Fee: +NT$1,500

Includes:
- Custom domain hosting
- SSL certificate renewal
- Unlimited branding updates
- Technical support

### Additional Costs

| Service | Cost | Frequency |
|---|---|---|
| SSL Certificate | Free (Let's Encrypt) | Auto-renew |
| Domain Hosting | NT$50/month | Included |
| Storage (logos, assets) | NT$10/month | Included |
| **Total** | **NT$60/month** | - |

**Your Margin**: NT$1,440/month (96%)

---

## Branding Assets Required from School

### Checklist for Onboarding

```markdown
Please provide the following:

1. **Logo Files**
   - [ ] High-resolution logo (PNG with transparent background)
   - [ ] Recommended: 500x500px minimum
   - [ ] Square version for QR code overlay

2. **Colors**
   - [ ] Primary color (hex code, e.g., #0066cc)
   - [ ] Secondary color (hex code)
   - [ ] Accent color (optional)

3. **Domain**
   - [ ] Desired subdomain (e.g., grader.yourschool.com)
   - [ ] Access to DNS settings (to add CNAME record)

4. **Text**
   - [ ] School name (Chinese)
   - [ ] School name (English, optional)
   - [ ] Footer text for reports
   - [ ] Support contact (email/phone)

5. **Preferences**
   - [ ] Show "Powered by [Your Company]"? Yes / No
   - [ ] Language: Chinese / English / Both
   - [ ] Custom CSS/design requests (optional)
```

---

## Upsell Talking Points

### Why Schools Should Buy This

1. **Increased Perceived Value**
   - "Parents think YOU built this technology"
   - "Looks professional and proprietary"
   - "Matches your school's existing brand"

2. **Trust & Credibility**
   - "Your logo on every report builds trust"
   - "Students/parents recognize your brand"
   - "Looks like an official school tool, not third-party"

3. **Competitive Advantage**
   - "Stand out from other cram schools"
   - "Parents see you as tech-forward and innovative"
   - "Harder for competitors to copy"

4. **Marketing Asset**
   - "Use branded screenshots in marketing materials"
   - "Show off your 'proprietary AI system' on website"
   - "'Powered by advanced AI' → recruitment tool"

---

## Examples: Before & After

### Example 1: Generic vs Branded Header

**Before (Default)**:
```
┌─────────────────────────────────────────────┐
│   🤖 AI Essay Grader                        │
│   Powered by Your Company                   │
└─────────────────────────────────────────────┘
```

**After (Hess Branded)**:
```
┌─────────────────────────────────────────────┐
│   [HESS LOGO]  何嘉仁美語 AI評分系統        │
│   HESS English Language Schools              │
└─────────────────────────────────────────────┘
```

---

### Example 2: PDF Report

**Before**:
```pdf
─────────────────────────────────
AI Essay Grading Report
Generated: 2025-02-17
─────────────────────────────────

Student Essay:
I like to play basketball...

Powered by Your Company
─────────────────────────────────
```

**After (Hess Branded)**:
```pdf
┌───────────────────────────────────────┐
│  [HESS LOGO]                          │
│  何嘉仁美語南京分校                    │
│  HESS Nanjing Campus                  │
│  AI作文評分報告                        │
│  學生: 王小明                          │
│  日期: 2025年2月17日                   │
└───────────────────────────────────────┘

作文原文:
I like to play basketball...

─────────────────────────────────
© 2025 何嘉仁美語. All rights reserved.
技術支援: support@hess.com.tw
─────────────────────────────────
```

---

## Dependencies

### Required Skills
- **SK-001**: GEPT Essay Grader (applies branding to grading UI)
- **SK-003**: Basic PDF Report (applies branding to PDFs)

### Enhanced By
- **SK-002**: Student Review Portal (branded student-facing pages)
- **SK-008**: Session Persistence (branded QR codes)
- **SK-011**: Parent Portal (branded parent login)

### Technical Dependencies
- Multi-tenant database architecture
- DNS management (for custom domains)
- SSL certificate automation (Let's Encrypt)
- Dynamic CSS loading
- Asset storage (S3 or similar)

---

## Testing Checklist

Before launching for a school:

```markdown
- [ ] Logo displays correctly on all pages
- [ ] Colors apply throughout UI (header, buttons, links)
- [ ] Custom domain resolves correctly
- [ ] SSL certificate is valid
- [ ] PDF reports use custom letterhead
- [ ] QR codes include school logo
- [ ] Footer text is correct
- [ ] "Powered by" removed (if requested)
- [ ] Mobile responsive (logo doesn't overflow)
- [ ] Print layout looks good
- [ ] Email templates branded (if applicable)
- [ ] Error pages branded
- [ ] Loading screens branded
```

---

## Customization Limits

### What You CAN Customize

✅ Logo, colors, fonts, domain
✅ PDF report layout and content
✅ Footer/header text
✅ QR code appearance
✅ Email templates
✅ Custom CSS (within limits)
✅ Language/terminology

### What You CANNOT Customize

❌ Core functionality (grading logic)
❌ Database structure
❌ API endpoints
❌ Security policies
❌ Backup schedules
❌ Complete UI redesign (major changes)

**Why**: To maintain quality, security, and supportability

---

## Performance Impact

| Metric | Impact |
|---|---|
| Page Load Time | +100-200ms (loading custom CSS/fonts) |
| DNS Lookup | +20-50ms (custom domain) |
| SSL Handshake | +50-100ms (same as default) |
| Asset Loading | +200-500ms (logos, custom fonts) |
| **Total Overhead** | **~370-850ms** |

**Mitigation**:
- CDN for custom assets
- Preload critical fonts
- Cache branding configs (1 hour TTL)

---

## Roadmap

### Phase 1 (Q3 2025): Basic Branding
- ✅ Logo upload
- ✅ Color customization
- ✅ Custom domain
- ✅ Branded PDF reports

### Phase 2 (Q4 2025): Advanced Branding
- 📋 Custom CSS editor
- 📋 Email template branding
- 📋 White-label mobile app
- 📋 Branded login page

### Phase 3 (2026): Full White-Label
- 📋 Remove all references to your company
- 📋 Custom Terms of Service / Privacy Policy
- 📋 Reseller program (schools sell to other schools)
- 📋 API rebranding (schools get their own API docs)

---

## Support

For custom branding setup:
- **Onboarding**: setup@your-domain.com
- **Technical Issues**: support@your-domain.com
- **DNS Help**: dns-help@your-domain.com
- **Design Requests**: design@your-domain.com

**Turnaround Time**: 3-5 business days for initial setup
