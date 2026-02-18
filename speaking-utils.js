/**
 * speaking-utils.js
 * Shared utility library for GEPT Speaking Grader (SK-016/017/018/019)
 *
 * Exports (as global SpeakingUtils object):
 *   - playTTS(text, voice?)             → Promise<void>
 *   - startRecording(maxSeconds?)       → Promise<{ blob, base64 }>
 *   - stopRecording()                   → void
 *   - transcribe(base64, prompt?)       → Promise<{ text, words }>
 *   - startCountdown(el, seconds, onDone, onTick?)  → stopFn
 *   - startWaveform(canvasEl)           → stopFn
 *   - wordDiff(reference, transcript)   → [{ word, status }]
 *   - calcWPM(wordCount, durationSec)   → number
 *   - detectIntonationType(text)        → "rising" | "falling"
 */

const SpeakingUtils = (() => {

  const BACKEND = 'https://railway-backend-production-55cf.up.railway.app';

  // ─── TTS ──────────────────────────────────────────────────────────────────

  /**
   * Call backend /api/tts, play the returned MP3 base64 as audio.
   * Plays twice with a 1.5 s gap (as in the real GEPT exam for Parts 1 & 3).
   * @param {string} text
   * @param {string} [voice='nova']
   * @param {number} [playCount=2]  - how many times to play (1 = once, 2 = twice)
   * @returns {Promise<void>} resolves after all plays complete
   */
  async function playTTS(text, voice = 'nova', playCount = 2) {
    const resp = await fetch(`${BACKEND}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice })
    });
    if (!resp.ok) throw new Error(`TTS 請求失敗: ${resp.status}`);
    const { audio } = await resp.json();
    if (!audio) throw new Error('TTS 回應缺少 audio 欄位');

    const src = `data:audio/mp3;base64,${audio}`;

    for (let i = 0; i < playCount; i++) {
      await _playAudioSrc(src);
      if (i < playCount - 1) {
        await _sleep(1500); // 1.5 s gap between plays
      }
    }
  }

  function _playAudioSrc(src) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(src);
      audio.onended = resolve;
      audio.onerror = reject;
      audio.play().catch(reject);
    });
  }

  function _sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // ─── Recording ────────────────────────────────────────────────────────────

  let _mediaRecorder = null;
  let _recordingChunks = [];
  let _recordingStopTimer = null;
  let _waveformStopFn = null;

  /**
   * Start recording from the user's microphone.
   * @param {number} [maxSeconds=15]
   * @param {HTMLCanvasElement} [waveformCanvas] - optional live waveform display
   * @returns {Promise<{ blob: Blob, base64: string }>}
   */
  function startRecording(maxSeconds = 15, waveformCanvas = null) {
    return new Promise(async (resolve, reject) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Pick best supported MIME (iOS/Safari needs audio/mp4)
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : MediaRecorder.isTypeSupported('audio/mp4')
              ? 'audio/mp4'
              : '';

        _mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
        _recordingChunks = [];

        _mediaRecorder.ondataavailable = e => {
          if (e.data && e.data.size > 0) _recordingChunks.push(e.data);
        };

        _mediaRecorder.onstop = async () => {
          // Stop all tracks
          stream.getTracks().forEach(t => t.stop());
          if (_waveformStopFn) { _waveformStopFn(); _waveformStopFn = null; }

          // Use actual recorder mimeType (may differ from requested on some browsers)
          const actualMime = _mediaRecorder.mimeType || mimeType || 'audio/webm';
          const blob = new Blob(_recordingChunks, { type: actualMime });
          const base64 = await _blobToBase64(blob);
          resolve({ blob, base64, mimeType: actualMime });
        };

        _mediaRecorder.onerror = e => reject(e.error);

        _mediaRecorder.start(100); // collect every 100 ms

        // Start waveform if canvas provided
        if (waveformCanvas) {
          _waveformStopFn = startWaveform(waveformCanvas, stream);
        }

        // Auto-stop after maxSeconds
        if (maxSeconds > 0) {
          _recordingStopTimer = setTimeout(() => stopRecording(), maxSeconds * 1000);
        }

      } catch (err) {
        reject(err);
      }
    });
  }

  /** Manually stop an in-progress recording. */
  function stopRecording() {
    if (_recordingStopTimer) {
      clearTimeout(_recordingStopTimer);
      _recordingStopTimer = null;
    }
    if (_mediaRecorder && _mediaRecorder.state !== 'inactive') {
      _mediaRecorder.stop();
    }
  }

  function _blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // reader.result = "data:audio/webm;base64,XXXX"
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // ─── Transcription ────────────────────────────────────────────────────────

  /**
   * Send base64 audio to backend /api/transcribe (Whisper).
   * @param {string} base64
   * @param {string} [prompt=''] - optional Whisper prompt for context
   * @returns {Promise<{ text: string, words: Array<{word,start,end}> }>}
   */
  async function transcribe(base64, prompt = '', mimeType = 'audio/webm') {
    const resp = await fetch(`${BACKEND}/api/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio: base64, prompt, language: 'en', mimeType })
    });
    if (!resp.ok) {
      let msg = `Transcribe 請求失敗: ${resp.status}`;
      try { const d = await resp.json(); if (d.error) msg = d.error; } catch {}
      throw new Error(msg);
    }
    const data = await resp.json();
    return { text: data.text || '', words: data.words || [] };
  }

  // ─── Countdown Timer ──────────────────────────────────────────────────────

  /**
   * Display a countdown in an element. Turns red in last 3 seconds.
   * @param {HTMLElement} el        - element to update innerHTML
   * @param {number}      seconds   - total seconds
   * @param {Function}    onDone    - called when countdown reaches 0
   * @param {Function}    [onTick]  - called each second with remaining seconds
   * @returns {Function} stopFn — call to cancel the countdown early
   */
  function startCountdown(el, seconds, onDone, onTick = null) {
    let remaining = seconds;

    function tick() {
      el.textContent = remaining;
      el.style.color = remaining <= 3 ? '#ef4444' : '';
      if (onTick) onTick(remaining);
      if (remaining <= 0) {
        onDone();
        return;
      }
      remaining--;
      timerId = setTimeout(tick, 1000);
    }

    let timerId = setTimeout(tick, 0);

    return function stop() {
      clearTimeout(timerId);
    };
  }

  // ─── Waveform Visualizer ─────────────────────────────────────────────────

  /**
   * Draw a live audio waveform on a canvas element.
   * @param {HTMLCanvasElement} canvas
   * @param {MediaStream} [stream] - if provided, uses it; otherwise captures mic
   * @returns {Function} stopFn
   */
  function startWaveform(canvas, stream = null) {
    const ctx = canvas.getContext('2d');
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;

    let source;
    let animId;
    let stopped = false;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      if (stopped) return;
      animId = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#14b8a6'; // teal-500
      ctx.beginPath();

      const sliceWidth = W / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * H) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(W, H / 2);
      ctx.stroke();
    }

    async function init() {
      try {
        const s = stream || await navigator.mediaDevices.getUserMedia({ audio: true });
        source = audioCtx.createMediaStreamSource(s);
        source.connect(analyser);
        draw();
      } catch (e) {
        console.warn('Waveform init failed:', e);
      }
    }

    init();

    return function stop() {
      stopped = true;
      cancelAnimationFrame(animId);
      audioCtx.close();
    };
  }

  // ─── Word Diff (Levenshtein) ──────────────────────────────────────────────

  /**
   * Compare reference text to transcript using word-level edit distance.
   * @param {string} reference   - the correct sentence
   * @param {string} transcript  - what Whisper heard
   * @returns {Array<{ word: string, status: 'correct'|'substituted'|'deleted'|'inserted' }>}
   */
  function wordDiff(reference, transcript) {
    const refWords = _tokenize(reference);
    const hypWords = _tokenize(transcript);

    const n = refWords.length;
    const m = hypWords.length;

    // Build DP matrix
    const dp = Array.from({ length: n + 1 }, (_, i) =>
      Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (refWords[i - 1] === hypWords[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to get alignment
    const result = [];
    let i = n, j = m;
    const ops = [];

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && refWords[i - 1] === hypWords[j - 1]) {
        ops.push({ word: refWords[i - 1], status: 'correct' });
        i--; j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] <= dp[i - 1][j] && dp[i][j - 1] <= dp[i - 1][j - 1])) {
        ops.push({ word: hypWords[j - 1], status: 'inserted' });
        j--;
      } else if (i > 0 && (j === 0 || dp[i - 1][j] <= dp[i][j - 1] && dp[i - 1][j] <= dp[i - 1][j - 1])) {
        ops.push({ word: refWords[i - 1], status: 'deleted' });
        i--;
      } else {
        ops.push({ word: refWords[i - 1], status: 'substituted' });
        i--; j--;
      }
    }

    return ops.reverse();
  }

  function _tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9'\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 0);
  }

  /**
   * Calculate accuracy % from a wordDiff result.
   * @param {Array} diffResult - from wordDiff()
   * @returns {number} 0–100
   */
  function calcAccuracy(diffResult) {
    const correct = diffResult.filter(d => d.status === 'correct').length;
    const total = diffResult.filter(d => d.status !== 'inserted').length; // ref words
    if (total === 0) return 100;
    return Math.round((correct / total) * 100);
  }

  // ─── WPM ─────────────────────────────────────────────────────────────────

  /**
   * @param {number} wordCount
   * @param {number} durationSec
   * @returns {number} words per minute
   */
  function calcWPM(wordCount, durationSec) {
    if (durationSec <= 0) return 0;
    return Math.round((wordCount / durationSec) * 60);
  }

  // ─── Intonation Detection ─────────────────────────────────────────────────

  /**
   * Detect likely intonation direction from sentence structure.
   * @param {string} text
   * @returns {"rising"|"falling"}
   */
  function detectIntonationType(text) {
    const trimmed = text.trim();
    // Yes/No questions end with '?' and don't start with wh- words
    if (trimmed.endsWith('?')) {
      const whWords = /^(what|where|when|who|whom|whose|which|why|how)\b/i;
      if (!whWords.test(trimmed)) return 'rising'; // yes/no question → ↑
    }
    return 'falling'; // statements, wh-questions, exclamations → ↓
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  return {
    playTTS,
    startRecording,
    stopRecording,
    transcribe,
    startCountdown,
    startWaveform,
    wordDiff,
    calcAccuracy,
    calcWPM,
    detectIntonationType,
    BACKEND
  };

})();
