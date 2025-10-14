import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '../hooks/useProfile.js';
import { LanguageContext } from '../context/LanguageContext.jsx';
import { fetchGameTopics, fetchGameData, fetchConceptMatchData } from '../api.js';
import GyanDostMascot from "./GyanDostMascot.jsx";
import SearchComponent from "./SearchComponent.jsx";
import RiddleGame from "./games/RiddleGame.jsx";
import TrueOrFalse from "./games/TrueOrFalse.jsx";
import TimelineScramble from './games/TimelineScramble.jsx';
import ConceptMatch from './games/ConceptMatch.jsx';
import { toast } from 'react-hot-toast';

export default function GameLobby({ session }) {
  const { gameType } = useParams();
  const { profile } = useProfile(session?.user);
  const { language } = useContext(LanguageContext);
  const [suggestedTopics, setSuggestedTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getTopics = async (gameType) => {
      setTopicsLoading(true);
      try {
        const topics = await fetchGameTopics(gameType, profile.user_class, language);
        setSuggestedTopics(topics.topics || topics);
      } catch (error) {
        console.error("Error fetching topics:", error);
        toast.error("Kuch dikkat aayi! Default topics dikha rahe hain 🧩");
        setSuggestedTopics([
          { name: "Animal Fun", difficulty: "easy" },
          { name: "Food Puzzles", difficulty: "medium" },
          { name: "Nature Secrets", difficulty: "easy" },
          { name: "School Riddles", difficulty: "medium" },
          { name: "Family Jokes", difficulty: "easy" }
        ]);
      } finally {
        setTopicsLoading(false);
      }
    };

    if (profile && gameType) getTopics(gameType);
  }, [profile, gameType, language]);

  const handleTopicSelect = (topic) => {
    if (topic.trim()) startGame(topic);
  };

  const startGame = async (topic) => {
    if (!topic.trim()) return;
    setLoading(true);
    setGameData(null);
    try {
      let res;
      if (gameType === 'concept_match') {
        res = await fetchConceptMatchData(topic, profile.user_class, language);
      } else {
        res = await fetchGameData(topic, gameType, profile.user_class, language);
        res = res.gameData;
      }
      const dataToSet = { ...res, type: gameType, topic };
      setGameData(dataToSet);
    } catch (error) {
      toast.error("Sorry, is topic par game banane me dikkat hui. 😅");
    } finally {
      setLoading(false);
    }
  };

  const renderGame = () => {
    if (!gameData) return null;
    const onRestart = () => setGameData(null);

    switch (gameData.type) {
      case 'riddle':
        return <RiddleGame data={gameData} onRestart={onRestart} session={session} />;
      case 'true_or_false':
        return <TrueOrFalse data={gameData} onRestart={onRestart} session={session} />;
      case 'timeline_scramble':
        return <TimelineScramble data={gameData} onRestart={onRestart} session={session} />;
      case 'concept_match':
        return <ConceptMatch data={gameData} topic={gameData.topic} onRestart={onRestart} session={session} />;
      default:
        return (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 font-bold"
          >
            Game load nahi ho paaya. Please try a different topic. 😅
          </motion.p>
        );
    }
  };

  // 🔄 Show loading mascot while game data is fetching
  if (loading && !gameData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-indigo-50 to-pink-50">
        <GyanDostMascot state="thinking" height="160px" width="160px" />
        <motion.p
          className="mt-4 text-lg text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Game taiyar kar rahe hain... 🧠
        </motion.p>
      </div>
    );
  }

  if (gameData) return renderGame();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 py-10 px-4 overflow-hidden">
      <motion.div
        className="max-w-5xl mx-auto text-center relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Title with glow */}
        <motion.h1
          className="text-5xl sm:text-6xl font-display font-bold capitalize mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
        >
          {gameType.replace(/_/g, ' ')} Zone 🎮
        </motion.h1>

        <motion.div
          className="mt-10 bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/50"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="text-3xl sm:text-4xl font-bold font-display mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Suggested Topics 🧠
          </motion.h2>

          {/* Topic Grid */}
          <AnimatePresence>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
              }}
              initial="hidden"
              animate="visible"
            >
              {topicsLoading ? (
                <div className="col-span-full flex flex-col items-center justify-center text-gray-600">
                  <GyanDostMascot state="thinking" height="120px" width="120px" />
                  <motion.p
                    className="mt-4 italic text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Topics laa rahe hain... ⏳
                  </motion.p>
                </div>
              ) : suggestedTopics.length > 0 ? (
                suggestedTopics.map((topic, index) => (
                  <motion.button
                    key={topic.name || topic}
                    onClick={() => startGame(topic.name || topic)}
                    className="relative bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-5 rounded-2xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group"
                    whileHover={{ scale: 1.05, rotate: 1 }}
                    whileTap={{ scale: 0.97 }}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <span className="relative z-10 text-lg">
                      {topic.name || topic} ✨
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  </motion.button>
                ))
              ) : (
                <motion.p
                  className="col-span-full text-gray-500 italic text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Koi topic nahi mila? Niche search karo! 🔍
                </motion.p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Divider */}
          <div className="my-8 flex items-center justify-center">
            <hr className="flex-grow border-gray-300" />
            <span className="px-4 text-gray-600 font-semibold">YA</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Search Box */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <SearchComponent
              onSearch={handleTopicSelect}
              placeholder="Apna topic likhein ya bolo (mic se)... 🎤"
              buttonText="Khele! 🎯"
              loading={loading}
              className="w-full"
            />
          </motion.div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Link
            to="/game-zone"
            className="inline-flex items-center text-gray-700 hover:text-indigo-600 font-semibold text-lg transition-all duration-300 hover:scale-105"
          >
            <motion.span
              className="mr-2"
              whileHover={{ x: -5 }}
              transition={{ duration: 0.2 }}
            >
              ‹
            </motion.span>
            Wapas Game Zone me Jaayein
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
