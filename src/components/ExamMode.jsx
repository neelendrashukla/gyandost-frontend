import React, { useState, useEffect, useContext } from 'react';
import { useProfile } from "../hooks/useProfile.js";
import { LanguageContext } from "../context/LanguageContext.jsx";
import { fetchExamQuestions, saveExamResult, awardXpAndLogActivity } from "../api.js"; // 🟢 updated import
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import Confetti from 'react-confetti';
import { toast } from 'react-hot-toast';
import GyanDostMascot from "./GyanDostMascot.jsx";

const winSound = new Howl({ src: ['/sounds/win.mp3'] });
const selectSound = new Howl({ src: ['/sounds/select.mp3'], volume: 0.7 });
const subjects = ["Math", "Science", "History", "Geography", "English", "Computer", "General Knowledge", "Sanskriti Gyan", "Artificial Intelligence"];

// --- Exam Config Component ---
const ExamConfig = ({ config, setConfig, startExam, loading }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-card"
  >
    <h1 className="text-3xl font-display font-bold mb-6 text-center text-brand-primary">Exam Mode 📝</h1>
    <div className="space-y-4">
      <div>
        <label className="font-semibold text-gray-700">Subject</label>
        <select
          value={config.subject}
          onChange={e => setConfig({ ...config, subject: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-brand-primary"
        >
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="font-semibold text-gray-700">Chapter (optional)</label>
        <input
          type="text"
          value={config.chapter}
          onChange={e => setConfig({ ...config, chapter: e.target.value })}
          placeholder="e.g., 'Light', 'Tenses', 'Mensuration', 'Data structure', 'Mughal Empire', 'Indian History', 'Ramayana', 'Artificial Intelligence', etc."
          className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      <div>
        <label className="font-semibold text-gray-700">Number of Questions</label>
        <select
          value={config.count}
          onChange={e => setConfig({ ...config, count: parseInt(e.target.value, 10) })}
          className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-brand-primary"
        >
          <option value={10}>10 Questions (Quick Test)</option>
          <option value={20}>20 Questions (Chapter Test)</option>
          <option value={50}>50 Questions (Full Exam)</option>
        </select>
      </div>

      <motion.button
        onClick={startExam}
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg text-xl hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Generating Exam..." : "Start Exam"}
      </motion.button>
    </div>
  </motion.div>
);

// --- Exam Player Component ---
const ExamPlayer = ({ questions, config, timeLeft, formatTime, handleAnswer, answers, currentQ, setCurrentQ, finishExam }) => {
  const q = questions[currentQ];
  if (!q) return <div>Loading questions...</div>;

  const onOptionClick = (questionIndex, answer) => {
    selectSound.play();
    handleAnswer(questionIndex, answer);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-700">
          {config.subject}: {config.chapter || 'Full Test'}
        </h2>
        <div className="text-xl font-bold bg-red-500 text-white px-3 py-1 rounded-full">
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-6 overflow-hidden">
        <motion.div
          className="bg-blue-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentQ) / questions.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.h3
          key={currentQ}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-2xl font-semibold mb-6 min-h-[6rem] text-gray-800"
        >
          {currentQ + 1}. {q.question}
        </motion.h3>
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center">
        {q.options.map(opt => {
          const isSelected = answers[currentQ] === opt;
          return (
            <motion.button
              key={opt}
              onClick={() => onOptionClick(currentQ, opt)}
              whileHover={{ scale: 0.95 }}
              whileTap={{ scale: 0.85 }}
              className={`relative max-w-md w-full flex justify-between items-center p-4 rounded-lg border-2 text-left text-lg transition-all duration-200 shadow-sm
                ${isSelected
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 border-blue-600 text-white shadow-md scale-105'
                  : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-blue-50 hover:border-blue-300'}
              `}
            >
              <div className="flex items-center justify-center gap-2 w-full">
                <span className="font-semibold text-center">{opt}</span>
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex items-center gap-1 text-sm bg-green-500 text-white px-2 py-1 rounded-full shadow-md"
                  >
                    <span>👈</span>
                    <span className="hidden sm:inline">Selected</span>
                  </motion.span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="flex justify-end mt-8">
        {currentQ < questions.length - 1 ? (
          <motion.button
            onClick={() => setCurrentQ(q => q + 1)}
            disabled={!answers[currentQ]}
            whileHover={{ scale: 1.05 }}
            className="px-6 py-2 bg-brand-primary text-white rounded-lg disabled:opacity-50"
          >
            Next →
          </motion.button>
        ) : (
          <motion.button
            onClick={finishExam}
            disabled={!answers[currentQ]}
            whileHover={{ scale: 1.05 }}
            className="px-6 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50"
          >
            Finish Exam
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// --- Exam Result Component ---
const ExamResult = ({ score, questions, answers, onRestart }) => {
  const [showReview, setShowReview] = useState(false);

  const getFinalFeedback = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) return { title: "Perfect Score! 🌟", message: "Aapne saare jawaab sahi diye!", motivation: "Aap toh genius ho!" };
    if (percentage >= 75) return { title: "Excellent Effort! 🎉", message: "Bahut achha khela aapne!", motivation: "Thodi aur practice se perfect ho jaoge!" };
    if (percentage >= 50) return { title: "Good Try! 👍", message: "Aapne achhi koshish ki!", motivation: "Har galti ek naya mauka hai seekhne ka." };
    return { title: "Keep Going! 💪", message: "Himmat mat haro!", motivation: "Seekhne ka safar jaari rakhein." };
  };

  const finalFeedback = getFinalFeedback();

  return (
    <div className="text-center p-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl w-full max-w-2xl mx-auto shadow-2xl relative">
      <Confetti recycle={false} />
      <motion.h2 initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-4xl font-display font-bold text-blue-700 mb-2">{finalFeedback.title}</motion.h2>
      <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-3xl mt-2 mb-4">Your Score: {score} / {questions.length}</motion.p>
      <motion.p initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay: 0.4}} className="text-xl font-semibold text-blue-600 mb-2 italic">"{finalFeedback.message}"</motion.p>
      <motion.p initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay: 0.6}} className="text-md text-gray-600 mb-6">{finalFeedback.motivation}</motion.p>

      <div className="flex gap-4 justify-center">
        <motion.button onClick={onRestart} whileHover={{ scale: 1.05 }} className="px-6 py-2 bg-indigo-500 text-white rounded-lg font-semibold">Give Another Exam</motion.button>
        <motion.button onClick={() => setShowReview(!showReview)} whileHover={{ scale: 1.05 }} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold">{showReview ? 'Hide Review' : 'Review Answers'}</motion.button>
      </div>

      <AnimatePresence>
        {showReview && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-6 text-left space-y-4 overflow-hidden">
            {questions.map((q, index) => (
              <div key={index} className={`p-4 rounded-lg ${answers[index] === q.correct_answer ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                <p className="font-bold">{index + 1}. {q.question}</p>
                <p className="mt-1 text-gray-700">Your answer: <span className="font-semibold">{answers[index] || "Not Answered"}</span></p>
                {answers[index] !== q.correct_answer && <p className="text-green-800 font-bold">Correct answer: {q.correct_answer}</p>}
                <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800"><span className="font-bold">Explanation:</span> {q.explanation}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main ExamMode Component ---
export default function ExamMode({ session }) {
  const { profile, updateProfile } = useProfile(session?.user);
  const { language } = useContext(LanguageContext);
  const [view, setView] = useState('config');
  const [config, setConfig] = useState({ subject: 'Science', chapter: '', count: 10 });
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const startExam = async () => {
    if (!config.subject) return toast.error("Please select a subject.");
    setLoading(true);
    try {
      const data = await fetchExamQuestions(config.subject, config.chapter, config.count, profile.user_class, language);
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setAnswers({});
        setCurrentQ(0);
        setScore(0);

        let duration = 0;
        if (config.count === 10) duration = 7 * 60;      
        else if (config.count === 20) duration = 15 * 60; 
        else if (config.count === 50) duration = 40 * 60; 
        setTimeLeft(duration);
        setView('exam');
      } else toast.error("Could not generate questions for this topic.");
    } catch {
      toast.error("Exam generate karne me problem hui.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionIndex, answer) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  // ✅ updated finishExam function with XP reward
  const finishExam = async () => {
    let finalScore = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correct_answer) {
        finalScore++;
      }
    });
    setScore(finalScore);
    winSound.play();
    setView('result');

    if (session.user) {
      try {
        // Step 1: Save the raw result
        await saveExamResult(session.user.id, config.subject, config.chapter, finalScore, questions.length);

        // Step 2: Award XP and log activity
        const xpEarned = finalScore * 10; // 10 XP per correct answer
        await awardXpAndLogActivity(session.user.id, xpEarned, 'exam_completed');

        toast.success("Aapka result save ho gaya hai!");
        updateProfile();
      } catch (error) {
        console.error("Error saving exam result:", error);
        toast.error("Aapka result save nahi ho paaya.");
      }
    }
  };

  useEffect(() => {
    if (view === 'exam' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (view === 'exam' && timeLeft === 0) {
      toast.error("Time's up!");
      finishExam();
    }
  }, [timeLeft, view]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${s % 60 < 10 ? '0' : ''}${s % 60}`;

  if (loading) return <div className="flex flex-col items-center justify-center"><GyanDostMascot state="thinking" /><p>Generating your exam...</p></div>;
  if (view === 'exam') return <ExamPlayer {...{ questions, config, timeLeft, formatTime, handleAnswer, answers, currentQ, setCurrentQ, finishExam }} />;
  if (view === 'result') return <ExamResult {...{ score, questions, answers, onRestart: () => setView('config') }} />;
  return <ExamConfig {...{ config, setConfig, startExam, loading }} />;
}
