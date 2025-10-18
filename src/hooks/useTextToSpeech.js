import { useState, useCallback, useRef, useEffect } from 'react';

export function useTextToSpeech(onEndCallback = () => {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef(null);
  const [bestVoice, setBestVoice] = useState(null);
  const voicesLoadedRef = useRef(false);
  const queueRef = useRef([]);

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

  // --- Remove emojis and unwanted symbols ---
  const removeEmojisAndSymbols = (text) => {
    if (!text) return '';
    let cleaned = text.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]|[\u2011-\u26FF]|[\u2B05-\u2B07]|[\u2934-\u2935]|[\u25AA-\u25AB]|[\u25B6]|[\u25C0]|[\u25FB-\u25FE]|[\u2600-\u26FF])/g,
      ''
    );
    cleaned = cleaned.replace(/[^a-zA-Z0-9\u0900-\u097F\s.,!?]/g, '');
    return cleaned.trim();
  };

  // --- Add tiny pause after punctuation for natural reading ---
  const addPauses = (text) => {
    return text.replace(/([.!?])/g, '$1\u200B'); // zero-width space to break chunks
  };

  // --- Split long text into chunks (~150-200 chars) ---
  const chunkText = (text) => {
    const maxLen = 180;
    const regex = new RegExp(`.{1,${maxLen}}([.!?\\n]|$)`, 'g');
    return text.match(regex)?.map(t => t.trim()).filter(Boolean) || [];
  };

  // --- Clean text for kids ---
  const cleanText = (text) => {
    if (!text) return '';
    let cleaned = text;
    cleaned = cleaned.replace(/(MERMAID:|QUIZ:)[\s\S]*?(?=\n\n|$)/g, '');
    cleaned = cleaned.replace(/IMAGE:[\s\S]*?(?=\n\n|$)/g, '');
    cleaned = cleaned.replace(/## और जानें[\s\S]*/g, '');
    cleaned = cleaned.replace(/(\n\d\..*)+$/g, '');
    cleaned = cleaned.replace(/(LESSON_PLAN:|[*#_`])/g, '');
    cleaned = cleaned.replace(/\n{2,}/g, '\n').trim();

    cleaned = removeEmojisAndSymbols(cleaned);
    cleaned = addPauses(cleaned);
    return cleaned;
  };

  const speakChunk = useCallback((text) => {
    if (!window.speechSynthesis || !text) {
      onEndCallback();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (bestVoice) utterance.voice = bestVoice;
    utterance.lang = 'hi-IN';
    utterance.rate = 0.95;  // slightly slower
    utterance.pitch = 1.2;  // friendly tone
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
