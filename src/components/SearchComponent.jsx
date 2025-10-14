import React, { useState, useEffect } from 'react';
import { useSpeechRecognition } from "../hooks/useSpeechRecognition.js";

export default function SearchComponent({ onSearch, placeholder, buttonText, loading }) {
    const [topic, setTopic] = useState("");
    const { isListening, transcript, handleListen } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            setTopic(transcript);
        }
    }, [transcript]);

    const handleSearchClick = (e) => {
        e.preventDefault();
        if (topic.trim()) {
            onSearch(topic);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-card">
            <form onSubmit={handleSearchClick} className="flex gap-3">
                <input 
                    type="text" 
                    value={topic} 
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={placeholder || "Topic type karein..."}
                    className="flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-brand-primary"
                    disabled={loading}
                />
                <button 
                    type="button" 
                    onClick={handleListen} 
                    title="Speak Topic"
                    className={`px-4 py-2 rounded-lg transition-colors ${
                        isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                >
                    <span className="text-2xl">🎤</span>
                </button>
                <button 
                    type="submit" 
                    disabled={loading || !topic.trim()}
                    className="bg-brand-primary text-white px-6 py-2 rounded-lg font-semibold shadow-md disabled:opacity-50"
                >
                    {buttonText || "Search"}
                </button>
            </form>
            {isListening && <p className="text-center text-gray-600 mt-2">Sunte hue...</p>}
        </div>
    );
}
