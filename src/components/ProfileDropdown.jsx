import React, { useState, useContext, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageContext } from "../context/LanguageContext.jsx";
import { supabase } from "../lib/supabase.js";

export default function ProfileDropdown({ profile }) {
    const [isOpen, setIsOpen] = useState(false);
    const { language, setLanguage } = useContext(LanguageContext);
    const dropdownRef = useRef(null);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    // Close dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="flex items-center gap-3 p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg transition-all"
            >
                <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-cosmic-blue text-xl shadow-xl">
                    {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'G'}
                </div>
                <span className="text-white font-semibold hidden md:block">{profile.full_name}</span>
                <svg 
                    className={`w-5 h-5 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="absolute right-0 mt-2 w-56 max-w-[90vw] bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 rounded-xl shadow-2xl overflow-hidden z-50 border border-pink-300"
                        style={{ right: '0', left: 'auto' }}
                    >
                        <div className="p-4 border-b border-purple-300 bg-gradient-to-r from-purple-200 to-pink-200">
                            <p className="font-bold text-purple-800 text-lg">{profile.full_name}</p>
                            <p className="text-sm text-purple-600">Class {profile.user_class}</p>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50">
                            <label className="text-sm font-semibold text-purple-700 mb-1 block">Language</label>
                            <select 
                                value={language} 
                                onChange={(e) => {
                                    setLanguage(e.target.value);
                                    setIsOpen(false);
                                }}
                                className="w-full p-2 rounded-lg bg-gradient-to-r from-purple-200 to-pink-200 text-purple-900 font-medium hover:from-purple-300 hover:to-pink-300 transition-all"
                            >
                                <option value="hindi">हिन्दी</option>
                                <option value="hinglish">Hinglish</option>
                                <option value="english">English</option>
                            </select>
                        </div>
                        <button 
                            onClick={handleLogout} 
                            className="w-full text-left px-4 py-3 mt-2 text-white bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 font-semibold rounded-b-lg shadow-md transition-all"
                        >
                            Logout
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
