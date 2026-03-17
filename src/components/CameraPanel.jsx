import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

export default function CameraPanel({ videoRef, canvasRef, cameraActive, landmarks, error }) {
  return (
    <motion.div
      className="camera-panel"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="camera-header">
        <div className="camera-header-left">
          <div className={`camera-status-dot ${cameraActive ? 'active' : ''}`} />
          <span className="camera-label">
            {cameraActive ? 'Camera Active' : 'Camera Off'}
          </span>
        </div>
        <div className="camera-header-right">
          {landmarks && (
            <motion.span
              className="hand-detected-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              ✋ Hand Detected
            </motion.span>
          )}
        </div>
      </div>

      <div className="camera-viewport">
        {/* Hidden video (source for MediaPipe) */}
        <video
          ref={videoRef}
          className="camera-video-hidden"
          playsInline
          muted
          autoPlay
        />

        {/* Visible canvas with landmarks drawn */}
        <canvas ref={canvasRef} className="camera-canvas" />

        {/* Overlay when camera is off */}
        {!cameraActive && !error && (
          <div className="camera-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
              <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
              <rect x="2" y="6" width="14" height="12" rx="2" />
            </svg>
            <p>Camera preview will appear here</p>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="camera-error">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <p>{error}</p>
          </div>
        )}

        {/* Scanning corners overlay */}
        {cameraActive && (
          <>
            <div className="scan-corner scan-tl" />
            <div className="scan-corner scan-tr" />
            <div className="scan-corner scan-bl" />
            <div className="scan-corner scan-br" />
          </>
        )}
      </div>
    </motion.div>
  );
}
