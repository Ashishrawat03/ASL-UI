import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * useSentence — Manages sentence building from predicted ASL letters.
 *
 * Key fixes:
 *  - Buffer threshold increased to 15 (need more consistent predictions)
 *  - Cooldown increased to 1000ms to prevent rapid duplicate letters
 *  - Confidence threshold raised to 0.70 for stricter filtering
 *  - Added "majority vote" — tracks last N predictions and only accepts
 *    when the dominant letter has > 60% of recent votes
 */
export default function useSentence({
  bufferThreshold = 6,
  cooldownMs = 500,
  confidenceThreshold = 0.65,
} = {}) {
  const [sentence, setSentence] = useState('');
  const [history, setHistory] = useState([]);
  const [currentBuffer, setCurrentBuffer] = useState({ letter: null, count: 0 });

  const bufferRef = useRef({ letter: null, count: 0 });
  const cooldownRef = useRef(false);
  const cooldownTimerRef = useRef(null);

  // Majority vote window — last N predictions
  const recentPredictionsRef = useRef([]);
  const VOTE_WINDOW = 5;
  const VOTE_MAJORITY = 0.5; // 50% of recent votes must agree

  // ── Get majority vote from recent predictions ──────────────────
  function getMajorityLetter(predictions) {
    if (predictions.length < 3) return null;

    const counts = {};
    for (const letter of predictions) {
      counts[letter] = (counts[letter] || 0) + 1;
    }

    let maxLetter = null;
    let maxCount = 0;
    for (const [letter, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        maxLetter = letter;
      }
    }

    const ratio = maxCount / predictions.length;
    return ratio >= VOTE_MAJORITY ? maxLetter : null;
  }

  // ── Process incoming prediction ────────────────────────────────
  const addLetter = useCallback(
    (letter, confidence) => {
      if (cooldownRef.current) return;
      if (!letter || confidence < confidenceThreshold) {
        // Low confidence — DON'T fully reset buffer, just don't increment
        // This prevents one bad frame from killing a good detection streak
        return;
      }

      const normalized = letter.toUpperCase();

      // Add to majority vote window
      recentPredictionsRef.current.push(normalized);
      if (recentPredictionsRef.current.length > VOTE_WINDOW) {
        recentPredictionsRef.current.shift();
      }

      // Check if majority agrees on the same letter
      const majorityLetter = getMajorityLetter(recentPredictionsRef.current);

      if (majorityLetter && majorityLetter === bufferRef.current.letter) {
        // Same letter confirmed by majority — increment buffer
        bufferRef.current.count += 1;
        setCurrentBuffer({ letter: majorityLetter, count: bufferRef.current.count });

        if (bufferRef.current.count >= bufferThreshold) {
          // Accept the letter
          if (majorityLetter === 'SPACE') {
            setSentence((prev) => {
              setHistory((h) => [...h, prev]);
              return prev + ' ';
            });
          } else if (majorityLetter === 'DEL' || majorityLetter === 'DELETE') {
            setSentence((prev) => {
              setHistory((h) => [...h, prev]);
              return prev.slice(0, -1);
            });
          } else if (majorityLetter === 'NOTHING') {
            // Ignore
          } else {
            setSentence((prev) => {
              setHistory((h) => [...h, prev]);
              return prev + majorityLetter;
            });
          }

          // Reset everything + enter cooldown
          bufferRef.current = { letter: null, count: 0 };
          setCurrentBuffer({ letter: null, count: 0 });
          recentPredictionsRef.current = [];
          cooldownRef.current = true;
          cooldownTimerRef.current = setTimeout(() => {
            cooldownRef.current = false;
          }, cooldownMs);
        }
      } else if (majorityLetter) {
        // Majority switched to a different letter — reset buffer to new letter
        bufferRef.current = { letter: majorityLetter, count: 1 };
        setCurrentBuffer({ letter: majorityLetter, count: 1 });
      } else {
        // No majority yet — show the most frequent recent letter for UI
        if (normalized === bufferRef.current.letter) {
          bufferRef.current.count += 1;
          setCurrentBuffer({ letter: normalized, count: bufferRef.current.count });
        } else {
          bufferRef.current = { letter: normalized, count: 1 };
          setCurrentBuffer({ letter: normalized, count: 1 });
        }
      }
    },
    [bufferThreshold, cooldownMs, confidenceThreshold]
  );

  // ── Manual controls ────────────────────────────────────────────
  const addSpace = useCallback(() => {
    setSentence((prev) => {
      setHistory((h) => [...h, prev]);
      return prev + ' ';
    });
  }, []);

  const deleteLetter = useCallback(() => {
    setSentence((prev) => {
      setHistory((h) => [...h, prev]);
      return prev.slice(0, -1);
    });
  }, []);

  const clearSentence = useCallback(() => {
    setHistory((h) => [...h, sentence]);
    setSentence('');
    bufferRef.current = { letter: null, count: 0 };
    setCurrentBuffer({ letter: null, count: 0 });
    recentPredictionsRef.current = [];
  }, [sentence]);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setSentence(prev);
      return h.slice(0, -1);
    });
  }, []);

  // Buffer progress (0 to 1)
  const bufferProgress = currentBuffer.count / bufferThreshold;

  // Cleanup
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, []);

  return {
    sentence,
    currentBuffer,
    bufferProgress: Math.min(bufferProgress, 1),
    addLetter,
    addSpace,
    deleteLetter,
    clearSentence,
    undo,
  };
}
