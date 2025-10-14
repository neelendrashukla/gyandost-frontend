import React, { useState, useEffect } from 'react';
import { supabase } from "../lib/supabase.js";
import { motion, AnimatePresence } from 'framer-motion';
import GyanDostMascot from "./GyanDostMascot.jsx";
import { Howl, Howler } from 'howler';
import Confetti from 'react-confetti';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

// 🔊 Only error sound
const errorSound = new Howl({ src: ["/sounds/error.mp3"], volume: 0.5 });

// Gradient Background
const Background = () => (
    <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-950 via-purple-900 to-indigo-950" />
);

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [fullName, setFullName] = useState('');
    const [userClass, setUserClass] = useState('3');
    const [language, setLanguage] = useState('hindi');
    const [showConfetti, setShowConfetti] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [audioUnlocked, setAudioUnlocked] = useState(false);

    const classOptions = ["3","4","5","6","7","8","9"];

    // Unlock audio context on first click
    useEffect(() => {
        const unlockAudio = () => {
            if(Howler.ctx?.state !== 'running'){
                Howler.ctx?.resume().then(() => setAudioUnlocked(true));
            } else {
                setAudioUnlocked(true);
            }
        };
        document.body.addEventListener('click', unlockAudio, { once: true });
    }, []);

    // Play error sound safely
    const playError = () => {
        if(audioUnlocked){
            try{ errorSound.play(); } catch(err){ console.error('Error sound play error:', err); }
        }
    };

    // Validation
    const validateForm = () => {
        if (!email.trim() || !password.trim() || (isRegister && !fullName.trim())) {
            toast.error("All fields are required!");
            playError();
            return false;
        }
        if(password.length < 6){ toast.error("Password must be at least 6 chars"); playError(); return false; }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){ toast.error("Enter a valid email"); playError(); return false; }
        return true;
    }

    const handleAuth = async (e) => {
        e.preventDefault();
        if(!validateForm()) return;
        setLoading(true);

        if(isRegister){
            const { error } = await supabase.auth.signUp({
                email, password,
                options: { data: { full_name: fullName, user_class: userClass, preferred_language: language } }
            });
            if(error){
                toast.error(error.message);
                playError();
                setErrorMessage(error.message);
            } else {
                toast.success("Registration successful! Check your email.");
                setIsRegister(false);
                setFullName(''); setEmail(''); setPassword(''); setUserClass('3'); setLanguage('hindi');
            }
        } else {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if(error){
                let msg = error.message.includes("Invalid") ? "Account not found / wrong password!" : error.message;
                toast.error(msg);
                playError();
                setErrorMessage(msg);
            } else if(data?.user){
                toast.success("Welcome back!");
                setShowConfetti(true);
            }
        }
        setLoading(false);
    }

    useEffect(() => {
        if(errorMessage){
            const timer = setTimeout(()=> setErrorMessage(''),5000);
            return ()=> clearTimeout(timer);
        }
    }, [errorMessage]);

    return (
        <div className="h-screen w-screen flex items-center justify-center relative overflow-hidden text-white">
            <Background />
            <AnimatePresence>
                {showConfetti && <Confetti numberOfPieces={500} recycle={false} gravity={0.1} onConfettiComplete={()=> setShowConfetti(false)}/>}
            </AnimatePresence>

            <motion.div
                className="relative bg-white/10 backdrop-blur-2xl p-6 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-purple-400/20 hover:border-purple-400/40 transition-colors duration-300 flex flex-col justify-center z-10"
                initial={{ y: 50, opacity: 0, scale: 0.95 }}
                animate={{ y:0, opacity:1, scale:1 }}
                whileHover={{ scale: 1.02 }}
                transition={{ type:"spring", stiffness:300, damping:30 }}
            >
                {/* Mascot */}
                <motion.div className="flex justify-center mb-4 md:mb-6" whileHover={{ scale: 1.1 }}>
                    <GyanDostMascot state={loading ? "loading" : isRegister ? "thinking" : "idle"} size="large" onClick={()=> !loading && setIsRegister(!isRegister)} className="cursor-pointer"/>
                </motion.div>

                <motion.h1 className="text-2xl md:text-3xl font-display font-bold text-center mb-2 text-purple-300 drop-shadow-lg" animate={{ y:[0,-5,0] }} transition={{ repeat: Infinity, duration: 2 }}>
                    {isRegister ? 'Join the Adventure 🚀' : 'Welcome to GyanDost! ✨'}
                </motion.h1>
                <motion.p className="text-center text-purple-200/80 mb-4 md:mb-6 text-sm px-4" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}}>
                    Your AI learning buddy! Let's make learning fun!
                </motion.p>

                {errorMessage && <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">{errorMessage}</motion.div>}

                <form onSubmit={handleAuth} className="space-y-4 md:space-y-5 px-2 md:px-4">
                    <AnimatePresence mode="wait">
                        {isRegister && (
                            <motion.div initial={{ height:0, opacity:0, y:-20 }} animate={{ height:"auto", opacity:1, y:0 }} exit={{ height:0, opacity:0, y:-20 }} transition={{duration:0.3}} className="overflow-hidden space-y-4">
                                <input type="text" placeholder="Full Name *" value={fullName} onChange={(e)=>setFullName(e.target.value)} className="w-full p-3 md:p-4 rounded-xl bg-white/10 placeholder-gray-300 text-white border border-purple-400/30 focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition-all duration-200"/>
                                <div className="grid grid-cols-2 gap-4">
                                    <select value={userClass} onChange={(e)=>setUserClass(e.target.value)} className="w-full p-3 md:p-4 rounded-xl bg-white/10 text-white border border-purple-400/30 focus:ring-2 focus:ring-purple-400/50 transition-all duration-200">
                                        {classOptions.map(c=> <option key={c} value={c} className="text-black bg-white">Class {c}</option>)}
                                    </select>
                                    <select value={language} onChange={(e)=>setLanguage(e.target.value)} className="w-full p-3 md:p-4 rounded-xl bg-white/10 text-white border border-purple-400/30 focus:ring-2 focus:ring-purple-400/50 transition-all duration-200">
                                        <option value="hindi" className="text-black bg-white">Hindi</option>
                                        <option value="hinglish" className="text-black bg-white">Hinglish</option>
                                        <option value="english" className="text-black bg-white">English</option>
                                    </select>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative">
                        <input type="email" placeholder="Email Address *" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full p-3 md:p-4 rounded-xl bg-white/10 placeholder-gray-300 text-white border border-purple-400/30 focus:ring-2 focus:ring-purple-400/50 transition-all duration-200"/>
                    </div>

                    {/* Password input with RIGHT toggle - fixed */}
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Password *" 
                            value={password} 
                            onChange={(e)=>setPassword(e.target.value)} 
                            className="w-full p-3 md:p-4 pr-12 rounded-xl bg-white/10 placeholder-gray-300 text-white border border-purple-400/30 focus:ring-2 focus:ring-purple-400/50 transition-all duration-200"
                        />
                        <span className="absolute inset-y-0 right-3 flex items-center">
                            <button type="button" onClick={()=>setShowPassword(!showPassword)} className="text-gray-400 hover:text-white transition-colors">
                                {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                            </button>
                        </span>
                    </div>

                    <button disabled={loading} type="submit" className="w-full p-3 md:p-4 bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 font-bold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50">
                        {loading ? <><Loader2 className="w-5 h-5 animate-spin"/> Processing...</> : isRegister ? 'Register 🚀' : 'Login ✨'}
                    </button>
                </form>

                <button className="mt-4 text-sm text-purple-200 hover:text-white w-full text-center py-2 transition-colors duration-200 px-4" onClick={()=>{setIsRegister(!isRegister); setErrorMessage(''); setEmail(''); setPassword(''); setShowPassword(false)}} whileHover={{scale:1.05}} whileTap={{scale:0.98}}>
                    {isRegister ? 'Already have account? Login.' : 'New here? Register now!'}
                </button>

                <p className="mt-4 text-xs text-center text-purple-300/60 px-4">Secure & Fun Learning Awaits! 🌟</p>
            </motion.div>
        </div>
    )
}
