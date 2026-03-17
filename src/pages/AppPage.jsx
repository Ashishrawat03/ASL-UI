import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CameraPanel from '../components/CameraPanel';
import PredictionDisplay from '../components/PredictionDisplay';
import SentenceBuilder from '../components/SentenceBuilder';
import SpeakButton from '../components/SpeakButton';
import BufferProgress from '../components/BufferProgress';
import WordReference from '../components/WordReference';
import LoadingScreen from '../components/LoadingScreen';
import useMediaPipe from '../hooks/useMediaPipe';
import useWebSocket from '../hooks/useWebSocket';
import useSentence from '../hooks/useSentence';

export default function AppPage() {
  const navigate = useNavigate();

  const {
    landmarks,
    isLoading: mpLoading,
    error: mpError,
    cameraActive,
    handDetected,
    startCamera,
    stopCamera,
    videoRef,
    canvasRef,
  } = useMediaPipe();

  const {
    prediction,
    isConnected,
    isModelReady,
    error: wsError,
    sendLandmarks,
    clearPrediction,
  } = useWebSocket('ws://localhost:8000/ws/abc');

  const {
    sentence,
    currentBuffer,
    bufferProgress,
    addLetter,
    addSpace,
    deleteLetter,
    clearSentence,
    undo,
  } = useSentence({ bufferThreshold: 6, cooldownMs: 500, confidenceThreshold: 0.65 });

  // ── Auto-start camera when MediaPipe is ready ──────────────────
  useEffect(() => {
    if (!mpLoading && !mpError) {
      startCamera();
    }
  }, [mpLoading, mpError, startCamera]);

  // ── Send landmarks to backend whenever they change ─────────────
  useEffect(() => {
    if (landmarks && isConnected && isModelReady) {
      sendLandmarks(landmarks);
    }
  }, [landmarks, isConnected, isModelReady, sendLandmarks]);

  // ── Feed predictions into sentence builder ─────────────────────
  useEffect(() => {
    if (prediction) {
      addLetter(prediction.letter, prediction.confidence);
    }
  }, [prediction, addLetter]);

  // ── Show loading screen while MediaPipe initializes ────────────
  if (mpLoading) {
    return <LoadingScreen message="Initializing hand tracking model..." />;
  }

  return (
    <div className="app-page">
      {/* Background grid */}
      <div className="options-grid-bg" />

      <Header showBack onBack={() => {
        stopCamera();
        navigate('/options');
      }} />

      <div className="app-main">
        {/* Left side — Camera */}
        <div className="app-left">
          <CameraPanel
            videoRef={videoRef}
            canvasRef={canvasRef}
            cameraActive={cameraActive}
            landmarks={handDetected}
            error={mpError || wsError}
          />

          <div className="app-left-bottom">
            <BufferProgress
              bufferProgress={bufferProgress}
              currentBuffer={currentBuffer}
            />
            <WordReference />
          </div>
        </div>

        {/* Right side — Prediction + Sentence */}
        <div className="app-right">
          <PredictionDisplay
            prediction={prediction}
            isConnected={isConnected}
            isModelReady={isModelReady}
          />

          <SentenceBuilder
            sentence={sentence}
            onSpace={addSpace}
            onDelete={deleteLetter}
            onClear={() => { clearSentence(); clearPrediction(); }}
            onUndo={undo}
          />

          <SpeakButton sentence={sentence} />
        </div>
      </div>
    </div>
  );
}
