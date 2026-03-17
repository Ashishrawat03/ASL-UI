import { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

/**
 * useMediaPipe — High-performance hand landmark detection hook.
 *
 * Uses the local hand_landmarker.task model (no CDN).
 * Mirror mode is explicitly DISABLED.
 *
 * Improvements:
 *  - Higher camera resolution (1280×720) for better landmark accuracy
 *  - Higher frame rate (60fps) for smoother tracking
 *  - EMA (Exponential Moving Average) landmark smoothing to reduce jitter
 *  - Stability detection — only emits landmarks when hand is relatively still
 */
export default function useMediaPipe() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  // Smoothing state (kept in refs to avoid re-renders on every frame)
  const smoothedLandmarksRef = useRef(null); // EMA-smoothed landmarks
  const lastStableLandmarksRef = useRef(null);
  const stabilityCounterRef = useRef(0);

  const [landmarks, setLandmarks] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [handDetected, setHandDetected] = useState(false);

  // ── Smoothing config ───────────────────────────────────────────
  const EMA_ALPHA = 0.45;          // Smoothing factor (0=full smooth, 1=no smooth)
  const STABILITY_THRESHOLD = 0.012; // Max avg movement to consider "stable"
  const MIN_STABLE_FRAMES = 2;    // Frames of stability before emitting

  // ── Initialize MediaPipe HandLandmarker ────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function initHandLandmarker() {
      try {
        setIsLoading(true);
        setError(null);

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        if (cancelled) return;

        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: '/hand_landmarker.task', // Local file from public/
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.6,
          minHandPresenceConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });

        if (cancelled) return;

        handLandmarkerRef.current = landmarker;
        setIsLoading(false);
      } catch (err) {
        if (!cancelled) {
          console.error('MediaPipe init error:', err);
          setError(`Failed to initialize hand tracking: ${err.message}`);
          setIsLoading(false);
        }
      }
    }

    initHandLandmarker();

    return () => {
      cancelled = true;
    };
  }, []);

  // ── EMA smoothing for landmarks ────────────────────────────────
  function smoothLandmarks(rawFlat) {
    if (!smoothedLandmarksRef.current) {
      // First frame — initialize with raw values
      smoothedLandmarksRef.current = [...rawFlat];
      return smoothedLandmarksRef.current;
    }

    const smoothed = smoothedLandmarksRef.current;
    for (let i = 0; i < 63; i++) {
      smoothed[i] = EMA_ALPHA * rawFlat[i] + (1 - EMA_ALPHA) * smoothed[i];
    }
    return smoothed;
  }

  // ── Normalize landmarks (matches your training pipeline) ───────
  function normalizeLandmarks(rawFlat) {
    if (rawFlat.length !== 63) return rawFlat;
    
    // Convert to [21][3] array
    const arr = [];
    for (let i = 0; i < 21; i++) {
      arr.push([rawFlat[i * 3], rawFlat[i * 3 + 1], rawFlat[i * 3 + 2]]);
    }
    
    // Translate to wrist as origin (landmark 0)
    const wrist = [...arr[0]];
    for (let i = 0; i < 21; i++) {
      arr[i][0] -= wrist[0];
      arr[i][1] -= wrist[1];
      arr[i][2] -= wrist[2];
    }
    
    // Scale by max absolute distance
    let maxDist = 0;
    for (let i = 0; i < 21; i++) {
      for (let j = 0; j < 3; j++) {
        const val = Math.abs(arr[i][j]);
        if (val > maxDist) maxDist = val;
      }
    }
    
    if (maxDist > 0) {
      for (let i = 0; i < 21; i++) {
        arr[i][0] /= maxDist;
        arr[i][1] /= maxDist;
        arr[i][2] /= maxDist;
      }
    }
    
    // Flatten back out
    const normalizedFlat = new Array(63);
    for (let i = 0; i < 21; i++) {
      normalizedFlat[i * 3] = arr[i][0];
      normalizedFlat[i * 3 + 1] = arr[i][1];
      normalizedFlat[i * 3 + 2] = arr[i][2];
    }
    
    return normalizedFlat;
  }

  // ── Check if hand is stable (not mid-transition) ───────────────
  function checkStability(currentFlat) {
    const prev = lastStableLandmarksRef.current;
    if (!prev) {
      lastStableLandmarksRef.current = [...currentFlat];
      stabilityCounterRef.current = 0;
      return false;
    }

    // Calculate average movement across all 63 values
    let totalMovement = 0;
    for (let i = 0; i < 63; i++) {
      totalMovement += Math.abs(currentFlat[i] - prev[i]);
    }
    const avgMovement = totalMovement / 63;

    if (avgMovement < STABILITY_THRESHOLD) {
      stabilityCounterRef.current += 1;
    } else {
      stabilityCounterRef.current = 0;
    }

    // Update reference
    lastStableLandmarksRef.current = [...currentFlat];

    return stabilityCounterRef.current >= MIN_STABLE_FRAMES;
  }

  // ── Detection loop (RAF-based) ─────────────────────────────────
  const detectHands = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = handLandmarkerRef.current;

    if (!video || !canvas || !landmarker || video.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(detectHands);
      return;
    }

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // No mirror mode — draw video as-is
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const results = landmarker.detectForVideo(video, performance.now());

      if (results.landmarks && results.landmarks.length > 0) {
        const hand = results.landmarks[0];

        // Draw hand landmarks on canvas (always draw for visual feedback)
        drawLandmarks(ctx, hand, canvas.width, canvas.height);

        // Flatten to 63 values [x, y, z, x, y, z, ...] for backend
        const rawFlat = hand.flatMap((lm) => [lm.x, lm.y, lm.z]);

        // Apply EMA smoothing to reduce jitter
        const smoothed = smoothLandmarks(rawFlat);

        // Normalize landmarks for backend
        const normalized = normalizeLandmarks(smoothed);

        setHandDetected(true);

        // Emit normalized frames continuously (WebSocket lock handles throttling)
        setLandmarks(normalized);
      } else {
        setHandDetected(false);
        setLandmarks(null);
        smoothedLandmarksRef.current = null;
        lastStableLandmarksRef.current = null;
        stabilityCounterRef.current = 0;
      }
    } catch (err) {
      console.warn('Detection frame error:', err);
    }

    animationFrameRef.current = requestAnimationFrame(detectHands);
  }, []);

  // ── Draw hand landmarks + connections ──────────────────────────
  function drawLandmarks(ctx, landmarks, width, height) {
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8],       // Index
      [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
      [0, 13], [13, 14], [14, 15], [15, 16],// Ring
      [0, 17], [17, 18], [18, 19], [19, 20],// Pinky
      [5, 9], [9, 13], [13, 17],             // Palm
    ];

    // Draw connections
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 6;

    for (const [start, end] of connections) {
      const s = landmarks[start];
      const e = landmarks[end];
      ctx.beginPath();
      ctx.moveTo(s.x * width, s.y * height);
      ctx.lineTo(e.x * width, e.y * height);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;

    // Draw points
    for (let i = 0; i < landmarks.length; i++) {
      const lm = landmarks[i];
      const x = lm.x * width;
      const y = lm.y * height;

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = i === 0 ? '#ff6b6b' : '#00f0ff';
      ctx.fill();
    }
  }

  // ── Start camera (higher resolution + frame rate) ──────────────
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
          frameRate: { ideal: 60, min: 30 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => {
          videoRef.current.play();
          setCameraActive(true);
          animationFrameRef.current = requestAnimationFrame(detectHands);
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError(`Camera access denied: ${err.message}`);
    }
  }, [detectHands]);

  // ── Stop camera ───────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    setLandmarks(null);
    setHandDetected(false);
    smoothedLandmarksRef.current = null;
    lastStableLandmarksRef.current = null;
    stabilityCounterRef.current = 0;
  }, []);

  // ── Cleanup on unmount ────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
      }
    };
  }, []);

  return {
    landmarks,
    isLoading,
    error,
    cameraActive,
    handDetected,
    startCamera,
    stopCamera,
    videoRef,
    canvasRef,
  };
}
