import React, { createContext, useState, useEffect } from 'react';
import { useProfile } from "../hooks/useProfile.js";
import { supabase } from "../lib/supabase.js";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children, session }) => {
    const { profile } = useProfile(session?.user);
    const [language, setLanguage] = useState('hindi');

    useEffect(() => {
        if (profile?.preferred_language) {
            setLanguage(profile.preferred_language);
        }
    }, [profile]);

    const updateLanguage = async (newLang) => {
        setLanguage(newLang); // Update UI immediately for fast experience
        if (session?.user) {
            // Save the new language to the database in the background
            await supabase
                .from('profiles')
                .update({ preferred_language: newLang })
                .eq('id', session.user.id);
        }
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: updateLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};