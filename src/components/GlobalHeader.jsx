import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentLevel } from '../utils/levels.js';
import ProfileDropdown from './ProfileDropdown.jsx';
import { fetchUserAchievements } from '../api.js';

// 🏅 Badge Card
const BadgeCard = ({ badge, isUnlocked }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className={`flex flex-col items-center text-center p-3 rounded-xl shadow-lg border
      ${isUnlocked
        ? "bg-yellow-500/20 border-yellow-400/40"
        : "bg-gray-700/30 border-gray-600/30 opacity-50"
      }`}
  >
    <div className="text-4xl mb-2">{badge.icon || "🏅"}</div>
    <p className="font-bold text-white">{badge.title}</p>
    <p className="text-xs text-gray-300 mt-1">{badge.description}</p>
  </motion.div>
);

export default function GlobalHeader({ session, profile }) {
  const [isTrophyModalOpen, setIsTrophyModalOpen] = useState(false);
  const [achievements, setAchievements] = useState({ earnedBadges: [], allBadges: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      setLoading(true);
      fetchUserAchievements(session.user.id)
        .then(setAchievements)
        .finally(() => setLoading(false));
    }
  }, [session, profile]);

  if (!profile) return null;

  const levelInfo = getCurrentLevel(profile.xp || 0);
  const xpForNextLevel = levelInfo.id * 500;
  const xpProgress = profile.xp ? ((profile.xp % 500) / 500) * 100 : 0;
  const earnedBadgeIds = new Set(achievements.earnedBadges.map(b => b.id));

  return (
    <>
      {/* 🔹 HEADER */}
      <header className="flex flex-col gap-2 mb-4 px-3 py-2 
        bg-gradient-to-r from-[#0f172a]/90 via-[#1e293b]/90 to-[#0f172a]/90 
        backdrop-blur-md rounded-2xl shadow-lg border border-white/20 
        sticky top-3 z-50 md:flex-row md:items-center md:justify-between">

        {/* 🎓 Logo + Profile */}
        <div className="flex justify-between items-center w-full">
          <Link to="/" className="text-2xl md:text-3xl font-display font-bold text-star-yellow">
            🎓 GyanDost
          </Link>
          <ProfileDropdown profile={profile} />
        </div>

        {/* 🌟 Level + XP + Streak + Trophy (Common block for both mobile & desktop) */}
        <motion.div
          onClick={() => setIsTrophyModalOpen(true)}
          whileHover={{ scale: 1.02 }}
          className="flex flex-col md:flex-row items-center justify-between gap-3 px-4 py-2
          bg-white/10 rounded-xl border border-white/10 shadow-inner cursor-pointer 
          hover:bg-white/15 transition-all"
        >
          {/* 🧠 Level Info */}
          <div className="text-center md:text-left text-white flex flex-col min-w-[180px]">
            <span className="text-sm md:text-base font-semibold text-cyan-300">
              Level {levelInfo.id} – {levelInfo.name} {levelInfo.icon}
            </span>
            <span className="text-xs text-gray-300">
              {profile.xp || 0} / {xpForNextLevel} XP
            </span>
          </div>

          {/* 🟢 XP Bar */}
          <div className="w-full md:flex-1 md:max-w-[300px]">
            <div className="w-full bg-black/30 rounded-full h-2.5 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 h-2.5 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.6)]"
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>

          {/* 🔥 Streak */}
          <div
            className="flex items-center gap-1 text-orange-400 font-bold text-base md:text-lg"
            title={`${profile.current_streak || 0} Day Streak!`}
          >
            <span>{profile.current_streak || 0}</span>
            <span className="text-xl md:text-2xl">🔥</span>
          </div>

          {/* 🏆 Trophy Count */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsTrophyModalOpen(true);
            }}
            className="flex items-center gap-2 text-yellow-300 font-bold text-base md:text-lg 
              bg-yellow-500/10 border border-yellow-400/30 rounded-full px-4 py-1.5 
              shadow-[0_0_12px_rgba(250,204,21,0.4)] hover:bg-yellow-500/20 
              hover:shadow-[0_0_18px_rgba(250,204,21,0.6)] transition-all"
          >
            🏆
            <span>{loading ? "..." : achievements.earnedBadges.length}</span>
          </motion.button>
        </motion.div>
      </header>

      {/* 🏅 TROPHY MODAL */}
      <AnimatePresence>
        {isTrophyModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[#1e293b]/90 border border-white/20 rounded-2xl p-6 w-[90%] md:w-[600px] shadow-2xl overflow-y-auto max-h-[80vh]"
            >
              <h2 className="text-2xl font-bold text-yellow-300 flex items-center gap-2 mb-4">
                🏆 My Trophy Room
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {achievements.allBadges.map(badge => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    isUnlocked={earnedBadgeIds.has(badge.id)}
                  />
                ))}
              </div>

              <motion.button
                onClick={() => setIsTrophyModalOpen(false)}
                whileHover={{ scale: 1.1 }}
                className="mt-6 w-full py-2 bg-yellow-400/20 text-yellow-300 rounded-xl border border-yellow-400/40 hover:bg-yellow-400/30 transition-all"
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
