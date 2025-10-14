import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { Link } from "react-router-dom";
import { fetchUserAchievements } from "../api.js";

const BadgeCard = ({ badge, isUnlocked }) => (
  <motion.div
    whileHover={{ scale: 1.1, rotate: 2 }}
    whileTap={{ scale: 0.95 }}
    className={`p-4 rounded-xl text-center shadow-md transition-all duration-300 
      ${isUnlocked ? "bg-yellow-100 hover:shadow-lg" : "bg-gray-200 opacity-60 hover:opacity-80"}`}
  >
    <p className={`text-5xl ${!isUnlocked && "opacity-40"}`}>{badge.icon}</p>
    <p className={`font-bold mt-2 text-sm ${!isUnlocked && "text-gray-500"}`}>{badge.title}</p>
  </motion.div>
);

export default function TrophyRoom({ session }) {
  const [achievements, setAchievements] = useState({ earnedBadges: [], allBadges: [] });
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setLoading(true);
      fetchUserAchievements(session.user.id)
        .then((data) => {
          setAchievements(data);
          if (data.newlyUnlocked) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 4000);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [session]);

  const earnedBadgeIds = new Set(achievements.earnedBadges.map((b) => b.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 p-6 pt-28"
    >
      {/* 🧨 Confetti */}
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}

      {/* 🔙 Back to Home */}
      <Link
        to="/"
        className="text-blue-600 hover:underline block mb-6 text-center text-lg font-semibold"
      >
        ← Back to Home
      </Link>

      {/* 🏆 Header */}
      <h1 className="text-4xl font-bold text-center text-yellow-700 mb-6">
        🏆 My Trophy Room
      </h1>

      {/* Content */}
      {loading ? (
        <p className="text-center text-gray-500 text-lg">
          Loading your achievements...
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {achievements.allBadges.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              isUnlocked={earnedBadgeIds.has(badge.id)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
