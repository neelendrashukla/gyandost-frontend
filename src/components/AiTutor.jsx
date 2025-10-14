import React, { useState, useContext, useEffect } from 'react';
import { useProfile } from "../hooks/useProfile.js";
import { LanguageContext } from '../context/LanguageContext.jsx';
import { fetchTutorResponse, fetchCompletionQuiz, awardXpAndLogActivity } from "../api.js";
import { toast } from 'react-hot-toast';
import ChatInterface from "./ChatInterface.jsx";
import SearchComponent from './SearchComponent.jsx';
import TopicSelector from './TopicSelector.jsx';
import CompletionQuiz from './CompletionQuiz.jsx';
import QuizResult from './QuizResult.jsx';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import GyanDostMascot from './GyanDostMascot.jsx';

const popularSchoolTopics = [
  { name: 'Basic Math', icon: '➗', color: 'bg-pink-500'},
  { name: 'Indian History and Culture', icon: '🕌', color: 'bg-yellow-500'},
  { name: 'Water Cycle', icon: '💧', color: 'bg-blue-500' },
  { name: 'Solar System', icon: '🪐', color: 'bg-indigo-500' },
  { name: 'Photosynthesis', icon: '🌿', color: 'bg-green-500' },
  { name: 'Human Heart', icon: '❤️', color: 'bg-red-500' },
  { name: 'Moral Science', icon: '📚', color: 'bg-yellow-500' },
  { name: 'Pythagorean Theorem', icon: '📐', color: 'bg-yellow-500' },
  { name: 'Newton\'s Laws', icon: '🍎', color: 'bg-orange-500' },
  { name: 'Periodic Table', icon: '🧪', color: 'bg-purple-500' },
  { name: 'World War I', icon: '🌍', color: 'bg-gray-700' },
  { name: 'True Democracy vs False Democracy', icon: '🗳️', color: 'bg-gray-800' },
  { name: 'Electric Circuits', icon: '💡', color: 'bg-yellow-400' },
  { name: 'Popular Technologies', icon: '🌐', color: 'bg-indigo-600'},
  { name: 'Sports', icon: '🏏', color: 'bg-red-300'},
  { name: 'Climate Change', icon: '🌡️', color: 'bg-red-400' },
  { name: 'Ecosystems', icon: '🌳', color: 'bg-green-400' },
  { name: 'Basic Chemistry', icon: '⚗️', color: 'bg-purple-300' },
  { name: 'Fractions', icon: '➗', color: 'bg-pink-400' },
  { name: 'Grammar Basics', icon: '📝', color: 'bg-yellow-300' },
  { name: 'Computer Basics', icon: '💻', color: 'bg-gray-400' },
  { name: 'Computer Programming', icon: '💻', color: 'bg-gray-600' },
  { name: 'States of Matter', icon: '🧊', color: 'bg-cyan-400' },
  { name: 'Human Body Systems', icon: '🫀', color: 'bg-red-300' },
  { name: 'Simple Machines', icon: '⚙️', color: 'bg-gray-500' },
  { name: 'Famous Inventors', icon: '🧑‍🔬', color: 'bg-purple-400' },
  { name: 'Ancient Civilizations', icon: '🏺', color: 'bg-yellow-600' },
  { name: 'Basic Economics', icon: '💰', color: 'bg-green-600' },
  { name: 'Digital Citizenship', icon: '🌐', color: 'bg-blue-600' },
  { name: 'Geometry', icon: '📏', color: 'bg-pink-600' },
  { name: 'Algebra', icon: '🔢', color: 'bg-red-600' },
  { name: 'Basic Geography', icon: '🗺️', color: 'bg-green-600' },
  { name: 'Darwin ki Vikasavad', icon: '🦖', color: 'bg-green-700' },
  { name: 'Famous Scientists', icon: '🔬', color: 'bg-purple-600' },
];

export default function AiTutor({ session }) {
  const { profile, updateProfile } = useProfile(session?.user);
  const { language } = useContext(LanguageContext);

  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [currentTopic, setCurrentTopic] = useState('');
  const [viewMode, setViewMode] = useState('topic_selection');
  const [completionQuiz, setCompletionQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const handleAPIRequest = async (newMessage, history) => {
    if (!profile?.user_class) return;
    setLoading(true);

    const historyForAPI = history.map(m => ({
      role: m.sender === 'ai' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

    try {
      const res = await fetchTutorResponse(
        historyForAPI,
        newMessage,
        profile.user_class,
        language,
        profile.level
      );

      setConversation(prev => [...prev, { sender: 'ai', text: res.response }]);
    } catch (error) {
      toast.error("AI se connect nahi ho paaya.");
      const friendlyError = error.message.includes("busy") 
          ? "Oh no! 😴 Lagta hai mera dimaag abhi thoda thak gaya hai. Please ek minute baad phir se try karein!"
          : "Oops!🤭 Kuch gadbad ho gayi. Main ise theek karne ki koshish kar raha hoon.";
      setConversation(prev => [...prev, { sender: 'ai', text: friendlyError }]);
    } finally {
      setLoading(false);
    }
  };

  const startLesson = (topicToStart) => { 
    if (!topicToStart.trim()) return;
    setCurrentTopic(topicToStart);
    setConversation([]);
    setViewMode('lesson');
    handleAPIRequest(`Teach me about: ${topicToStart}`, []);
  };

  const handleUserReply = (replyText) => {
    const newConvo = [...conversation, { sender: 'user', text: replyText }];
    setConversation(newConvo);
    handleAPIRequest(replyText, newConvo);
  };

  const handleTopicComplete = async () => {
    setLoading(true);
    try {
      const historyForAPI = conversation.map(m => ({
        role: m.sender === 'ai' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));
      const data = await fetchCompletionQuiz(currentTopic, historyForAPI, profile.user_class, language);
      setCompletionQuiz(data.questions);
      setViewMode('quiz');
    } catch (error) {
      toast.error("Quiz generate karne me problem hui.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = async (answers) => {
    setQuizAnswers(answers);
    let score = 0;
    completionQuiz.forEach((q, index) => {
      if (answers[index] === q.correct_answer) score++;
    });

    const xpEarned = score * 2; 
    toast.success(`Quiz Complete! You earned ${xpEarned} XP! ✨`);

    const result = await awardXpAndLogActivity(session.user.id, xpEarned, 'ai_tutor_lesson');

    if (result?.leveled_up) {
      setShowLevelUp(true);
      toast.success(`LEVEL UP! You are now Level ${result.new_level}! 🎉`);
      setTimeout(() => setShowLevelUp(false), 5000);
    }

    await updateProfile(); 
    setViewMode('result');
  };

  const resetAll = () => {
    setViewMode('topic_selection');
    setConversation([]);
    setCompletionQuiz(null);
    setQuizAnswers(null);
    setCurrentTopic('');
  };

  const showCompleteButton = conversation.length > 3 && viewMode === 'lesson';

  // ----------------------------- Views -----------------------------
  if (viewMode === 'topic_selection') {
    return (
      <div className="max-w-full md:max-w-3xl px-4 mx-auto space-y-4 text-center relative">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-purple-600">🎓 AI Tutor</h2>
        <p className="text-gray-500 mt-2">Duniya ka koi bhi topic seekhein, apni bhasha me!</p>
        <div className="flex justify-center my-4">
          <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48">
            <GyanDostMascot mood="idle" />
          </div>
        </div>
        <TopicSelector
          onTopicSelect={startLesson}
          popularTopics={popularSchoolTopics}
          title="Kisi popular topic par click karke seekhein..."
        />
        <div className="flex items-center text-center">
          <hr className="w-full" />
          <span className="px-2 text-gray-400">YA</span>
          <hr className="w-full" />
        </div>
        <SearchComponent
          onSearch={startLesson}
          placeholder="Koi bhi topic search karein..."
          buttonText="Start Lesson"
          loading={loading}
        />
      </div>
    );
  }

  if (viewMode === 'quiz') {
    return (
      <CompletionQuiz
        questions={completionQuiz}
        onSubmit={handleQuizSubmit}
        onCancel={() => setViewMode('lesson')}
      />
    );
  }

  if (viewMode === 'result') {
    let score = 0;
    completionQuiz.forEach((q, index) => {
      if (quizAnswers[index] === q.correct_answer) score++;
    });
    return (
      <QuizResult
        score={score}
        questions={completionQuiz}
        answers={quizAnswers}
        onFinish={resetAll}
      />
    );
  }

  // Lesson view
  return (
    <div className="max-w-full md:max-w-4xl px-4 mx-auto relative">
      {showLevelUp && <Confetti numberOfPieces={window.innerWidth < 768 ? 150 : 400} />}
      <div className="flex flex-col gap-2 md:gap-4 items-center mb-4">
        <Link to="/" className="bg-gray-200 px-4 py-3 rounded-lg hover:bg-gray-300 text-center w-full md:w-auto">
          ‹ Dashboard
        </Link>
        <button onClick={resetAll} className="bg-gray-200 px-4 py-3 rounded-lg w-full md:w-auto">
          ‹ Naya Topic Chunein
        </button>
        {showCompleteButton && (
          <motion.button
            onClick={handleTopicComplete}
            className="bg-green-500 text-white font-bold px-4 py-3 rounded-lg shadow-lg w-full md:w-auto animate-pulse"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Take Final Test! ✅
          </motion.button>
        )}
      </div>

      <div className="w-full h-[60vh] md:h-[70vh] overflow-y-auto" id="chat-container">
        <ChatInterface
          messages={conversation}
          onOptionClick={handleUserReply}
          onSendMessage={handleUserReply}
          loading={loading}
        />
      </div>
    </div>
  );
}
