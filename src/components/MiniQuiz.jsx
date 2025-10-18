import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function MiniQuiz({ quizText, onOptionClick }) {
    const [selectedOption, setSelectedOption] = useState(null);

    const lines = quizText.replace("QUIZ:", "").trim().split('\n');
    const question = lines[0];
    const choices = lines.slice(1);

    const handleSelect = (choice) => {
        if (selectedOption) return; // Prevent changing answer
        setSelectedOption(choice);
        onOptionClick(choice);
    };

    return (
        <div className="p-3 my-2 bg-yellow-100 border-l-4 border-yellow-500 rounded-r-lg">
            <p className="font-bold text-yellow-800">🧠 दिमागी कसरत!</p>
            <p className="my-2 text-gray-800">{question}</p>
            <div className="space-y-2">
                {choices.map((choice, i) => (
                    <motion.button 
                        key={i} 
                        onClick={() => handleSelect(choice)} 
                        disabled={!!selectedOption}
                        whileHover={!selectedOption ? { scale: 1.02, color: 'blue' } : {}}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-left p-2 rounded shadow transition-colors 
                            ${selectedOption === choice ? 'bg-blue-300' : 'bg-white hover:bg-gray-200'}
                            ${selectedOption && 'cursor-not-allowed'}
                        `}
                    >
                        {choice}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}