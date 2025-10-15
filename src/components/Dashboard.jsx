import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Howl, Howler } from "howler";
import { Toaster } from "react-hot-toast";
import GyanDostMascot from "./GyanDostMascot.jsx";
import { LanguageContext } from "../context/LanguageContext.jsx";

// 🎵 Sound
const popSound = new Howl({ src: ["/sounds/pop.mp3"] });

// ✨ Dashboard Card
function DashboardCard({ to, title, description, gradient, icon, delay, setMascotState }) {
  const colorMap = {
    "AI Tutor": { title: "#2563EB", desc: "#EC4899" },
    "Sanskriti aur Gyan": { title: "#D97706", desc: "#FBBF24" },
    "AI ke Ajoobe": { title: "#0EA5E9", desc: "#10B981" },
    "Mind Map Explorer": { title: "#DC2626", desc: "#FB923C" },
    "Exam Mode": { title: "#8B5CF6", desc: "#F472B6" },
    "Game Zone": { title: "#16A34A", desc: "#F0ABFC" },
    "Imagination's Flight": { title: "#2B6CB0", desc: "#E8B4F8" },
  };

  const colors =
    colorMap[title.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim()] ||
    { title: "#ffffff", desc: "#d1d5db" };

  const handleClick = () => {
    popSound.play();
    setMascotState("success");
    setTimeout(() => setMascotState("idle"), 2000);
  };

  // Separate emojis & text
  const extractEmojis = (text) =>
    text.match(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu)?.join(" ") || "";
  const extractText = (text) =>
    text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim();

  const emojiTitle = extractEmojis(title);
  const plainTitle = extractText(title);
  const emojiDesc = extractEmojis(description);
  const plainDesc = extractText(description);

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
        className={`relative p-6 rounded-3xl flex flex-col sm:flex-row-reverse items-center justify-between gap-6 shadow-2xl transition-all duration-300 ${gradient} overflow-hidden group`}
      >
        {/* Diagonal 45° Shine */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-r from-transparent via-white/40 to-transparent 
            transform -rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out">
          </div>
        </div>

        {/* Icon */}
        <div className="flex-shrink-0 bg-white/25 rounded-full w-52 h-52 flex items-center justify-center shadow-lg">
          <img
            src={icon}
            alt={plainTitle}
            className="object-contain"
            style={{ width: "140px", height: "140px" }}
          />
        </div>

        {/* Text */}
        <div className="flex-1 text-center sm:text-left relative z-10">
          {/* Title */}
          <h3
            className="text-3xl md:text-4xl font-display font-bold drop-shadow-lg flex items-center justify-center sm:justify-start gap-2"
            style={{
              background: `linear-gradient(90deg, ${colors.title}, ${colors.desc})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            <span>{plainTitle}</span>
            <span style={{ WebkitTextFillColor: "initial" }}>{emojiTitle}</span>
          </h3>

          {/* Description */}
          <p
            className="mt-2 text-lg md:text-xl font-sans leading-relaxed flex flex-wrap items-center justify-center sm:justify-start gap-1"
            style={{
              background: `linear-gradient(90deg, ${colors.desc}, ${colors.title})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            <span>{plainDesc}</span>
            <span style={{ WebkitTextFillColor: "initial" }}>{emojiDesc}</span>
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
// ✨ Star Particle
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
  const [mascotState, setMascotState] = useState("waving");
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    const timer = setTimeout(() => setMascotState("idle"), 3000);
    return () => clearTimeout(timer);
  }, []);

  // 🔊 Unlock audio context
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
      title: "AI Tutor 🎓",
      description: "Kisi bhi topic pe AI se deep dive karo—easy, fun aur detailed learning! 📚✨",
      gradient: "bg-gradient-to-br from-blue-600 to-purple-700",
      icon: "/icons/ai_tutor.png",
    },
    {
      to: "/sanskriti-gyan",
      title: "Sanskriti aur Gyan 🏛️",
      description: "Apni virasat 🏛️, apna gyan 📚, apni pehchaan - Bhartiya sanskriti ka safar! 🌟🚀",
      gradient: "bg-gradient-to-br from-orange-500 to-red-600",
      icon: "/icons/sanskriti.png",
    },
    {
      to: "/ai-ke-ajoobe",
      title: "AI ke Ajoobe 🪄",
      description: "Magical AI world mein step in! Fun stories & tips se future tech seekho! 🤖🚀✨",
      gradient: "bg-gradient-to-br from-gray-700 to-gray-900",
      icon: "/icons/ai_ajoobe.png",
    },
    {
      to: "/mind-map-explorer",
      title: "Mind Map Explorer 🧠",
      description: "Topics ko visually explore karo—mind-blowing connections banao! 🌳✨🧩",
      gradient: "bg-gradient-to-br from-green-500 to-teal-600",
      icon: "/icons/mind_map.png",
    },
    {
      to: "/exam-mode",
      title: "Exam Mode 📝",
      description: "Exam Mode mein timed practice karo! 📝✨ apne gyaan ko test kar ke confident bano! 🧠🏆",
      gradient: "bg-gradient-to-br from-red-500 to-rose-600",
      icon: "/icons/exam.png",
    },
    {
      to: "/game-zone",
      title: "Game Zone 🎮",
      description: "Masti se seekho Game Zone mein 🎮✨ level up your gyaan! 🚀🧠",
      gradient: "bg-gradient-to-br from-pink-500 to-rose-500",
      icon: "/icons/game_zone.png",
    },
    {
      to: "/creative-corner",
      title: "Imagination's Flight ✍️",
      description:
        "AI ke saath kalpana ko stories, poems & plays mein badlo—create magic! 🌟📖🎭",
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
        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-5xl md:text-6xl font-display font-extrabold text-yellow-400 drop-shadow-2xl animate-pulse">
            Welcome To GyanDost Universe 🌌
          </h1>
          <p className="mt-3 text-xl text-white/80 font-light">
            Apni learning adventure chunein!
          </p>
        </div>

        {/* Cards Grid */}
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
        className="absolute bottom-5 right-5 z-20"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          delay: 2,
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
