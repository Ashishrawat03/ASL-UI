import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';

export default function SpeakButton({ sentence }) {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef(null);

  const handleSpeak = async () => {
    if (!sentence || sentence.trim().length === 0) return;

    if (speaking && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setSpeaking(false);
      return;
    }

    setSpeaking(true);
    try {
      const resp = await fetch('http://localhost:8000/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sentence })
      });

      if (!resp.ok) {
        console.error('TTS endpoint failed');
        setSpeaking(false);
        return;
      }

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };

      await audio.play();
    } catch (err) {
      console.error('Playback error:', err);
      setSpeaking(false);
    }
  };

  return (
    <motion.button
      className={`speak-button ${speaking ? 'speaking' : ''}`}
      onClick={handleSpeak}
      disabled={!sentence || sentence.trim().length === 0}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={speaking ? 'Stop speaking' : 'Speak sentence'}
    >
      {speaking ? (
        <>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
          <span>Stop</span>
        </>
      ) : (
        <>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
          <span>Speak</span>
        </>
      )}

      {speaking && (
        <div className="speak-waves">
          {[0, 1, 2, 3].map((i) => (
            <motion.span
              key={i}
              className="speak-wave-bar"
              animate={{ scaleY: [0.4, 1, 0.4] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </div>
      )}
    </motion.button>
  );
}
