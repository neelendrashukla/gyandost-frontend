import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Howl } from 'howler';
import GyanDostMascot from "./GyanDostMascot.jsx";

// 🎶 Sound preload
const popSound = new Howl({ src: ["/sounds/click.mp3"], preload: true });

// 🎴 GameCard (Memoized)
const GameCard = React.memo(function GameCard({ to, title, description, gradient, icon, delay, setMascotState }) {
  const colorMap = useMemo(() => ({
    "Concept Match": { title: "#06b6d4", desc: "#ec4899" },
    "Paheli Bujho": { title: "#10b981", desc: "#f59e0b" },
    "Sahi ya Galat": { title: "#ef4444", desc: "#f97316" },
    "Timeline Scramble": { title: "#8b5cf6", desc: "#a78bfa" },
  }), []);

  const colors = colorMap[title] || { title: "#ffffff", desc: "#d1d5db" };

  const handleClick = useCallback(() => {
    popSound.play();
    setMascotState('success');
    setTimeout(() => setMascotState('idle'), 2000);
  }, [setMascotState]);

  const isMobile = useMemo(() => {
    if (typeof globalThis !== 'undefined' && globalThis.innerWidth) {
      return globalThis.innerWidth < 768;
    }
    return false; // Default to false for non-browser envs
  }, []);

  return (
    <Link to={to} onClick={handleClick}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.3, // Reduced for perf
          delay, 
          type: "spring", 
          stiffness: isMobile ? 120 : 100 // Stiffer on mobile
        }}
        whileHover={{ scale: isMobile ? 1.02 : 1.05, y: isMobile ? 0 : -6 }}
        whileTap={{ scale: 0.97 }}
        className={`p-4 sm:p-6 rounded-3xl h-full flex items-center gap-4 sm:gap-6 shadow-lg transition-transform duration-200 ${gradient}`}
        style={{ 
          transform: "translateZ(0)", 
          willChange: "transform, opacity" 
        }} // Hardware acceleration
      >
        <div className="flex-shrink-0 bg-white/20 rounded-full w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
          <img
            src={icon}
            alt={title}
            className="object-contain select-none pointer-events-none"
            width={isMobile ? "80" : "120"}
            height={isMobile ? "80" : "120"}
            sizes="(max-width: 640px) 80px, (max-width: 1024px) 100px, 120px"
            loading="lazy"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold drop-shadow-lg" style={{ color: colors.title }}>
            {title}
          </h3>
          <p className="mt-2 text-base sm:text-lg md:text-xl font-sans" style={{ color: colors.desc }}>
            {description}
          </p>
        </div>
      </motion.div>
    </Link>
  );
});

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

// 🌌 GameZone
export default function GameZone({ profile }) {
  const [mascotState, setMascotState] = useState('idle');
  const [starCount, setStarCount] = useState(0); // Start with 0 to avoid initial render
  const [isVisible, setIsVisible] = useState(false);
  const userName = profile?.full_name || "Dost";

  const { width } = useWindowDimensions();

  const games = useMemo(() => [
    { to: "/game-lobby/concept_match", title: "Concept Match", description: "Match concepts & win stars! 🧠", gradient: "bg-gradient-to-br from-blue-600 to-purple-700", icon: "/icons/concept-match.webp" },
    { to: "/game-lobby/riddle", title: "Paheli Bujho", description: "Crack riddles & unlock secrets! 💡", gradient: "bg-gradient-to-br from-green-500 to-teal-600", icon: "/icons/riddle.webp" },
    { to: "/game-lobby/true_or_false", title: "Sahi ya Galat", description: "Guess truths & learn facts! ✅", gradient: "bg-gradient-to-br from-orange-500 to-red-600", icon: "/icons/true-false.webp" },
    { to: "/game-lobby/timeline_scramble", title: "Timeline Scramble", description: "Arrange history & time travel! ⏳", gradient: "bg-gradient-to-br from-pink-500 to-rose-500", icon: "/icons/timeline-scramble.webp" },
  ], []);

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
    <div className="relative min-h-screen p-4 sm:p-6 overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {isVisible && stars} {/* Conditional render for perf */}

      <motion.div
        className="max-w-7xl mx-auto relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ transform: "translateZ(0)", willChange: "transform" }}
      >
        {/* Header */}
        <header className="flex justify-center items-center mb-8 sm:mb-12 bg-black/20 backdrop-blur-md rounded-full px-4 sm:px-6 py-3 shadow-md border border-white/10">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white text-center">
            Welcome to Game Zone!
          </h2>
        </header>

        {/* Title */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold leading-tight text-yellow-400 drop-shadow-2xl animate-pulse">
            Game Zone Arcade 🎮
          </h1>
          <p className="mt-4 text-xl sm:text-2xl text-white/80 font-light">
            Khelo aur seekho mazedaar tareeke se!
          </p>
        </div>

        {/* Game Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {games.map((game, index) => (
            <GameCard key={game.title} {...game} delay={0.5 + index * 0.1} setMascotState={setMascotState} />
          ))}
        </div>
      </motion.div>

      {/* Mascot */}
      <motion.div
        className="absolute bottom-5 right-5 z-20"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 100 }}
        style={{ transform: "translateZ(0)" }}
      >
        <GyanDostMascot state={mascotState} size="large" />
      </motion.div>
    </div>
  );
}