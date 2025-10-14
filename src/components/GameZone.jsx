import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from "../lib/supabase.js"; // If needed
import { Howl } from 'howler';
import GyanDostMascot from "./GyanDostMascot.jsx"; // Mascot like homepage

// 🎶 Sounds like homepage
const popSound = new Howl({ src: ["/sounds/click.mp3"] });

// 🎴 Game Card like DashboardCard
function GameCard({ to, title, description, gradient, icon, delay, setMascotState }) {
    // Different Color Map for Games (vibrant game theme)
    const colorMap = { 
        "Concept Match": { title: "#06b6d4", desc: "#ec4899" }, // Cyan title, pink desc
        "Paheli Bujho": { title: "#10b981", desc: "#f59e0b" }, // Emerald title, amber desc
        "Sahi ya Galat": { title: "#ef4444", desc: "#f97316" }, // Red title, orange desc
        "Timeline Scramble": { title: "#8b5cf6", desc: "#a78bfa" }, // Violet title, indigo desc
    }; 
    const colors = colorMap[title] || { title: "#ffffff", desc: "#d1d5db" };

    const handleClick = () => { 
        popSound.play(); 
        setMascotState('success'); 
        setTimeout(() => setMascotState('idle'), 2000); 
    }; 

    return ( 
        <Link to={to} onClick={handleClick}> 
            <motion.div 
                initial={{ opacity: 0, y: 50, boxShadow: "0px 0px 0px rgba(0,0,0,0)" }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: delay, type: "spring", stiffness: 100 }} 
                whileHover={{ scale: 1.07, y: -10 }} 
                whileTap={{ scale: 0.98 }} 
                className={`p-6 rounded-3xl h-full flex items-center gap-6 shadow-card transition-all duration-300 ${gradient} animate-float`} 
                style={{ animationDelay: `${delay}s` }} 
            > 
                <div className="flex-shrink-0 bg-white/20 rounded-full w-52 h-52 flex items-center justify-center"> 
                    <img src={icon} alt={title} className="object-contain" style={{ width: "140px", height: "140px" }} /> 
                </div> 
                <div className="flex-1"> 
                    <h3 className="text-3xl md:text-4xl font-display font-bold drop-shadow-lg" style={{ color: colors.title }}>{title}</h3> 
                    <p className="mt-2 text-lg md:text-xl font-sans" style={{ color: colors.desc }}>{description}</p> 
                </div> 
            </motion.div> 
        </Link> 
    ); 
} 

// ✨ Star Particles like homepage
const StarParticle = ({ size, top, left, animationDuration, delay }) => { 
    return ( 
        <motion.div 
            className="star-particle absolute bg-yellow-400 rounded-full shadow-lg" 
            style={{ 
                width: size, 
                height: size, 
                top: `${top}%`, 
                left: `${left}%`, 
                boxShadow: `0 0 ${size*2}px #ffd700, 0 0 ${size*4}px #ffd700, 0 0 ${size*6}px #ffed4a` 
            }} 
            initial={{ opacity: 0, scale: 0 }} 
            animate={{ opacity: [0,0.7,0.7,0], scale: [0,1,1,0] }} 
            transition={{ duration: animationDuration, repeat: Infinity, delay: delay, ease: "easeInOut" }} 
        /> 
    ); 
}; 

// 🌌 GameZone like Dashboard
export default function GameZone({ session, profile }) { 
    const userName = profile?.full_name || "Dost"; 
    const [mascotState, setMascotState] = useState('idle'); 

    const games = [ 
        { to: "/game-lobby/concept_match", title: "Concept Match", description: "Match concepts & win stars! 🧠", gradient: "bg-gradient-to-br from-blue-600 to-purple-700", icon: "/icons/concept-match.png" }, 
        { to: "/game-lobby/riddle", title: "Paheli Bujho", description: "Crack riddles & unlock secrets! 💡", gradient: "bg-gradient-to-br from-green-500 to-teal-600", icon: "/icons/riddle.png" }, 
        { to: "/game-lobby/true_or_false", title: "Sahi ya Galat", description: "Guess truths & learn facts! ✅", gradient: "bg-gradient-to-br from-orange-500 to-red-600", icon: "/icons/true-false.png" }, 
        { to: "/game-lobby/timeline_scramble", title: "Timeline Scramble", description: "Arrange history & time travel! ⏳", gradient: "bg-gradient-to-br from-pink-500 to-rose-500", icon: "/icons/timeline-scramble.png" }, 
    ]; 

    const generateStars = () => { 
        const stars = []; 
        for(let i=0;i<30;i++){ 
            stars.push( 
                <StarParticle 
                    key={i} 
                    size={Math.random()*8+6} 
                    top={Math.random()*100} 
                    left={Math.random()*100} 
                    animationDuration={Math.random()*8+7} 
                    delay={Math.random()*8} 
                /> 
            ); 
        } 
        return stars; 
    }; 

    return ( 
        <div className="relative min-h-screen p-6 overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900"> 
            {generateStars()} 
            <motion.div className="max-w-7xl mx-auto relative z-10" initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8 }}> 
                {/* Header like Homepage – White Color, Centered */}
                <header className="flex justify-center items-center mb-12 bg-black/20 backdrop-blur-md rounded-full px-6 py-3 shadow-lg border border-white/20"> 
                    <h2 className="text-3xl font-display font-bold text-white text-center">Welcome to Game Zone!</h2> 
                </header> 

                {/* Title & Middle Welcome like Homepage */}
                <div className="text-center mb-16"> 
                    <h1 className="text-7xl font-display font-extrabold leading-tight text-yellow-400 drop-shadow-2xl animate-pulse">Game Zone Arcade 🎮</h1> 
                    <p className="mt-4 text-2xl text-white/80 font-light">Khelo aur seekho mazedaar tareeke se!</p> 
                </div> 

                {/* Game Cards like Homepage */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> 
                    {games.map((game,index)=>( 
                        <GameCard key={game.title} {...game} delay={1+index*0.1} setMascotState={setMascotState} /> 
                    ))} 
                </div> 
            </motion.div> 

            {/* Mascot like Homepage */}
            <motion.div className="absolute bottom-5 right-5 z-20" initial={{x:100,opacity:0}} animate={{x:0,opacity:1}} transition={{ delay: games.length*0.1 + 1.5, type:"spring", stiffness:100 }}> 
                <GyanDostMascot state={mascotState} size="large" /> 
            </motion.div> 
        </div> 
    ); 
}