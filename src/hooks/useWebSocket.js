import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * useWebSocket — Robust WebSocket hook for the FastAPI backend.
 *
 * Key fixes for prediction accuracy:
 *  - Request-response lock: waits for response before sending next frame
 *    (prevents prediction pile-up from TF's slow model.predict())
 *  - Increased throttle to 250ms (~4 FPS to backend) — quality over quantity
 *  - Only sends when explicitly told to (no auto-flooding)
 *  - Auto-reconnect with exponential backoff
 */
export default function useWebSocket(url = 'ws://localhost:8000/ws/abc') {
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const lastSendTimeRef = useRef(0);
  const mountedRef = useRef(true);
  const waitingForResponseRef = useRef(false); // Request-response lock

  const [prediction, setPrediction] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [error, setError] = useState(null);

  const MAX_RECONNECT_ATTEMPTS = 10;
  const MIN_SEND_INTERVAL = 60; // ms — Reduced throttle to let request-response lock dictate speed

  // ── Connect ────────────────────────────────────────────────────
  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close();
      }
    }

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        console.log('🔌 WebSocket connected');
        setIsConnected(true);
        setIsModelReady(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        waitingForResponseRef.current = false;
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;

        // Unlock — we got a response, ready to send next frame
        waitingForResponseRef.current = false;

        try {
          const data = JSON.parse(event.data);

          // Handle errors from backend
          if (data.error) {
            console.warn('Backend error:', data.error);
            return;
          }

          // Handle prediction result
          if (data.letter !== undefined) {
            setPrediction({
              letter: data.letter,
              confidence: data.confidence,
              classIdx: data.class_idx,
              timestamp: Date.now(),
            });
          }
        } catch (err) {
          console.warn('Failed to parse WS message:', err);
        }
      };

      ws.onerror = (event) => {
        if (!mountedRef.current) return;
        console.error('WebSocket error:', event);
        setError('Connection error');
        waitingForResponseRef.current = false;
      };

      ws.onclose = (event) => {
        if (!mountedRef.current) return;
        console.log(`🔌 WebSocket closed (code: ${event.code})`);
        setIsConnected(false);
        setIsModelReady(false);
        waitingForResponseRef.current = false;

        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 16000);
          reconnectAttemptsRef.current += 1;
          console.log(`↻ Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`);
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        } else {
          setError('Connection lost. Please refresh the page.');
        }
      };
    } catch (err) {
      setError(`Failed to connect: ${err.message}`);
    }
  }, [url]);

  // ── Send landmarks (throttled + request-response locked) ───────
  const sendLandmarks = useCallback((landmarkData) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || !isModelReady) return;

    // Don't send if we're still waiting for a response from the last send
    if (waitingForResponseRef.current) return;

    // Throttle check
    const now = Date.now();
    if (now - lastSendTimeRef.current < MIN_SEND_INTERVAL) return;
    lastSendTimeRef.current = now;

    try {
      // Lock — wait for response before sending next
      waitingForResponseRef.current = true;

      ws.send(JSON.stringify({
        landmarks: landmarkData,
        mode: 'abc',
      }));
    } catch (err) {
      console.warn('Send error:', err);
      waitingForResponseRef.current = false;
    }
  }, [isModelReady]);

  const clearPrediction = useCallback(() => {
    setPrediction(null);
  }, []);

  // ── Auto-connect on mount, cleanup on unmount ──────────────────
  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    prediction,
    isConnected,
    isModelReady,
    error,
    sendLandmarks,
    clearPrediction,
  };
}
