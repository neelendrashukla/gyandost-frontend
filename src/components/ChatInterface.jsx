import React, { useState, useEffect, useRef } from 'react';
import GyanDostMascot from "./GyanDostMascot.jsx";
import MiniQuiz from "./MiniQuiz.jsx";
import { useTextToSpeech } from '../hooks/useTextToSpeech.js';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';

const LearnMoreBlock = ({ content }) => {
    const links = content.split('*').filter(s => s.trim());
    return (
        <div className="mt-4 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg">
            <h4 className="font-bold text-emerald-800">और जानें (Learn More)</h4>
            <ul className="mt-2 list-disc list-inside">
                {links.map((link, i) => {
                    const isYoutube = link.toLowerCase().includes('youtube:');
                    const searchText = link.replace(/youtube:|google images:/i, '').trim();
                    const searchUrl = isYoutube
                        ? `https://www.youtube.com/results?search_query=${encodeURIComponent(searchText)}`
                        : `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(searchText)}`;
                    return (
                        <li key={i} className="text-sm text-emerald-700">
                            <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {link.trim()}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

const parseContent = (text = '') => {
    if (!text) return { blocks: [], options: [] };

    const optionsRegex = /(\n\d\..*)+$/;
    const optionsMatch = text.match(optionsRegex);
    const optionsText = optionsMatch ? optionsMatch[0].trim() : '';
    let mainContent = optionsMatch ? text.substring(0, optionsMatch.index).trim() : text.trim();
    const options = optionsText ? optionsText.split('\n').filter(line => line.trim()) : [];

    let learnMoreContent = '';
    if (mainContent.includes("## और जानें")) {
        const parts = mainContent.split("## और जानें");
        mainContent = parts[0];
        learnMoreContent = parts[1].trim();
    }

    const contentParts = mainContent.split(/(QUIZ:|LESSON_PLAN:)/);
    const blocks = [];

    for (let i = 0; i < contentParts.length; i++) {
        const part = contentParts[i]?.trim();
        if (!part) continue;

        if (part === 'LESSON_PLAN:') {
            const plan = contentParts[++i]?.trim();
            if (plan) blocks.push({ type: 'lesson_plan', content: plan });
        } else if (part === 'QUIZ:') {
            const quizText = contentParts[++i]?.trim();
            if (quizText) blocks.push({ type: 'quiz', content: 'QUIZ:\n' + quizText });
        } else {
            blocks.push({ type: 'paragraph', content: part });
        }
    }

    if (learnMoreContent) {
        blocks.push({ type: 'learn_more', content: learnMoreContent });
    }

    return { blocks: blocks.filter(b => b.content), options };
};

export default function ChatInterface({ messages, onOptionClick, onSendMessage, loading }) {
    const [userMessage, setUserMessage] = useState('');
    const chatEndRef = useRef(null);
    const { speak, cancel, pause, resume, isSpeaking, isPaused } = useTextToSpeech();
    const [speakingMsgIndex, setSpeakingMsgIndex] = useState(null);
    const { isListening, transcript, handleListen } = useSpeechRecognition('hi-IN'); // Hindi default

    // Auto-scroll
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Live transcript update
    useEffect(() => {
        if (transcript) setUserMessage(transcript);
    }, [transcript]);

    // Cleanup TTS
    useEffect(() => () => cancel(), [cancel]);

    const handleSpeakClick = (text, index) => {
        if (isSpeaking && speakingMsgIndex === index) {
            cancel();
            setSpeakingMsgIndex(null);
        } else {
            speak(text);
            setSpeakingMsgIndex(index);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!userMessage.trim() || !onSendMessage) return;
        cancel();
        setSpeakingMsgIndex(null);
        onSendMessage(userMessage);
        setUserMessage('');
    };

    return (
        <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 flex flex-col h-[75vh] w-full overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-6">
                {messages.map((msg, index) => {
                    const { blocks, options } = parseContent(msg.text);
                    const isLastMessage = index === messages.length - 1;
                    const currentMsgIsSpeaking = isSpeaking && speakingMsgIndex === index;

                    return (
                        <div
                            key={index}
                            className={`flex flex-col md:flex-row ${msg.sender === 'user' ? 'md:flex-row-reverse' : ''} items-start gap-2 md:gap-4`}
                        >
                            {/* Mascot */}
                            {msg.sender === 'ai' && (
                                <div className="flex justify-center w-full md:w-auto">
                                    <GyanDostMascot
                                        state="idle"
                                        height="150px"
                                        width="150px"
                                        className="md:h-[250px] md:w-[250px]"
                                    />
                                </div>
                            )}

                            {/* Message content */}
                            <div className={`p-4 rounded-lg w-full shadow-sm ${msg.sender === 'ai' ? 'bg-gray-100' : 'bg-blue-100'}`}>
                                <div className="flex justify-between items-center flex-wrap">
                                    <p className={`font-bold font-display ${msg.sender === 'ai' ? 'text-purple-800' : 'text-brand-primary'}`}>
                                        {msg.sender === 'ai' ? 'GyanDost' : 'You'}
                                    </p>

                                    {msg.sender === 'ai' && (
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            {!currentMsgIsSpeaking && (
                                                <button
                                                    onClick={() => handleSpeakClick(msg.text, index)}
                                                    className="px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition"
                                                >
                                                    🔊 Speak
                                                </button>
                                            )}
                                            {currentMsgIsSpeaking && !isPaused && (
                                                <button onClick={pause} className="px-3 py-1 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 transition">⏸ Pause</button>
                                            )}
                                            {currentMsgIsSpeaking && isPaused && (
                                                <button onClick={resume} className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition">▶ Resume</button>
                                            )}
                                            {currentMsgIsSpeaking && (
                                                <button onClick={() => { cancel(); setSpeakingMsgIndex(null); }} className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition">❌ Stop</button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Content blocks */}
                                {blocks.map((block, i) => {
                                    switch (block.type) {
                                        case 'paragraph':
                                            return <p key={i} className="text-gray-700 whitespace-pre-wrap mt-2">{block.content}</p>;
                                        case 'quiz':
                                            return <MiniQuiz key={i} quizText={block.content} onOptionClick={onOptionClick} />;
                                        case 'lesson_plan':
                                            return (
                                                <div key={i} className="p-3 my-2 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg">
                                                    <h4 className="font-bold text-indigo-800">Today's Lesson Plan:</h4>
                                                    <p className="text-gray-700 whitespace-pre-wrap mt-1">{block.content}</p>
                                                </div>
                                            );
                                        case 'learn_more':
                                            return <LearnMoreBlock key={i} content={block.content} />;
                                        default:
                                            return null;
                                    }
                                })}

                                {/* Options for last message */}
                                {isLastMessage && options.length > 0 && !loading && (
                                    <div className="mt-4 space-y-2">
                                        <p className="font-bold text-sm text-gray-600">Aage kya karna chahenge?</p>
                                        {options.map((opt, i) => (
                                            <button key={i} onClick={() => onOptionClick(opt)} className="w-full text-left p-2 bg-white rounded shadow hover:bg-gray-200">
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {loading && (
                    <div className="flex justify-center">
                        <GyanDostMascot state="thinking" height="200px" width="200px" />
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input */}
            {!loading && (
                <form onSubmit={handleSubmit} className="mt-4 flex gap-2 pt-4 border-t">
                    <input
                        type="text"
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                        placeholder="Apna sawaal ya agla prompt yahan likhein..."
                        className="flex-1 p-3 border-2 rounded-lg"
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                    />
                    <button
                        type="button"
                        onClick={handleListen}
                        className={`px-4 py-2 rounded-lg ${isListening ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                    >
                        {isListening ? 'Stop 🎤' : 'Mic 🎤'}
                    </button>
                    <button type="submit" className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700">
                        Send
                    </button>
                </form>
            )}
        </div>
    );
}
