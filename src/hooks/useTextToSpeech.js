import { useState, useCallback, useRef, useEffect } from 'react';

export function useTextToSpeech(onEndCallback = () => {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef(null);
  const [bestVoice, setBestVoice] = useState(null);
  const voicesLoadedRef = useRef(false);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const preferredVoice =
        voices.find(v => v.lang === 'hi-IN' && v.name.includes('Google')) ||
        voices.find(v => v.lang === 'hi-IN' && v.name.toLowerCase().includes('female')) ||
        voices.find(v => v.lang === 'hi-IN');

      setBestVoice(preferredVoice);
      voicesLoadedRef.current = true;
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  const speak = useCallback(
    (textToSpeak) => {
      if (!window.speechSynthesis) {
        onEndCallback();
        return;
      }

      if (!voicesLoadedRef.current) {
        // Wait a tiny bit for voices to load
        const id = setInterval(() => {
          if (voicesLoadedRef.current) {
            clearInterval(id);
            speak(textToSpeak);
          }
        }, 100);
        return;
      }

      window.speechSynthesis.cancel();

        // --- THE "ULTIMATE" TEXT CLEANING LOGIC ---
        let cleanedText = textToSpeak;
        // Step 1: Remove entire code blocks like Mermaid and Quiz JSON
        cleanedText = cleanedText.replace(/(MERMAID:|QUIZ:)[\s\S]*?(?=\n\n|$)/g, '');
        // Step 2: Remove image prompts
        cleanedText = cleanedText.replace(/IMAGE:[\s\S]*?(?=\n\n|$)/g, '');
        // Step 3: Remove the "Learn More" section
        cleanedText = cleanedText.replace(/## और जानें[\s\S]*/g, '');
        // Step 4: Remove the final options list
        cleanedText = cleanedText.replace(/(\n\d\..*)+$/g, '');
        // Step 5: Remove leftover keywords and markdown
        cleanedText = cleanedText.replace(/(LESSON_PLAN:|[*#_`])/g, '');
        // Step 6: Clean up extra spaces and newlines
        cleanedText = cleanedText.replace(/\n{2,}/g, '\n').trim();

        if (!cleanedText) {
            console.warn("Text to speak is empty after cleaning.");
            onEndCallback();
            return;
        }

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      if (bestVoice) utterance.voice = bestVoice;

      utterance.lang = 'hi-IN';
      utterance.rate = 1.1;
      utterance.pitch = 1.2;
      utteranceRef.current = utterance;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        onEndCallback();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        onEndCallback();
      };

      window.speechSynthesis.speak(utterance);
    },
    [bestVoice, onEndCallback]
  );

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
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  return { speak, cancel, pause, resume, isSpeaking, isPaused };
}
