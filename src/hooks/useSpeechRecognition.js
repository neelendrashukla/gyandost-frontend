import { useState, useEffect, useRef } from 'react';

export const useSpeechRecognition = (lang = 'en-IN') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true; // live updates
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      console.log(`Listening in ${lang} mode...`);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        interimTranscript += event.results[i][0].transcript;
      }
      setTranscript(interimTranscript);
      console.log(`Transcript: "${interimTranscript}"`);
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      setIsListening(false);
      alert('Mic error! Permission check karo.');
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
  }, [lang]);

  const handleListen = () => {
    if (!recognitionRef.current) return; // Safety
    if (isListening) recognitionRef.current.stop();
    else recognitionRef.current.start();
  };

  return { isListening, transcript, handleListen };
};
