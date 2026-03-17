import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { SparklesCore } from '../components/ui/sparkles';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Particle background */}
      <div className="landing-particles">
        <SparklesCore
          id="landing-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1.2}
          particleDensity={60}
          className="w-full h-full"
          particleColor="#8b5cf6"
        />
      </div>

      {/* Gradient orbs */}
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-2" />
      <div className="landing-orb landing-orb-3" />

      {/* Content */}
      <div className="landing-content">
        <motion.div
          className="landing-badge"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="landing-badge-dot" />
          <span>Powered by AI + MediaPipe</span>
        </motion.div>

        <motion.h1
          className="landing-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Sign<span className="landing-title-accent">Speak</span>
        </motion.h1>

        <motion.p
          className="landing-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Real-time American Sign Language recognition.
          <br />
          Translate hand gestures into text and speech instantly.
        </motion.p>

        <motion.div
          className="landing-features"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {[
            { icon: '🖐️', text: 'Hand Tracking' },
            { icon: '🤖', text: 'AI Prediction' },
            { icon: '🔊', text: 'Text to Speech' },
          ].map((f, i) => (
            <motion.div
              key={f.text}
              className="landing-feature"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
            >
              <span className="landing-feature-icon">{f.icon}</span>
              <span>{f.text}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          className="landing-cta"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(139, 92, 246, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/options')}
        >
          <span>Get Started</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </motion.button>

        <motion.p
          className="landing-footer-note"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.5 }}
        >
          Works with your webcam • No data leaves your device
        </motion.p>
      </div>
    </div>
  );
}
