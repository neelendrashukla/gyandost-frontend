import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Howl, Howler } from "howler";
import { Toaster } from "react-hot-toast";
import GyanDostMascot from "./GyanDostMascot.jsx";
import { LanguageContext } from "../context/LanguageContext.jsx";

// 🎶 Sound
const popSound = new Howl({ src: ["/sounds/pop.mp3"] });

// 🎴 Dashboard Card
function DashboardCard({ to, title, description, gradient, icon, delay, setMascotState }) {
  const colorMap = {
    "AI Tutor": { title: "#38bdf8", desc: "#a78bfa" },
    "Sanskriti aur Gyan": { title: "#f97316", desc: "#facc15" },
    "AI ke Ajoobe": { title: "#14b8a6", desc: "#3b82f6" },
    "Mind Map Explorer": { title: "#34d399", desc: "#fcd34d" },
    "Exam Mode": { title: "#dc2626", desc: "#fb7185" },
    "Game Zone": { title: "#ef4444", desc: "#f472b6" },
    "Imagination's Flight": { title: "#8b5cf6", desc: "#ec4899" },
  };

  const colors = colorMap[title] || { title: "#ffffff", desc: "#d1d5db" };

  const handleClick = () => {
    popSound.play();
    setMascotState("success");
    setTimeout(() => setMascotState("idle"), 2000);
  };

  return (
    <Link to={to} onClick={handleClick}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: delay,
          type: "spring",
          stiffness: 100,
        }}
        whileHover={{ scale: 1.05, y: -8 }}
        whileTap={{ scale: 0.97 }}
        className={`p-6 rounded-3xl flex flex-col sm:flex-row-reverse items-center justify-between gap-6 shadow-2xl transition-all duration-300 ${gradient} animate-float`}
        style={{ animationDelay: `${delay}s` }}
      >
        {/* Icon Right Side */}
        <div className="flex-shrink-0 bg-white/25 rounded-full w-52 h-52 flex items-center justify-center shadow-lg">
          <img
            src={icon}
            alt={title}
            className="object-contain"
            style={{ width: "140px", height: "140px" }}
          />
        </div>

        {/* Text Left Side */}
        <div className="flex-1 text-center sm:text-left">
          <h3
            className="text-3xl md:text-4xl font-display font-bold drop-shadow-lg"
            style={{ color: colors.title }}
          >
            {title}
          </h3>
          <p
            className="mt-2 text-lg md:text-xl font-sans leading-relaxed"
            style={{ color: colors.desc }}
          >
            {description}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}

// ✨ Floating Star Particle (Brighter & Glowing)
const StarParticle = ({ size, top, left, animationDuration, delay }) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: size,
      height: size,
      top: `${top}%`,
      left: `${left}%`,
      background: "radial-gradient(circle, #fff7b2, #ffd700, #ffae00)",
      boxShadow: `
        0 0 ${size * 3}px #fffecb,
        0 0 ${size * 5}px #fff03a,
        0 0 ${size * 10}px #ffdb4d,
        0 0 ${size * 15}px #fff799
      `,
    }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, 1, 1, 0], scale: [0, 1, 1, 0] }}
    transition={{
      duration: animationDuration,
      repeat: Infinity,
      delay: delay,
      ease: "easeInOut",
    }}
  />
);

// 🌌 Main Dashboard
export default function Dashboard({ session, profile }) {
  const userName = profile?.full_name || "Dost";
  const userClass = profile?.user_class || "";
  const [mascotState, setMascotState] = useState("waving");
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    const timer = setTimeout(() => setMascotState("idle"), 3000);
    return () => clearTimeout(timer);
  }, []);

  // 🔊 Unlock audio context on first interaction
  useEffect(() => {
    const unlockAudio = () => {
      Howler.ctx.resume().then(() => {
        document.body.removeEventListener("click", unlockAudio);
      });
    };
    document.body.addEventListener("click", unlockAudio);
    return () => document.body.removeEventListener("click", unlockAudio);
  }, []);

  const cards = [
    {
      to: "/ai-tutor",
      title: "AI Tutor",
      description: "Kisi bhi topic par AI se detail me seekhein.",
      gradient: "bg-gradient-to-br from-blue-600 to-purple-700",
      icon: "/icons/ai_tutor.png",
    },
    {
      to: "/sanskriti-gyan",
      title: "Sanskriti aur Gyan",
      description: "Explore Ramayan, Mahabharat, and Gita.",
      gradient: "bg-gradient-to-br from-orange-500 to-red-600",
      icon: "/icons/sanskriti.png",
    },
    {
      to: "/ai-ke-ajoobe",
      title: "AI ke Ajoobe",
      description: "Learn about AI and future tech in a fun way.",
      gradient: "bg-gradient-to-br from-gray-700 to-gray-900",
      icon: "/icons/ai_ajoobe.png",
    },
    {
      to: "/mind-map-explorer",
      title: "Mind Map Explorer",
      description: "Topics ko visually explore karein.",
      gradient: "bg-gradient-to-br from-green-500 to-teal-600",
      icon: "/icons/mind_map.png",
    },
    {
      to: "/exam-mode",
      title: "Exam Mode",
      description: "Apni knowledge ko test karein.",
      gradient: "bg-gradient-to-br from-red-500 to-rose-600",
      icon: "/icons/exam.png",
    },
    {
      to: "/game-zone",
      title: "Game Zone",
      description: "Khel-khel me seekhein mazedaar puzzles.",
      gradient: "bg-gradient-to-br from-pink-500 to-rose-500",
      icon: "/icons/game_zone.png",
    },
    {
      to: "/creative-corner",
      title: "Imagination's Flight",
      description:
        "AI ke saath milkar apni kalpana ko kahaniyon, kavitaon, aur natakon me badlo!",
      gradient: "bg-gradient-to-br from-yellow-400 to-amber-500",
      icon: "/icons/creative.png",
    },
  ];

  const generateStars = () => {
    const stars = [];
    for (let i = 0; i < 40; i++) {
      stars.push(
        <StarParticle
          key={i}
          size={Math.random() * 10 + 5}
          top={Math.random() * 100}
          left={Math.random() * 100}
          animationDuration={Math.random() * 8 + 6}
          delay={Math.random() * 6}
        />
      );
    }
    return stars;
  };

  return (
    <div className="relative min-h-screen p-4 sm:p-6 md:p-10 overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {generateStars()}

      <motion.div
        className="max-w-7xl mx-auto relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Title */}
        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold leading-tight text-yellow-400 drop-shadow-2xl animate-pulse">
            Welcome To GyanDost Universe 🌌
          </h1>
          <p className="mt-3 sm:mt-4 text-lg sm:text-xl md:text-2xl text-white/80 font-light">
            Apni learning adventure chunein!
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <DashboardCard
              key={card.title}
              {...card}
              delay={1 + index * 0.1}
              setMascotState={setMascotState}
            />
          ))}
        </div>
      </motion.div>

      {/* Mascot */}
      <motion.div
        className="absolute bottom-3 sm:bottom-5 right-3 sm:right-5 z-20"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          delay: cards.length * 0.1 + 1.5,
          type: "spring",
          stiffness: 100,
        }}
      >
        <GyanDostMascot state={mascotState} size="large" />
      </motion.div>

      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </div>
  );
}

