import { useState, useCallback, useRef, useEffect } from 'react';

export function useTextToSpeech(onEndCallback = () => {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef(null);
  const [bestVoice, setBestVoice] = useState(null);
  const voicesLoadedRef = useRef(false);
  const queueRef = useRef([]); // for chunked text

  // --- Load voices ---
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const preferredVoice =
        voices.find(v => v.lang === 'hi-IN' && v.name.includes('Google')) ||
        voices.find(v => v.lang === 'hi-IN' && v.name.toLowerCase().includes('female')) ||
        voices.find(v => v.lang === 'hi-IN') ||
        voices[0];

      setBestVoice(preferredVoice);
      voicesLoadedRef.current = true;
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  // --- Split long text into chunks (~200 chars) ---
  const chunkText = (text) => {
    const maxLen = 200;
    const regex = new RegExp(`.{1,${maxLen}}([.!?\\n]|$)`, 'g');
    return text.match(regex).map(t => t.trim()).filter(Boolean);
  };

  // --- Text cleaning logic ---
  const cleanText = (text) => {
    if (!text) return '';
    let cleanedText = text;
    cleanedText = cleanedText.replace(/(MERMAID:|QUIZ:)[\s\S]*?(?=\n\n|$)/g, '');
    cleanedText = cleanedText.replace(/IMAGE:[\s\S]*?(?=\n\n|$)/g, '');
    cleanedText = cleanedText.replace(/## और जानें[\s\S]*/g, '');
    cleanedText = cleanedText.replace(/(\n\d\..*)+$/g, '');
    cleanedText = cleanedText.replace(/(LESSON_PLAN:|[*#_`])/g, '');
    cleanedText = cleanedText.replace(/\n{2,}/g, '\n').trim();
    return cleanedText;
  };

  const speakChunk = useCallback((text) => {
    if (!window.speechSynthesis || !text) {
      onEndCallback();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (bestVoice) utterance.voice = bestVoice;
    utterance.lang = 'hi-IN';
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    utteranceRef.current = utterance;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      if (queueRef.current.length > 0) {
        const nextChunk = queueRef.current.shift();
        speakChunk(nextChunk);
      } else {
        setIsSpeaking(false);
        setIsPaused(false);
        onEndCallback();
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
  }, [bestVoice, onEndCallback]);

  // --- Main speak function ---
  const speak = useCallback((text) => {
    if (!window.speechSynthesis) {
      onEndCallback();
      return;
    }

    const cleaned = cleanText(text);
    if (!cleaned) {
      console.warn("Text empty after cleaning.");
      onEndCallback();
      return;
    }

    const chunks = chunkText(cleaned);
    queueRef.current = chunks;

    if (!voicesLoadedRef.current) {
      const id = setInterval(() => {
        if (voicesLoadedRef.current) {
          clearInterval(id);
          const nextChunk = queueRef.current.shift();
          speakChunk(nextChunk);
        }
      }, 100);
      return;
    }

    const nextChunk = queueRef.current.shift();
    speakChunk(nextChunk);
  }, [speakChunk, onEndCallback]);

  // --- Controls ---
  const pause = useCallback(() => {
    if (window.speechSynthesis && isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSpeaking, isPaused]);

  const resume = useCallback(() => {
    if (window.speechSynthesis && isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSpeaking, isPaused]);

  const cancel = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      queueRef.current = [];
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  return { speak, cancel, pause, resume, isSpeaking, isPaused };
}
