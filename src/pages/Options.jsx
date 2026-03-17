import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import Header from '../components/Header';

export default function Options() {
  const navigate = useNavigate();

  const handleWordModelClick = () => {
    alert('🚧 Word Model is still in progress!\n\nThis feature is currently under development and will be available in a future update. Stay tuned!');
  };

  return (
    <div className="options-page">
      {/* Background effects */}
      <div className="options-grid-bg" />
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-2" />

      <Header onBack={() => navigate('/')} showBack />

      <div className="options-content">
        <motion.div
          className="options-header-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="options-title">Choose Your Model</h1>
          <p className="options-subtitle">
            Select a recognition mode to get started
          </p>
        </motion.div>

        <div className="options-cards">
          {/* ABC Model Card */}
          <motion.div
            className="option-card option-card-active"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
            whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(139, 92, 246, 0.3)' }}
            onClick={() => navigate('/app')}
          >
            <div className="option-card-glow option-card-glow-purple" />
            <div className="option-card-content">
              <div className="option-card-icon-wrapper">
                <div className="option-card-icon">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
                    <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
                    <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
                    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                  </svg>
                </div>
              </div>

              <div className="option-card-badge">
                <span className="option-badge-live" />
                Active
              </div>

              <h2 className="option-card-title">ABC Model</h2>
              <p className="option-card-description">
                Recognize individual ASL alphabet letters (A-Z) with high accuracy.
                Perfect for spelling out words letter by letter.
              </p>

              <div className="option-card-stats">
                <div className="option-stat">
                  <span className="option-stat-value">29</span>
                  <span className="option-stat-label">Classes</span>
                </div>
                <div className="option-stat">
                  <span className="option-stat-value">97%</span>
                  <span className="option-stat-label">Accuracy</span>
                </div>
                <div className="option-stat">
                  <span className="option-stat-value">&lt;50ms</span>
                  <span className="option-stat-label">Latency</span>
                </div>
              </div>

              <div className="option-card-cta">
                <span>Launch ABC Mode</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Word Model Card (Coming Soon) */}
          <motion.div
            className="option-card option-card-disabled"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
            whileHover={{ y: -4 }}
            onClick={handleWordModelClick}
          >
            <div className="option-card-glow option-card-glow-cyan" />
            <div className="option-card-content">
              <div className="option-card-icon-wrapper">
                <div className="option-card-icon option-card-icon-disabled">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                    <path d="M18 14h-8" />
                    <path d="M15 18h-5" />
                    <path d="M10 6h8v4h-8V6Z" />
                  </svg>
                </div>
              </div>

              <div className="option-card-badge option-card-badge-wip">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 6v6l4 2" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                In Progress
              </div>

              <h2 className="option-card-title">Word Model</h2>
              <p className="option-card-description">
                Recognize full ASL words and common phrases using sequence detection.
                Currently under development.
              </p>

              <div className="option-card-stats option-card-stats-disabled">
                <div className="option-stat">
                  <span className="option-stat-value">—</span>
                  <span className="option-stat-label">Classes</span>
                </div>
                <div className="option-stat">
                  <span className="option-stat-value">—</span>
                  <span className="option-stat-label">Accuracy</span>
                </div>
                <div className="option-stat">
                  <span className="option-stat-value">TBD</span>
                  <span className="option-stat-label">ETA</span>
                </div>
              </div>

              <div className="option-card-cta option-card-cta-disabled">
                <span>Coming Soon</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 6v6l4 2" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
