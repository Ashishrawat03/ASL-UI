import React from 'react';
import { motion } from 'motion/react';

export default function BufferProgress({ bufferProgress, currentBuffer }) {
  if (!currentBuffer.letter) return null;

  return (
    <motion.div
      className="buffer-section"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <div className="buffer-label">
        <span>Detecting:</span>
        <motion.span
          className="buffer-letter"
          key={currentBuffer.letter}
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
        >
          {currentBuffer.letter}
        </motion.span>
      </div>
      <div className="buffer-bar-track">
        <motion.div
          className="buffer-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${bufferProgress * 100}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
      <span className="buffer-hint">
        Hold steady to confirm
      </span>
    </motion.div>
  );
}
