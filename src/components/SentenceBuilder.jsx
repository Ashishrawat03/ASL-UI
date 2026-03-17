import React from 'react';
import { motion } from 'motion/react';

export default function SentenceBuilder({ sentence, onSpace, onDelete, onClear, onUndo }) {
  return (
    <motion.div
      className="sentence-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="sentence-header">
        <span className="sentence-title">Sentence Builder</span>
        <span className="sentence-char-count">{sentence.length} chars</span>
      </div>

      <div className="sentence-display">
        {sentence ? (
          <span className="sentence-text">{sentence}</span>
        ) : (
          <span className="sentence-placeholder">
            Start signing to build your sentence...
          </span>
        )}
        <motion.span
          className="sentence-cursor"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      </div>

      <div className="sentence-actions">
        <button className="sentence-btn" onClick={onSpace} title="Add Space">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 17v1c0 .5-.5 1-1 1H3c-.5 0-1-.5-1-1v-1" />
          </svg>
          Space
        </button>
        <button className="sentence-btn" onClick={onDelete} title="Delete Last">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" />
            <line x1="18" y1="9" x2="12" y2="15" />
            <line x1="12" y1="9" x2="18" y2="15" />
          </svg>
          Delete
        </button>
        <button className="sentence-btn" onClick={onUndo} title="Undo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
          Undo
        </button>
        <button className="sentence-btn sentence-btn-danger" onClick={onClear} title="Clear All">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
          Clear
        </button>
      </div>
    </motion.div>
  );
}
