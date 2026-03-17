import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function PredictionDisplay({ prediction, isConnected, isModelReady }) {
  const hasValidPrediction = prediction && prediction.letter && prediction.confidence > 0.5;

  const getConfidenceColor = (conf) => {
    if (conf >= 0.9) return '#00f0ff';
    if (conf >= 0.7) return '#a855f7';
    return '#f59e0b';
  };

  const getConfidenceLabel = (conf) => {
    if (conf >= 0.9) return 'High';
    if (conf >= 0.7) return 'Medium';
    return 'Low';
  };

  return (
    <motion.div
      className="prediction-panel"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div className="prediction-header">
        <span className="prediction-title">Prediction</span>
        <div className="connection-indicators">
          <span className={`indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="indicator-dot" />
            {isConnected ? 'Connected' : 'Offline'}
          </span>
          {isConnected && (
            <span className={`indicator ${isModelReady ? 'connected' : 'loading'}`}>
              <span className="indicator-dot" />
              {isModelReady ? 'Model Ready' : 'Loading...'}
            </span>
          )}
        </div>
      </div>

      <div className="prediction-letter-container">
        <AnimatePresence mode="wait">
          {hasValidPrediction ? (
            <motion.div
              key={prediction.letter}
              className="prediction-letter"
              initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotateY: 90 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              style={{
                textShadow: `0 0 30px ${getConfidenceColor(prediction.confidence)}40`,
              }}
            >
              {prediction.letter}
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              className="prediction-letter prediction-letter-placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
            >
              ?
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {hasValidPrediction && (
        <motion.div
          className="confidence-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="confidence-bar-track">
            <motion.div
              className="confidence-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${prediction.confidence * 100}%` }}
              transition={{ type: 'spring', damping: 20 }}
              style={{ backgroundColor: getConfidenceColor(prediction.confidence) }}
            />
          </div>
          <div className="confidence-labels">
            <span
              className="confidence-label"
              style={{ color: getConfidenceColor(prediction.confidence) }}
            >
              {getConfidenceLabel(prediction.confidence)}
            </span>
            <span className="confidence-value">
              {(prediction.confidence * 100).toFixed(1)}%
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
