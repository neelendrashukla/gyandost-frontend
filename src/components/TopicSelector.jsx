import React, { useState, useRef } from 'react';
import Confetti from 'react-confetti';

export default function TopicSelector({ popularTopics, title, onTopicSelect }) {
    const [showAll, setShowAll] = useState(false);
    const [confettiTrigger, setConfettiTrigger] = useState(false);
    const clickAudioRef = useRef(new Audio('/sounds/click.mp3'));

    const handleClick = (topicName) => {
        // Play click sound
        clickAudioRef.current.currentTime = 0;
        clickAudioRef.current.play();

        // Trigger confetti
        setConfettiTrigger(true);
        setTimeout(() => setConfettiTrigger(false), 1200); // Confetti visible 1.2 sec

        // Call parent handler
        onTopicSelect(topicName);
    };

    const topicsToShow = showAll ? popularTopics : popularTopics.slice(0, 8);

    return (
        <div className="relative">
            {/* Confetti */}
            {confettiTrigger && (
                <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                    numberOfPieces={50}
                    recycle={false}
                    key={Date.now()} // Force new instance on each trigger
                />
            )}

            <h3 className="text-3xl font-bold mb-8 text-center text-purple-700 animate-pulse">
                {title}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {topicsToShow.map((topic, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleClick(topic.name)}
                        className={`flex flex-col items-center justify-center p-5 rounded-2xl text-white font-semibold 
                                    transform transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105
                                    hover:-translate-y-2 hover:rotate-1 ${topic.color} bg-gradient-to-br from-purple-400 to-pink-500 
                                    hover:from-yellow-400 hover:to-red-500 group`}
                    >
                        <span className="text-5xl mb-2 animate-bounce">{topic.icon}</span>
                        <span className="text-center text-sm sm:text-base">{topic.name}</span>
                        <span className="mt-1 h-1 w-12 bg-white rounded-full opacity-0 group-hover:opacity-100 animate-pulse"></span>
                    </button>
                ))}
            </div>

            {popularTopics.length > 8 && (
                <div className="text-center mt-6">
                    <button
                        onClick={() => setShowAll(prev => !prev)}
                        className="px-6 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 
                                   text-white rounded-full font-bold shadow-xl hover:scale-110 hover:shadow-2xl 
                                   transition-all duration-300 animate-pulse"
                    >
                        {showAll ? "Less Topics" : "More Topics"}
                    </button>
                </div>
            )}
        </div>
    );
}
