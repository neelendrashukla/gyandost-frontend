import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import Confetti from 'react-confetti';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase.js';

const correctSound = new Howl({ src: ['/sounds/correct.mp3'] });
const incorrectSound = new Howl({ src: ['/sounds/incorrect.mp3'] });
const winSound = new Howl({ src: ['/sounds/win.mp3'] });

const normalizeAnswer = (str) => {
    if (!str) return '';
    // Split by common separators like / or |
    const parts = str.split(/[\/|]/).map(part => 
        part.toLowerCase().trim().replace(/^(a|an|the)\s+/, '')
    );
    return parts.filter(p => p.length > 0);
};

const getPossibleAnswers = (answer) => {
    const normalizedParts = normalizeAnswer(answer);
    let possibles = [...normalizedParts];
    
    // Common variations and transliterations
    const variations = {
        // Sky riddle
        'आसमान': ['sky', 'aasman', 'asman', 'aasmaan', 'आसमान'],
        'sky': ['आसमान', 'aasman', 'asman', 'aasmaan'],
        'aasman': ['आसमान', 'sky', 'asman', 'aasmaan'],
        'asman': ['आसमान', 'sky', 'aasman', 'aasmaan'],
        'aasmaan': ['आसमान', 'sky', 'aasman', 'asman'],
        
        // Sun riddle
        'सूरज': ['sun', 'surya', 'suraj', 'सूर्य'],
        'सूर्य': ['sun', 'surya', 'suraj', 'सूरज'],
        'sun': ['सूरज', 'सूर्य', 'surya', 'suraj'],
        
        // Cloud riddle
        'बादल': ['cloud', 'baadal', 'badal', 'बादल'],
        'cloud': ['बादल', 'baadal', 'badal'],
        'baadal': ['cloud', 'बादल', 'badal'],
        'badal': ['cloud', 'बादल', 'baadal'],
        
        // Add more for other riddles as needed
        // e.g., 'चाँद': ['moon', 'chand', 'चंद'],
    };
    
    normalizedParts.forEach(part => {
        const lowerPart = part.toLowerCase();
        if (variations[lowerPart]) {
            possibles.push(...variations[lowerPart]);
        }
        // Also check for Hindi keys
        if (variations[part]) {
            possibles.push(...variations[part]);
        }
    });
    
    return [...new Set(possibles.map(p => p.toLowerCase()))]; // Unique, all lowercase
};

const motivationalMessages = {
    correct: [
        "Shabash! Aapka dimag tez hai! 💡",
        "Badhiya kaam! Aage badhiye! 🚀",
        "Wah! Bilkul sahi! 👏",
        "Excellent! Genius move! 🌟"
    ],
    incorrect: [
        "Koi baat nahi, phir se koshish kariye! 💪",
        "Thoda aur sochiye, aap kar sakte ho! 🧠",
        "Galti se seekhiye, agli baar sahi hoga! 📚",
        "Hausla rakho, sahi jawab paas hi hai! ✨"
    ]
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function RiddleGame({ data, onRestart, session }) {
  const { riddles } = data;
  const [riddleIndex, setRiddleIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(''); // '', 'correct', 'incorrect'
  const [isGameWon, setIsGameWon] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [revealedAnswer, setRevealedAnswer] = useState('');
  const [progress, setProgress] = useState(0);
  const [motivationalMsg, setMotivationalMsg] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const inputRef = useRef(null);
  
  const currentRiddle = riddles[riddleIndex];

  useEffect(() => {
    if (riddles.length > 0) {
      setProgress(((riddleIndex + 1) / riddles.length) * 100);
    }
    inputRef.current?.focus();
    setFeedback('');
    setUserAnswer('');
    setRevealedAnswer('');
    setMotivationalMsg('');
    setIsChecking(false);
  }, [riddleIndex, riddles.length]);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 8000); // Longer for celebration
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const getRandomMotivation = (type) => {
    const messages = motivationalMessages[type];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const checkAnswer = async (e) => {
    e?.preventDefault();
    
    if (isChecking || !userAnswer.trim()) return;
    
    setIsChecking(true);
    
    const userPossibles = getPossibleAnswers(userAnswer);
    const correctPossibles = getPossibleAnswers(currentRiddle.answer);
    
    const isCorrect = userPossibles.some(u => correctPossibles.includes(u));
    
    // Set revealed answer as original
    setRevealedAnswer(currentRiddle.answer);
    
    if (isCorrect) {
      correctSound.play();
      setFeedback('correct');
      setMotivationalMsg(getRandomMotivation('correct'));
      
      toast.success("Sahi Jawab! 🎉");
      
      if (riddleIndex === riddles.length - 1) {
        setIsGameWon(true);
        winSound.play();
        setShowConfetti(true);
        toast.success("Aapne saari paheliyan bujha li! Genius! 🏆");
        
        // Optional: Save score to Supabase if session exists
        if (session) {
          const { error } = await supabase
            .from('user_scores')
            .insert([{ user_id: session.user.id, score: riddles.length, game_type: 'riddle' }]);
          if (error) console.error('Error saving score:', error);
        }
      } else {
        setTimeout(() => {
            setRiddleIndex(prev => prev + 1);
            setIsChecking(false);
        }, 3000);
      }
    } else {
      incorrectSound.play();
      setFeedback('incorrect');
      setMotivationalMsg(getRandomMotivation('incorrect'));
      
      toast.error("Galat Jawab! 😅");
      setIsChecking(false);
    }
  };

  const skipToNext = () => {
    if (riddleIndex < riddles.length - 1) {
      setRiddleIndex(prev => prev + 1);
      setFeedback('');
      setUserAnswer('');
      setRevealedAnswer('');
      setMotivationalMsg('');
    }
  };

  const handleRestart = () => {
    setRiddleIndex(0);
    setIsGameWon(false);
    setProgress(0);
    setFeedback('');
    setUserAnswer('');
    setRevealedAnswer('');
    setMotivationalMsg('');
    setIsChecking(false);
    onRestart();
  };
  
  if (!currentRiddle && !isGameWon) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl text-purple-600"
        >
          Paheliyan load ho rahi hain... 🔄
        </motion.div>
      </div>
    );
  }

  const score = riddles.length; // Full score since all solved

  return (
    <motion.div 
      className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 rounded-3xl w-full max-w-lg mx-auto text-center shadow-2xl relative overflow-hidden border border-purple-200/50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      </AnimatePresence>

      {/* Header */}
      <motion.div className="mb-4" variants={itemVariants}>
        <h2 className="text-3xl sm:text-4xl font-display font-bold mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Paheli Bujho to Jaanein! 🧠✨
        </h2>
        {!isGameWon && (
          <motion.p 
            className="text-gray-500" 
            initial={{ scale: 0.8 }} 
            animate={{ scale: 1 }} 
            transition={{ delay: 0.5 }}
          >
            Paheli {riddleIndex + 1} / {riddles.length}
          </motion.p>
        )}
      </motion.div>

      {/* Progress Bar */}
      {!isGameWon && (
        <motion.div 
          className="w-full bg-white/50 rounded-full h-2 mb-6 overflow-hidden shadow-inner"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress / 100 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ originX: 0 }}
        >
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
        </motion.div>
      )}

      {isGameWon ? (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, rotate: -10 }} 
          animate={{ scale: 1, opacity: 1, rotate: 0 }} 
          transition={{ duration: 0.8, ease: "backOut" }}
          className="mt-8 space-y-6"
        >
          {/* Celebration Emojis */}
          <motion.div 
            className="text-8xl flex justify-center gap-4 mb-4"
            animate={{ 
              scale: [1, 1.2, 1], 
              rotate: [0, 5, -5, 0] 
            }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            🎉🏆🎊✨
          </motion.div>
          
          <div className="p-8 rounded-3xl bg-gradient-to-br from-yellow-100 via-emerald-100 to-teal-100 text-green-800 border border-green-200/50 shadow-2xl">
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }} 
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🏅
            </motion.div>
            <p className="font-bold text-3xl font-display mb-2">Bilkul Sahi! Genius! 🌟</p>
            <p className="text-xl italic mb-4">Aapne saari paheliyan bujha li! Ab toh aap paheli ke ustaad ho!</p>
            
            {/* Score Display */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-2xl font-bold text-2xl shadow-lg mb-4"
            >
              Score: {score} / {riddles.length} (100%) 🏆
            </motion.div>
          </div>
          
          <motion.button
            onClick={handleRestart}
            className="w-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white px-8 py-4 rounded-full font-bold text-xl shadow-xl hover:shadow-2xl active:scale-95"
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            Nayi Paheliyan Shuru Kariye! 🔄🚀
          </motion.button>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`riddle-${riddleIndex}`}
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {/* Riddle Display */}
            <motion.div
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl min-h-[150px] flex items-center justify-center border border-purple-200/50 hover:shadow-3xl transition-shadow"
              whileHover={{ y: -2 }}
            >
              <p className="text-xl sm:text-2xl italic text-gray-700 leading-relaxed">
                {currentRiddle.riddle}
              </p>
            </motion.div>

            {/* Input Form */}
            <motion.form
              onSubmit={checkAnswer}
              className="space-y-4 bg-white/80 p-6 rounded-3xl shadow-xl border border-purple-200/50"
              variants={itemVariants}
            >
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className={`flex-1 text-xl px-4 py-3 border-2 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-300/50 transition-all duration-300 placeholder:italic placeholder-gray-400 bg-white/50 shadow-lg
                      ${feedback === 'incorrect' 
                        ? 'border-red-500 focus:ring-red-300 animate-bounce' 
                        : 'border-purple-300 focus:ring-purple-400'
                      } ${feedback === 'correct' 
                        ? 'border-green-500 focus:ring-green-400 bg-green-50' 
                        : ''
                      } ${isChecking ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="Aapka jawaab yahan likhein... 💭"
                  disabled={isChecking}
                />
                <motion.button 
                  type="submit"
                  disabled={isChecking || !userAnswer.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-6 py-3 rounded-2xl font-bold text-xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl transition-all duration-200"
                >
                  {isChecking ? 'Check kar rahe hain...' : 'Jawaab Check Kariye! 🔍✨'}
                </motion.button>
              </div>
            </motion.form>

            {/* Feedback Section */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 sm:p-6 rounded-3xl shadow-xl border-2 space-y-3 ${
                    feedback === 'correct' 
                      ? 'bg-green-50 border-green-300 text-green-800' 
                      : 'bg-red-50 border-red-300 text-red-800'
                  }`}
                >
                  {/* Status Indicator */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className={`text-4xl flex justify-center mb-2 ${
                      feedback === 'correct' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {feedback === 'correct' ? '✅' : '❌'}
                  </motion.div>

                  {/* Revealed Answer */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="font-bold text-xl bg-white/50 p-3 rounded-2xl border"
                  >
                    Sahi Jawaab: <span className="italic">{revealedAnswer}</span>
                  </motion.p>

                  {/* Status Text */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="font-semibold text-lg"
                  >
                    {feedback === 'correct' ? 'Sahi Jawab!' : 'Galat Jawab!'}
                  </motion.p>

                  {/* Motivational Message */}
                  {motivationalMsg && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="italic text-base"
                    >
                      {motivationalMsg}
                    </motion.p>
                  )}

                  {/* Next Hint for Correct */}
                  {feedback === 'correct' && riddleIndex < riddles.length - 1 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-sm text-gray-600 flex items-center justify-center gap-2"
                    >
                      Agli paheli taiyaar ho rahi hai... ⏳
                    </motion.p>
                  )}

                  {/* Skip Button for Incorrect */}
                  {feedback === 'incorrect' && riddleIndex < riddles.length - 1 && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      onClick={skipToNext}
                      className="w-full mt-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                      whileHover={{ scale: 1.02 }}
                    >
                      Skip to Next Paheli ➡️
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}