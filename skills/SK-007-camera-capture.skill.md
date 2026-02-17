# Camera Capture Skill

**Skill ID**: SK-007
**Category**: Premium Add-on
**Pricing**: +NT$500/month
**Status**: ✅ Production Ready (fixed in v1.1)
**Last Updated**: 2025-02-17 (v1.1 - camera OCR crash fixed)

---

## Purpose

Opens a full-screen in-app camera so students or teachers can photograph a handwritten essay directly within the browser, without leaving the app or using a separate camera app.

---

## Features

- ✅ Full-screen camera overlay UI
- ✅ Document framing guide (corner markers + alignment frame)
- ✅ Front/back camera switching (when device has multiple cameras)
- ✅ Photo capture → auto-triggers OCR (SK-004)
- ✅ Camera stream cleanup on close (no resource leaks)
- ✅ Works on iOS Safari and Android Chrome
- ✅ `playsinline` attribute (prevents iOS from going fullscreen)

---

## How It Works

```
Teacher/student clicks "拍攝照片"
  ↓
Full-screen camera overlay opens
  ↓
getUserMedia() requests camera access
  (prefers back camera: facingMode: 'environment')
  ↓
Live video stream shown with framing guide
  ↓
User aligns essay in frame, clicks "拍攝"
  ↓
Canvas captures frame from video stream
  ↓
Canvas exported as PNG (lossless)
  ↓
Camera stream stopped, overlay closes
  ↓
performBackendOCR(file) called automatically
  (SK-004 takes over from here)
```

---

## UI Components (essay_grader.html)

### Trigger Button
```html
<div class="upload-option" onclick="openCamera()">
  <div class="upload-icon">📸</div>
  <div class="upload-text">拍攝照片</div>
  <div class="upload-hint">開啟相機</div>
</div>
```

### Camera Overlay
```html
<div class="camera-overlay" id="cameraOverlay" style="display: none;">
  <div class="camera-container">

    <!-- Header with close button -->
    <div class="camera-header">
      <button class="camera-close" onclick="closeCamera()">✕</button>
      <h3>拍攝作文照片</h3>
      <div></div>
    </div>

    <!-- Live video + alignment frame -->
    <div class="camera-content">
      <video id="cameraVideo" autoplay muted playsinline></video>
      <canvas id="cameraCanvas" style="display: none;"></canvas>

      <div class="camera-overlay-frame">
        <div class="frame-corner tl"></div>
        <div class="frame-corner tr"></div>
        <div class="frame-corner bl"></div>
        <div class="frame-corner br"></div>
        <div class="frame-text">請將作文對準框內</div>
      </div>
    </div>

    <!-- Controls -->
    <div class="camera-controls">
      <button class="camera-btn secondary" onclick="closeCamera()">取消</button>
      <button class="camera-btn primary" onclick="capturePhoto()">📸 拍攝</button>
      <button class="camera-btn secondary" onclick="switchCamera()" id="switchBtn" style="display:none">
        🔄 切換
      </button>
    </div>

  </div>
</div>
```

---

## Key Functions

```javascript
// Open camera (prefers back-facing)
async function openCamera() {
    const constraints = { video: { facingMode: currentFacingMode } };
    cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
    document.getElementById('cameraVideo').srcObject = cameraStream;

    // Show switch button only if multiple cameras exist
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    document.getElementById('switchBtn').style.display =
        videoDevices.length > 1 ? 'block' : 'none';
}

// Stop stream and hide overlay
function closeCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    document.getElementById('cameraOverlay').style.display = 'none';
}

// Toggle front/back camera
async function switchCamera() {
    closeCamera();
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    await openCamera();
}

// Capture frame and send to OCR (v1.1 — fixed)
async function capturePhoto() {
    const video  = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');
    const ctx    = canvas.getContext('2d');

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
        // ✅ v1.1: PNG (lossless) instead of JPEG 90%
        const file = new File([blob], 'camera-photo.png', { type: 'image/png' });
        closeCamera();
        // ✅ v1.1: Correct function name (was performCloudVisionOCR — didn't exist)
        performBackendOCR(file).catch(() => {
            alert('文字辨識失敗，請重試或手動輸入文字。');
        });
    }, 'image/png');
}
```

---

## v1.0 vs v1.1 Bug Fix

| Issue | v1.0 | v1.1 |
|---|---|---|
| Function called after capture | `performCloudVisionOCR()` ❌ (didn't exist) | `performBackendOCR()` ✅ |
| Image format | JPEG 90% (lossy) | PNG (lossless) |
| Camera OCR result | Always crashed | Works correctly |

---

## Browser Compatibility

| Browser | Camera Access | Notes |
|---|---|---|
| iOS Safari | ✅ | Requires `playsinline` attribute |
| Android Chrome | ✅ | Full support |
| Desktop Chrome | ✅ | Uses webcam |
| Desktop Firefox | ✅ | Full support |
| Desktop Safari | ✅ | Full support |

---

## Dependencies

### Required Skills
- None (standalone camera capture)

### Works With
- **SK-004**: OCR Handwriting Recognition (auto-triggered after capture)

---

## Pricing Rationale

Low price (+NT$500/month) because:
- Pure frontend code (no backend cost)
- Supplements the higher-value SK-004 (OCR)
- Usually bundled with SK-004 — rarely sold alone

---

## Changelog

### v1.1 — 2025-02-17
- ✅ Fixed: camera capture now calls `performBackendOCR()` (was calling non-existent function)
- ✅ Fixed: output format changed from JPEG 90% to PNG lossless

### v1.0 — Initial Release
- Full-screen camera overlay
- Front/back camera switching
- Document framing guide with corner markers
