/**
 * speakService — Text-to-speech using the Web Speech API.
 */

let currentUtterance = null;

export function speak(text, options = {}) {
  if (!text || !window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate || 0.9;
  utterance.pitch = options.pitch || 1;
  utterance.volume = options.volume || 1;
  utterance.lang = options.lang || 'en-US';

  // Try to use a good English voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) => v.lang.startsWith('en') && v.name.includes('Google')
  ) || voices.find((v) => v.lang.startsWith('en'));

  if (preferred) {
    utterance.voice = preferred;
  }

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);

  return new Promise((resolve) => {
    utterance.onend = resolve;
    utterance.onerror = resolve;
  });
}

export function stopSpeaking() {
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

export function isSpeaking() {
  return window.speechSynthesis.speaking;
}
