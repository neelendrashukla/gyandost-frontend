import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';

const Confetti = lazy(() => import('react-confetti'));

const winSound = new Howl({ src: ['/sounds/win.mp3'] });

const getFinalFeedback = (score, totalQuestions) => {
  if (!totalQuestions) return {};
  const percentage = (score / totalQuestions) * 100;
  if (percentage === 100) return { title: "Perfect Score! 🌟", message: "Aapne saare jawaab sahi diye! Aap toh genius ho!", motivation: "Aapki knowledge zabardast hai!" };
  if (percentage >= 75) return { title: "Excellent Effort! 🎉", message: "Bahut achha khela aapne!", motivation: "Thodi aur practice se aap perfect ho jayenge." };
  if (percentage >= 50) return { title: "Good Try! 👍", message: "Aapne achhi koshish ki!", motivation: "Har galti ek naya mauka hai seekhne ka." };
  return { title: "Keep Going! 💪", message: "Himmat mat haro!", motivation: "Seekhne ka safar jaari rakhein." };
};

export default function QuizResult({ score, questions, answers, onFinish }) {
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    winSound.play();
  }, []);

  const finalFeedback = getFinalFeedback(score, questions.length);
  const passed = score / questions.length >= 0.75;

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {passed && (
        <Suspense fallback={null}>
          <Confetti recycle={false} numberOfPieces={window.innerWidth < 768 ? 150 : 400} />
        </Suspense>
      )}

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-blue-100 to-indigo-100 p-8 rounded-2xl w-full max-w-2xl text-center shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="overflow-y-auto pr-2">
          <h2 className="text-4xl font-display font-bold text-blue-700 mb-2">{finalFeedback.title}</h2>
          <p className="text-3xl mt-2 mb-4">Your Score: {score} / {questions.length}</p>
          <p className="text-xl font-semibold text-blue-600 mb-2 italic">"{finalFeedback.message}"</p>
          <p className="text-md text-gray-600 mb-6">{finalFeedback.motivation}</p>

          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <motion.button onClick={onFinish} whileHover={{ scale: 1.05 }} className="px-6 py-2 bg-indigo-500 text-white rounded-lg font-semibold">Finish</motion.button>
            <motion.button onClick={() => setShowReview(!showReview)} whileHover={{ scale: 1.05 }} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold">
              {showReview ? 'Hide Review' : 'Review Answers'}
            </motion.button>
          </div>

          <AnimatePresence>
            {showReview && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="text-left space-y-4 overflow-hidden">
                {questions.map((q, index) => {
                  const correct = answers[index] === q.correct_answer;
                  return (
                    <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className={`p-4 rounded-lg border-l-4 ${correct ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                      <p className="font-bold text-gray-800">{index + 1}. {q.question}</p>
                      <p className="mt-1 text-gray-700">Your answer: <span className="font-semibold">{answers[index] || "Not Answered"}</span></p>
                      {!correct && <p className="text-green-800 font-bold">Correct answer: {q.correct_answer}</p>}
                      <div className="mt-2 p-2 bg-yellow-50 rounded-lg text-sm text-yellow-800">
                        <span className="font-bold">Explanation:</span> {q.explanation}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}