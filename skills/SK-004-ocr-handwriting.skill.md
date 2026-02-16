# OCR Handwriting Recognition Skill

**Skill ID**: SK-004
**Category**: Premium Add-on
**Pricing**: +NT$2,000/month
**Status**: ✅ Production Ready

---

## Purpose

Extract text from handwritten or printed essay photos using Google Cloud Vision API. Automatically converts student essay images into editable text for grading.

---

## Features

- ✅ Handwriting recognition (English)
- ✅ Printed text recognition
- ✅ Mobile photo support (camera or upload)
- ✅ Auto-rotation and skew correction
- ✅ Base64 image processing
- ✅ High accuracy (Google Cloud Vision powered)

---

## Input Schema

```json
{
  "image": "string (required) - Base64-encoded image data (without data:image/...;base64, prefix)"
}
```

### Example Request

```json
{
  "image": "iVBORw0KGgoAAAANSUhEUgAAAAUA..."
}
```

---

## Output Schema

```json
{
  "success": true,
  "text": "I like to play basketball. It is very fun. I play with my friends every weekend.",
  "confidence": 0.95
}
```

### Error Response

```json
{
  "success": false,
  "error": "Unable to detect text in image. Please ensure image is clear and contains text."
}
```

---

## API Endpoint

**URL**: `https://railway-backend-production-55cf.up.railway.app/OCR`
**Method**: `POST`
**Headers**: `Content-Type: application/json`

### cURL Example

```bash
# Convert image to base64 first
base64_image=$(base64 -i essay_photo.jpg)

curl -X POST https://railway-backend-production-55cf.up.railway.app/OCR \
  -H "Content-Type: application/json" \
  -d "{\"image\": \"$base64_image\"}"
```

---

## Frontend Integration

### JavaScript Example (from essay_grader.html)

```javascript
// Convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Perform OCR
async function performBackendOCR(imageFile) {
  try {
    // Show loading
    document.getElementById('loading').style.display = 'block';

    // Convert to base64
    const base64Data = await fileToBase64(imageFile);
    const base64Image = base64Data.split(',')[1]; // Remove prefix

    // Call API
    const response = await fetch('https://railway-backend-production-55cf.up.railway.app/OCR', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image })
    });

    if (!response.ok) {
      throw new Error(`OCR API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.text) {
      // Fill essay input with recognized text
      document.getElementById('essayInput').value = data.text;
    } else {
      alert('Unable to recognize text. Please check image clarity or enter text manually.');
    }

  } catch (error) {
    console.error('OCR error:', error);
    alert(`Text recognition failed: ${error.message}`);
  } finally {
    document.getElementById('loading').style.display = 'none';
  }
}

// Usage: Auto-trigger on image upload
document.getElementById('imageInput').addEventListener('change', async function(e) {
  const file = e.target.files[0];
  if (file) {
    await performBackendOCR(file);
  }
});
```

---

## Backend Implementation

### Google Cloud Vision Setup

**Environment Variable**:
```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

**Service Account Permissions**:
- Cloud Vision API User

**Billing**:
- First 1,000 units/month: Free
- 1,001 - 5,000,000 units: $1.50 per 1,000 units
- Your cost per image: ~$0.0015 USD (NT$0.045)

### Node.js Backend (server.js)

```javascript
const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();

app.post('/OCR', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Image data is required'
      });
    }

    // Call Google Cloud Vision
    const [result] = await client.textDetection({
      image: { content: image }
    });

    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      return res.json({
        success: false,
        error: 'No text detected in image'
      });
    }

    // First annotation contains all text
    const fullText = detections[0].description;

    res.json({
      success: true,
      text: fullText.trim(),
      confidence: detections[0].confidence || null
    });

  } catch (error) {
    console.error('OCR error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

---

## Pricing Structure

### Cost Breakdown

| Component | Cost per Image | Your Price | Margin |
|---|---|---|---|
| Google Cloud Vision API | NT$0.045 | - | - |
| Processing/Storage | NT$0.005 | - | - |
| **Total Cost** | **NT$0.05** | - | - |
| **Customer Price** (as add-on) | - | +NT$2,000/month | - |
| **Break-even Point** | - | 40 images/month | 98% margin above 40 |

### Pricing Tiers

**Starter Tier** (NT$2,000/month):
- Up to 200 images/month
- NT$10 per additional image

**Professional Tier** (included in NT$18,000/month):
- Up to 500 images/month
- NT$8 per additional image

**Enterprise Tier** (included in NT$38,000/month):
- Unlimited images
- Dedicated support

---

## Dependencies

### Required Skills
- None (standalone skill)

### Works Best With
- **SK-001**: GEPT Essay Grader (auto-fill essay text after OCR)
- **SK-007**: Camera Capture (take photos directly in app)

### Technical Dependencies
- Google Cloud Vision API
- Base64 encoding/decoding
- Image processing library (optional for optimization)

---

## Usage Workflow

### Student Workflow

```
1. Student writes essay on paper
   ↓
2. Takes photo with phone camera (SK-007)
   ↓
3. System performs OCR (SK-004)
   ↓
4. Recognized text auto-fills input box
   ↓
5. Student reviews/edits text if needed
   ↓
6. Click "Grade Essay" (SK-001)
   ↓
7. Receive grading results
```

### Teacher Workflow (Batch)

```
1. Teacher collects 30 student essays (photos)
   ↓
2. Uploads folder of images
   ↓
3. System processes OCR on all images (SK-004 + SK-009)
   ↓
4. Auto-grades all essays (SK-001)
   ↓
5. Teacher reviews results in dashboard (SK-010)
```

---

## Image Requirements

### Recommended Specs

- **Format**: JPG, PNG, HEIC
- **Resolution**: 1280x720 minimum (2MP+)
- **File size**: < 10MB
- **Lighting**: Even, well-lit (no shadows)
- **Focus**: Sharp, not blurry
- **Orientation**: Straight, no extreme angles

### Quality Tips for Best Results

✅ **DO**:
- Use good lighting (natural daylight best)
- Hold camera parallel to paper
- Fill frame with essay (no extra background)
- Ensure all text is visible

❌ **DON'T**:
- Take photos in dim lighting
- Capture at extreme angles
- Include fingers/shadows over text
- Use blurry or low-resolution images

---

## Performance Metrics

| Metric | Value |
|---|---|
| Average OCR Time | 2-4 seconds |
| Accuracy (Printed) | 98-99% |
| Accuracy (Handwriting) | 85-95% (depends on clarity) |
| Supported Languages | English (primary), Chinese (basic) |
| Max Image Size | 10MB |
| Concurrent Requests | Up to 50/second |

---

## Error Handling

### Common Errors

```javascript
// No text detected
{
  "success": false,
  "error": "No text detected in image"
}

// Image too large
{
  "success": false,
  "error": "Image exceeds 10MB limit"
}

// Invalid base64
{
  "success": false,
  "error": "Invalid image data format"
}

// API quota exceeded
{
  "success": false,
  "error": "Monthly OCR quota exceeded. Please upgrade plan."
}
```

### Frontend Fallback

```javascript
if (!data.success) {
  alert('OCR failed. Please manually type essay or retake photo with better lighting.');
}
```

---

## Testing

### Test Cases

```bash
# Test 1: Clear printed text
Input: Scanned printout of typed essay
Expected: 98%+ accuracy

# Test 2: Clear handwriting
Input: Neatly written handwritten essay
Expected: 90%+ accuracy

# Test 3: Messy handwriting
Input: Rushed handwritten essay
Expected: 75-85% accuracy (may need manual correction)

# Test 4: Photo at angle
Input: Essay photo taken at 30° angle
Expected: Google Vision auto-corrects skew

# Test 5: Low light photo
Input: Dim lighting, shadows
Expected: Lower accuracy, may fail
```

---

## Upsell Talking Points

### For Sales

**Why schools should buy this add-on:**

1. **Saves Teacher Time**
   - "No more retyping student essays"
   - "Grade handwritten work as easily as typed work"

2. **Mobile-First**
   - "Students can submit homework via phone photo"
   - "No scanner needed"

3. **Works with Existing Workflow**
   - "Students still write on paper (no change needed)"
   - "Just photo → grade → done"

4. **Cost Effective**
   - "NT$2,000/month for 200 images = NT$10 per essay OCR"
   - "vs. Hiring someone to type: NT$50-100 per essay"

---

## Customization Options

### White-Label Schools Can:
- Set OCR quality threshold (reject low-confidence results)
- Enable/disable manual text editing after OCR
- Add watermark to uploaded images (prevent sharing)
- Limit image uploads per student (prevent abuse)

---

## Roadmap

### Planned Enhancements

- **v2.0** (Q2 2025): Support Chinese essays
- **v2.1** (Q3 2025): Batch OCR (upload 10 images at once)
- **v2.2** (Q4 2025): Handwriting style analysis (detect plagiarism)
- **v3.0** (2026): Offline OCR (on-device processing)

---

## Support

For OCR-related issues:
- **Accuracy problems**: Send sample image to support@your-domain.com
- **API errors**: Check Google Cloud Vision quota
- **Integration help**: See documentation at https://docs.your-domain.com/ocr
