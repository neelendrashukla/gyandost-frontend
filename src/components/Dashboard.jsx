import React, { useState, useContext, useEffect, useCallback, memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Howl, Howler } from "howler";
import { Toaster } from "react-hot-toast";
import GyanDostMascot from "./GyanDostMascot.jsx";
import { LanguageContext } from "../context/LanguageContext.jsx";

// 🎵 Sound
const popSound = new Howl({ src: ["/sounds/pop.mp3"], volume: 0.6 });

// ✨ StarParticle (Memoized)
const StarParticle = React.memo(({ size, top, left, duration, delay }) => (
  <motion.div
    className="absolute bg-yellow-400 rounded-full shadow-lg"
    style={{
      width: size,
      height: size,
      top: `${top}%`,
      left: `${left}%`,
      boxShadow: `0 0 ${size * 2}px #ffd700, 0 0 ${size * 4}px #ffd700, 0 0 ${size * 6}px #ffed4a`,
      willChange: "opacity, transform",
    }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, 0.7, 0.7, 0], scale: [0, 1, 1, 0] }}
    transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
  />
));

// 🎨 Static Color Map
const colorMap = {
  "AI Tutor": { title: "#2563EB", desc: "#EC4899" },
  "Sanskriti aur Gyan": { title: "#D97706", desc: "#FBBF24" },
  "AI ke Ajoobe": { title: "#0EA5E9", desc: "#10B981" },
  "Mind Map Explorer": { title: "#DC2626", desc: "#FB923C" },
  "Exam Mode": { title: "#8B5CF6", desc: "#F472B6" },
  "Game Zone": { title: "#16A34A", desc: "#F0ABFC" },
  "Imagination's Flight": { title: "#2B6CB0", desc: "#E8B4F8" },
};

// 🧩 Emoji Helpers
const extractEmojis = (text) =>
  text.match(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu)?.join(" ") || "";
const extractText = (text) =>
  text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim();

// Custom hook for window dimensions (Deno-compatible)
function useWindowDimensions() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof globalThis !== 'undefined') {
      const handleResize = () => {
        setDimensions({
          width: globalThis.innerWidth || 0,
          height: globalThis.innerHeight || 0,
        });
      };

      handleResize(); // Initial
      globalThis.addEventListener('resize', handleResize);
      return () => globalThis.removeEventListener('resize', handleResize);
    }
  }, []);

  return dimensions;
}

// ✨ Dashboard Card (memoized)
const DashboardCard = memo(function DashboardCard({
  to,
  title,
  description,
  gradient,
  icon,
  delay,
  setMascotState,
}) {
  const { width } = useWindowDimensions();
  const isMobile = useMemo(() => width > 0 && width < 768, [width]);

  const colors =
    colorMap[title.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim()] ||
    { title: "#ffffff", desc: "#d1d5db" };

  const handleClick = useCallback(() => {
    popSound.play();
    setMascotState("success");
    setTimeout(() => setMascotState("idle"), 2000);
  }, [setMascotState]);

  const emojiTitle = extractEmojis(title);
  const plainTitle = extractText(title);
  const emojiDesc = extractEmojis(description);
  const plainDesc = extractText(description);

  return (
    <Link to={to} onClick={handleClick}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3, // Reduced for perf
          delay,
          type: "spring",
          stiffness: isMobile ? 120 : 100, // Stiffer on mobile
        }}
        whileHover={{ scale: isMobile ? 1.02 : 1.04 }} // Subtle on mobile
        whileTap={{ scale: 0.98 }}
        className={`relative p-4 sm:p-6 rounded-3xl flex flex-col sm:flex-row-reverse items-center justify-between gap-4 sm:gap-6 shadow-xl transition-transform duration-300 ease-out ${gradient} overflow-hidden group will-change-transform`}
        style={{ transform: "translateZ(0)", willChange: "transform" }} // Hardware acceleration
      >
        {/* ✨ Shine Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="shine-overlay group-hover:animate-shine"></div>
        </div>

        {/* 🖼️ Icon - Responsive size */}
        <div className="flex-shrink-0 bg-white/25 rounded-full w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center shadow-md">
          <img
            src={icon}
            alt={plainTitle}
            loading="lazy"
            className="object-contain"
            width={isMobile ? "80" : "120"}
            height={isMobile ? "80" : "120"}
            sizes="(max-width: 640px) 80px, (max-width: 1024px) 100px, 120px"
            // srcSet assume variants exist: `${icon.replace('.webp', '-small.avif')} 80w, ${icon} 120w`
          />
        </div>

        {/* 🧠 Text */}
        <div className="flex-1 text-center sm:text-left relative z-10">
          <h3
            className="text-2xl sm:text-3xl md:text-4xl font-display font-bold flex items-center justify-center sm:justify-start gap-2"
            style={{
              background: `linear-gradient(90deg, ${colors.title}, ${colors.desc})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            <span>{plainTitle}</span>
            <span style={{ WebkitTextFillColor: "initial" }}>{emojiTitle}</span>
          </h3>

          <p
            className="mt-2 text-base sm:text-lg md:text-xl font-sans leading-relaxed flex flex-wrap items-center justify-center sm:justify-start gap-1"
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
});

// 🌌 Main Dashboard
export default function Dashboard({ session, profile }) {
  const userName = profile?.full_name || "Dost";
  const [mascotState, setMascotState] = useState("waving");
  const { language } = useContext(LanguageContext);
  const [starCount, setStarCount] = useState(0); // Start with 0 to avoid initial render
  const [isVisible, setIsVisible] = useState(false);

  const { width } = useWindowDimensions();

  // 👋 Idle reset
  useEffect(() => {
    const timer = setTimeout(() => setMascotState("idle"), 3000);
    return () => clearTimeout(timer);
  }, []);

  // 🔊 Unlock audio
  useEffect(() => {
    if (typeof globalThis !== 'undefined') {
      const unlockAudio = () => {
        if (Howler && Howler.ctx) {
          Howler.ctx.resume().catch(() => {});
        }
      };
      globalThis.document.body.addEventListener("click", unlockAudio, { once: true });
      return () => globalThis.document.body.removeEventListener("click", unlockAudio);
    }
  }, []);

  // 🌟 Adaptive Star Count
  useEffect(() => {
    if (width > 0) {
      if (width > 1024) setStarCount(20);
      else if (width > 768) setStarCount(12);
      else setStarCount(5); // Mobile: Minimal for perf
    }
  }, [width]);

  // Delay stars visibility for perf
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // 📋 Cards data
  const cards = useMemo(() => [
    {
      to: "/ai-tutor",
      title: "AI Tutor 🎓",
      description: "Kisi bhi topic pe AI se deep dive karo—easy, fun aur detailed learning! 📚✨",
      gradient: "bg-gradient-to-br from-blue-600 to-purple-700",
      icon: "/icons/ai_tutor.webp",
    },
    {
      to: "/sanskriti-gyan",
      title: "Sanskriti aur Gyan 🏛️",
      description: "Apni virasat 🏛️, apna gyan 📚, apni pehchaan - Bhartiya sanskriti ka safar! 🌟🚀",
      gradient: "bg-gradient-to-br from-orange-500 to-red-600",
      icon: "/icons/sanskriti.webp",
    },
    {
      to: "/ai-ke-ajoobe",
      title: "AI ke Ajoobe 🪄",
      description: "Magical AI world mein step in! Fun stories & tips se future tech seekho! 🤖🚀✨",
      gradient: "bg-gradient-to-br from-gray-700 to-gray-900",
      icon: "/icons/ai_ajoobe.webp",
    },
    {
      to: "/mind-map-explorer",
      title: "Mind Map Explorer 🧠",
      description: "Topics ko visually explore karo—mind-blowing connections banao! 🌳✨🧩",
      gradient: "bg-gradient-to-br from-green-500 to-teal-600",
      icon: "/icons/mind_map.webp",
    },
    {
      to: "/exam-mode",
      title: "Exam Mode 📝",
      description: "Exam Mode mein timed practice karo! 🧠✨ confident bano! 🏆",
      gradient: "bg-gradient-to-br from-red-500 to-rose-600",
      icon: "/icons/exam.webp",
    },
    {
      to: "/game-zone",
      title: "Game Zone 🎮",
      description: "Masti se seekho Game Zone mein 🎮✨ level up your gyaan! 🚀🧠",
      gradient: "bg-gradient-to-br from-pink-500 to-rose-500",
      icon: "/icons/game_zone.webp",
    },
    {
      to: "/creative-corner",
      title: "Imagination's Flight ✍️",
      description: "AI ke saath kalpana ko stories, poems & plays mein badlo—create magic! 🌟📖🎭",
      gradient: "bg-gradient-to-br from-yellow-400 to-amber-500",
      icon: "/icons/creative.webp",
    },
  ], []);

  const stars = useMemo(() =>
    Array.from({ length: starCount }, (_, i) => (
      <StarParticle
        key={`star-${i}`}
        size={Math.random() * 8 + 4}
        top={Math.random() * 100}
        left={Math.random() * 100}
        duration={Math.random() * 6 + 5}
        delay={Math.random() * 8}
      />
    )),
    [starCount]
  );

  // Sound cleanup on unmount
  useEffect(() => {
    return () => { popSound.unload(); };
  }, []);

  return (
    <div className="relative min-h-screen p-4 sm:p-6 md:p-10 overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {isVisible && stars} {/* Conditional render for perf */}

      <motion.div
        className="max-w-7xl mx-auto relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ transform: "translateZ(0)", willChange: "transform" }}
      >
        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-5xl md:text-6xl font-display font-extrabold text-yellow-400 drop-shadow-lg animate-pulse">
            Welcome To GyanDost Universe 🌌
          </h1>
          <p className="mt-3 text-xl text-white/80 font-light">
            Apni learning adventure chunein!
          </p>
        </div>

        {/* 🪐 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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

      {/* 🧸 Mascot */}
      <motion.div
        className="absolute bottom-5 right-5 z-20"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          delay: 2,
          type: "spring",
          stiffness: 100,
        }}
        style={{ transform: "translateZ(0)" }}
      >
        <GyanDostMascot state={mascotState} size="large" />
      </motion.div>

      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </div>
  );
}