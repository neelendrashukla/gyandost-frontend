import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Howl } from "howler";

const selectSound = new Howl({ src: ["/sounds/select.mp3"], volume: 0.7 });

export default function CompletionQuiz({ questions, onSubmit, onCancel }) {
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const q = questions[currentQ];

  if (!q) return null;

  const handleAnswer = (answer) => {
    selectSound.play();
    setAnswers((prev) => ({ ...prev, [currentQ]: answer }));
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((prev) => prev + 1);
    } else {
      onSubmit(answers);
    }
  };

  const isAnswered = answers[currentQ];

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        key={currentQ}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="bg-white/90 p-6 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-bold text-gray-800">🧠 Knowledge Check</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-red-500 text-3xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Progress */}
        <p className="text-gray-600 text-sm mb-2">
          Question {currentQ + 1} of {questions.length}
        </p>
        <div className="w-full bg-gray-200 h-2 rounded-full mb-4 overflow-hidden">
          <motion.div
            className={`h-2 rounded-full ${isAnswered ? 'bg-green-500' : 'bg-blue-500'}`}
            initial={{ width: 0 }}
            animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Question */}
        <h3 className="text-lg font-semibold text-gray-800 my-4 min-h-[4rem]">
          {q.question}
        </h3>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {q.options.map((opt) => {
            const isSelected = answers[currentQ] === opt;
            return (
              <motion.button
                key={opt}
                onClick={() => handleAnswer(opt)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`relative p-4 rounded-xl border-2 text-left transition-all flex justify-between items-center overflow-hidden ${
                  isSelected
                    ? "bg-gradient-to-r from-green-500 to-green-600 border-green-600 text-white shadow-lg"
                    : "bg-white hover:bg-gray-50 border-gray-200 text-gray-800 hover:border-blue-300"
                }`}
              >
                {/* Option Text */}
                <span className="flex-1 mr-3 text-base">{opt}</span>

                {/* ✅ Emoji tick */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.span
                      key="tick"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 250, damping: 12 }}
                      className="text-xl"
                    >
                      ✅
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Background glow on select */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      key="glow"
                      layoutId="glow"
                      className="absolute inset-0 rounded-xl bg-green-400/25 blur-lg z-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Next Button */}
        <motion.button
          onClick={handleNext}
          disabled={!isAnswered}
          whileHover={!isAnswered ? {} : { scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className={`mt-6 w-full p-3 rounded-xl font-bold text-lg tracking-wide transition-all ${
            isAnswered
              ? "bg-green-500 hover:bg-green-600 text-white shadow-lg"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {currentQ < questions.length - 1
            ? "Next Question →"
            : "🎉 Finish Quiz & Claim XP"}
        </motion.button>
      </motion.div>
    </div>
  );
}