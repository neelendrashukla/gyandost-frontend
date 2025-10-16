import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import Confetti from 'react-confetti';
import { toast } from 'react-hot-toast';

// Sound Effects
const correctSound = new Howl({ src: ['/sounds/correct.mp3'] });
const incorrectSound = new Howl({ src: ['/sounds/incorrect.mp3'] });
const winSound = new Howl({ src: ['/sounds/win.mp3'] });

// Motivational Messages
const correctFeedbacks = [
    "Bilkul Sahi! ✨", "Shabash! Tum toh smart ho! 🧠", "Excellent! Keep it up! 👍", "Correct! You got it! 🎉"
];
const incorrectFeedbacks = [
    "Oops! Koi baat nahi.", "Phir se socho! 🤔", "Yeh galat hai, agla try karo!", "Himmat mat haro!"
];

export default function TrueOrFalse({ data, onRestart }) {
  const { statements } = data;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null); 
  const [feedbackMessage, setFeedbackMessage] = useState(""); 
  const [isFinished, setIsFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const currentStatement = statements && statements.length > currentIndex ? statements[currentIndex] : null;

  const handleAnswer = (userChoice) => {
    if (feedback || !currentStatement) return;

    let message = "";
    if (userChoice === currentStatement.is_true) {
      setFeedback('correct');
      message = correctFeedbacks[Math.floor(Math.random() * correctFeedbacks.length)];
      correctSound.play();
      setScore(s => s + 1);
    } else {
      setFeedback('incorrect');
      message = incorrectFeedbacks[Math.floor(Math.random() * incorrectFeedbacks.length)];
      incorrectSound.play();
    }

    setFeedbackMessage(message);

    setTimeout(() => {
      if (currentIndex === statements.length - 1) {
        setIsFinished(true);
        winSound.play();
        setShowConfetti(true);
      } else {
        setCurrentIndex(i => i + 1);
        setFeedback(null);
        setFeedbackMessage("");
      }
    }, 3000); // Increased timeout to allow reading feedback
  };
  
  const getFinalFeedback = () => {
      if (!statements || statements.length === 0) return {};
      const percentage = (score / statements.length) * 100;
      if (percentage === 100) {
          return {
              title: "Perfect Score! 🌟",
              message: "Aapne saare jawaab sahi diye! Aap toh genius ho!",
              motivation: "Aapki knowledge zabardast hai!"
          };
      } else if (percentage >= 75) {
          return {
              title: "Excellent Effort! 🎉",
              message: "Bahut achha khela aapne!",
              motivation: "Thodi aur practice se aap perfect ho jayenge."
          };
      } else {
          return {
              title: "Good Try! 👍",
              message: "Aapne achhi koshish ki!",
              motivation: "Seekhne ka safar jaari rakhein, aap behtar hote jaayenge."
          };
      }
  };

  if (isFinished) {
    const finalFeedback = getFinalFeedback();
    return (
      <div className="p-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl w-full max-w-lg mx-auto text-center shadow-2xl relative animate-flicker">
        <AnimatePresence>
            {showConfetti && <Confetti recycle={false} onConfettiComplete={() => setShowConfetti(false)} />}
        </AnimatePresence>
        <h2 className="text-4xl font-display font-bold text-blue-700 mb-2">{finalFeedback.title}</h2>
        <p className="text-3xl mt-2 mb-4">Your Final Score: {score} / {statements.length}</p>
        <p className="text-xl font-semibold text-blue-600 mb-2 italic">"{finalFeedback.message}"</p>
        <p className="text-md text-gray-600 mb-6">{finalFeedback.motivation}</p>
        <motion.button 
            onClick={onRestart} 
            className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-8 py-3 rounded-full font-bold text-xl shadow-lg"
            whileHover={{ scale: 1.05 }}
        >
            Dobara Khelein! 🔄
        </motion.button>
      </div>
    );
  }

  if (!currentStatement) {
      return <div>Loading game... Please wait.</div>
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl w-full max-w-lg mx-auto text-center shadow-2xl relative">
      <div className="absolute top-4 right-4 bg-white shadow-md p-2 rounded-lg font-bold text-gray-700">
        {currentIndex + 1} / {statements.length}
      </div>
      <h2 className="text-3xl font-display font-bold mb-6 bg-gradient-to-r from-gray-700 to-blue-600 bg-clip-text text-transparent">
        Sahi ya Galat? 🤔
      </h2>
      
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl min-h-[150px] flex items-center justify-center border"
      >
        <p className="text-2xl italic text-gray-800">{currentStatement.statement}</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-6 mt-8">
        <motion.button
          onClick={() => handleAnswer(true)}
          disabled={!!feedback}
          whileHover={{ scale: 1.05 }}
          className={`p-6 rounded-2xl font-bold text-3xl text-white shadow-lg transition-all ${feedback ? (currentStatement.is_true ? 'bg-green-500 ring-4 ring-white' : 'opacity-50') : 'bg-green-500 hover:bg-green-600'}`}
        >
          Sahi ✅
        </motion.button>
        <motion.button
          onClick={() => handleAnswer(false)}
          disabled={!!feedback}
          whileHover={{ scale: 1.05 }}
          className={`p-6 rounded-2xl font-bold text-3xl text-white shadow-lg transition-all ${feedback ? (!currentStatement.is_true ? 'bg-red-500 ring-4 ring-white' : 'opacity-50') : 'bg-red-500 hover:bg-red-600'}`}
        >
          Galat ❌
        </motion.button>
      </div>

      <AnimatePresence>
        {feedback && (
            <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }}
                className="mt-4"
            >
                <p className={`text-xl font-bold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
                    {feedbackMessage}
                </p>
                {feedback === 'incorrect' && (
                  <p className="text-lg text-gray-700 mt-2 p-3 bg-gray-100 rounded-lg">
                    Sahi jawaab tha: {currentStatement.is_true ? 'Sahi' : 'Galat'}
                  </p>
                )}
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}