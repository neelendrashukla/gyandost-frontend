import React, { useState, useEffect } from 'react';
import { useProfile } from "../../hooks/useProfile.js";
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Howl } from 'howler';
import Confetti from 'react-confetti';
import GyanDostMascot from "../GyanDostMascot.jsx";
import { toast } from 'react-hot-toast';

// 🎵 Sounds
const flipSound = new Howl({ src: ['/sounds/flip.mp3'] });
const matchSound = new Howl({ src: ['/sounds/correct.mp3'] });
const incorrectSound = new Howl({ src: ['/sounds/incorrect.mp3'] });
const winSound = new Howl({ src: ['/sounds/win.mp3'] });

// 🌈 Vibrant color palette
const colorPalette = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

// 🔀 Shuffle array utility
const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

export default function ConceptMatch({ data, topic, onRestart, session }) {
  const { profile: userProfile } = useProfile(session?.user);

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  // 🧩 Setup game
  useEffect(() => {
    const setupGame = async () => {
      if (!userProfile) return;
      setLoading(true);

      try {
        const pairColors = {};
        data.pairs.forEach((p, index) => {
          pairColors[p.term] = colorPalette[index % colorPalette.length];
        });

        const terms = data.pairs.map(p => ({
          type: 'term',
          value: p.term,
          pairId: p.term,
          color: pairColors[p.term]
        }));

        const defs = data.pairs.map(p => ({
          type: 'definition',
          value: p.definition,
          pairId: p.term,
          color: pairColors[p.term]
        }));

        setCards(
          shuffleArray([...terms, ...defs]).map((card, i) => ({ ...card, id: i }))
        );
      } catch (error) {
        console.error("Failed to load concept match game:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile) {
      setupGame();
    }
  }, [userProfile, data]);

  // 🔁 Handle card flip
  const handleFlip = (card) => {
    if (
      loading ||
      flipped.length === 2 ||
      flipped.find(c => c.id === card.id) ||
      matched.includes(card.pairId)
    ) return;

    flipSound.play();
    const newFlipped = [...flipped, card];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);

      if (newFlipped[0].pairId === newFlipped[1].pairId) {
        setMatched(m => [...m, newFlipped[0].pairId]);
        matchSound.play();
        setFlipped([]);

        setTimeout(() => {
          if (matched.length + 1 === cards.length / 2) {
            winSound.play();
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
          }
        }, 100);
      } else {
        incorrectSound.play();
        setTimeout(() => setFlipped([]), 1500);
      }
    }
  };

  const isGameWon = matched.length > 0 && matched.length === cards.length / 2;
  const progress = (matched.length / (cards.length / 2)) * 100;

  // 💬 Personalized feedback
  const getFeedback = (moves) => {
    if (moves <= 6) {
      return `Superb! You nailed it in just ${moves} moves – you're a memory wizard! 🧙‍♂️`;
    } else if (moves <= 12) {
      return `Excellent! ${moves} moves – sharp mind at work! 🔍`;
    } else {
      return `Well done! You completed it in ${moves} moves – every step counts! 💪`;
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 }
    }),
    matched: { scale: 1.1, rotate: 5 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-2 sm:p-4 text-center relative overflow-hidden">
      <AnimatePresence>{showConfetti && <Confetti />}</AnimatePresence>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)]"></div>

      <Link
        to="/game-zone"
        className="mb-2 sm:mb-4 inline-block bg-white/80 backdrop-blur-sm px-3 py-1 sm:px-4 sm:py-2 rounded-full hover:bg-white transition-all text-sm sm:text-base shadow-lg hover:shadow-xl border border-indigo-200"
      >
        ‹ Wapas Game Zone
      </Link>

      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-center max-w-4xl mx-auto mb-2 sm:mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          whileHover={{ scale: 1.05 }}
        >
          🧠 Concept Match
        </motion.h1>

        <motion.div
          className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-white/80 backdrop-blur-sm shadow-card p-2 sm:p-3 rounded-full mt-2 sm:mt-0"
          whileHover={{ scale: 1.1 }}
        >
          Moves: {moves}
        </motion.div>
      </motion.div>

      <motion.h2
        className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-4 text-gray-700"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Topic: {topic}
      </motion.h2>

      {/* Progress Bar */}
      {!isGameWon && !loading && (
        <motion.div
          className="w-full max-w-md mx-auto mb-6 relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 h-3 rounded-full relative overflow-hidden shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
              <motion.div
                className="absolute right-0 top-0 w-1 h-full bg-white/50"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </motion.div>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Matches: {matched.length}/{cards.length / 2}
          </p>
        </motion.div>
      )}

      {/* Game Board / Result */}
      {loading ? (
        <GyanDostMascot state="thinking" />
      ) : isGameWon ? (
        <motion.div
          className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl mx-auto max-w-lg relative overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 opacity-20 rounded-2xl"></div>

          <motion.h2
            className="text-xl sm:text-2xl md:text-3xl font-bold text-green-700 relative z-10 mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            Shabash! Aap Jeet Gaye! 🎉
          </motion.h2>

          <motion.p
            className="text-sm sm:text-base text-gray-600 mt-2 relative z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Aapne {moves} moves me game poora kiya. Wah!
          </motion.p>

          <motion.div
            className="relative z-10 mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-sm sm:text-base font-semibold text-green-600 italic mb-2">
              {getFeedback(moves)}
            </p>
          </motion.div>

          <motion.button
            onClick={onRestart}
            className="mt-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 sm:px-6 py-2 rounded-full font-bold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl relative z-10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Restart & Play Again! 🚀
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
            className="
              grid 
              grid-cols-2 
              sm:grid-cols-3 
              md:grid-cols-4 
              lg:grid-cols-5 
              xl:grid-cols-6 
              gap-3 
              sm:gap-4 
              max-w-5xl 
              mx-auto 
              pt-4 
              px-2
            "
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            animate="visible"
         >
          {cards.map((card, i) => {
            const isFlipped = flipped.find(c => c.id === card.id) || matched.includes(card.pairId);
            const isMatched = matched.includes(card.pairId);
            const cardColor = isMatched ? card.color : undefined;

            return (
              <motion.div
                key={card.id}
                variants={cardVariants}
                custom={i}
                onClick={() => handleFlip(card)}
                className="aspect-square cursor-pointer rounded-xl shadow-md sm:shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group w-full h-full min-h-[80px] sm:min-h-[100px]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="w-full h-full relative"
                  style={{ transformStyle: 'preserve-3d' }}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  {/* Front Face */}
                  <div
                    className="absolute w-full h-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold p-1 sm:p-2 shadow-lg group-hover:from-indigo-600 group-hover:via-purple-700 group-hover:to-pink-600 transition-all"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <motion.svg
                        className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mb-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </motion.svg>
                      <span className="text-xs sm:text-sm tracking-wide">Match Me!</span>
                    </div>
                    <div className="absolute inset-0 bg-white/10 rounded-2xl"></div>
                  </div>

                  {/* Back Face */}
                  <motion.div
                    className="absolute w-full h-full rounded-2xl p-1 sm:p-2 flex items-center justify-center text-center font-semibold leading-tight break-words shadow-lg overflow-hidden bg-white"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}
                    animate={
                      isMatched
                        ? { backgroundColor: cardColor, boxShadow: `0 0 20px ${cardColor}20` }
                        : {}
                    }
                    transition={{ duration: 0.3 }}
                  >
                    <span
                      className="relative z-10 text-xs sm:text-sm font-bold drop-shadow-2xl text-black"
                      style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.9)' }}
                    >
                      {card.value}
                    </span>

                    {isMatched && (
                      <motion.div
                        className="absolute inset-0 opacity-20"
                        style={{ backgroundColor: cardColor }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                  </motion.div>
                </motion.div>

                {isMatched && (
                  <motion.div
                    className="absolute -inset-2 rounded-2xl -z-10 blur-sm"
                    style={{ backgroundColor: `${cardColor}20` }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <motion.div
        className="mt-8 text-sm text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p>Tap cards to flip and match concepts! 💡</p>
      </motion.div>

      <style jsx>{`
        @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 2s infinite;
        }

        /* 🔧 Mobile fix for super small screens */
        @media (max-width: 400px) {
          .grid {
            grid-template-columns: repeat(2, 1fr) !important;
        }
        .aspect-square {
          min-height: 70px !important;
       }
     }
  `}</style>

    </div>
  );
}
