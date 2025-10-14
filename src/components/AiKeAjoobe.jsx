import React, { useState } from 'react';
import { useProfile } from "../hooks/useProfile.js";
import { fetchTutorResponse } from "../api.js";  
import ChatInterface from "./ChatInterface.jsx";  
import TopicSelector from './TopicSelector.jsx';
import SearchComponent from './SearchComponent.jsx';
import GyanDostMascot from './GyanDostMascot.jsx';
import Confetti from 'react-confetti';
import { Howl } from 'howler';

const clickSound = new Howl({ src: ['/sounds/click.mp3'] });

const aiTopics = [
  { name: 'What is AI / AI क्या है', concept: 'what-is-ai', icon: '🤖', color: 'bg-purple-500' },
  { name: 'Machine Learning / मशीन लर्निंग', concept: 'machine-learning', icon: '🧠', color: 'bg-blue-500' },
  { name: 'Robots in Daily Life / रोजमर्रा के रोबोट', concept: 'robots-in-daily-life', icon: '🤖🏠', color: 'bg-red-400' },
  { name: 'Chatbots / चैटबॉट्स', concept: 'chatbots', icon: '💬', color: 'bg-pink-500' },
  { name: 'Smart Home / स्मार्ट घर', concept: 'smart-home', icon: '🏠💡', color: 'bg-green-500' },
  { name: 'AI in Games / खेलों में AI', concept: 'ai-in-games', icon: '🎮🤖', color: 'bg-yellow-500' },
  { name: 'Self-driving Cars / सेल्फ ड्राइविंग कार', concept: 'self-driving-cars', icon: '🚗🤖', color: 'bg-indigo-500' },
  { name: 'AI in Animals / जानवरों में AI examples', concept: 'ai-in-animals', icon: '🦁🤖', color: 'bg-teal-500' },
  { name: 'Future of AI / एआई का भविष्य', concept: 'future-of-ai', icon: '🚀🤖', color: 'bg-indigo-600' },
  { name: 'AI in School / स्कूल में AI', concept: 'ai-in-school', icon: '🏫🤖', color: 'bg-pink-400' },
  { name: 'AI Art / एआई कला', concept: 'ai-art', icon: '🎨🤖', color: 'bg-purple-600' },
  { name: 'Voice Assistants / वॉइस असिस्टेंट', concept: 'voice-assistants', icon: '🗣️🤖', color: 'bg-orange-500' },
  { name: 'AI in Healthcare / स्वास्थ्य में AI', concept: 'ai-in-healthcare', icon: '🏥🤖', color: 'bg-red-500' },
  { name: 'AI in Space / अंतरिक्ष में AI', concept: 'ai-in-space', icon: '🌌🤖', color: 'bg-blue-600' },
  { name: 'AI in Environment / पर्यावरण में AI', concept: 'ai-in-environment', icon: '🌳🤖', color: 'bg-green-600' },
  { name: 'AI in Art & Music / कला और संगीत में AI', concept: 'ai-in-art-music', icon: '🎵🎨🤖', color: 'bg-pink-600' },
];

export default function AiKeAjoobe({ session }) {
    const { profile } = useProfile(session?.user);
    const [loading, setLoading] = useState(false);
    const [conversation, setConversation] = useState([]);
    const [lessonStarted, setLessonStarted] = useState(false);

    const startLesson = (topicToStart) => {
        if (!topicToStart || !topicToStart.trim()) return;
        setLessonStarted(true);
        setConversation([]);
        handleAPIRequest(`Teach me about the AI topic: ${topicToStart}`);
    };

    const handleAPIRequest = async (newMessage) => {
        if (!profile?.user_class) return alert("Please select your class in your profile first.");
        setLoading(true);
        const historyForAPI = conversation.map(m => ({ role: m.sender === 'ai' ? 'model' : 'user', parts: [{ text: m.text }] }));
        try {
            const res = await fetchTutorResponse(historyForAPI, newMessage, profile.user_class, profile.preferred_language);
            setConversation(prev => [...prev, { sender: 'ai', text: res.response }]);
        } catch (error) { 
            setConversation(prev => [...prev, { sender: 'ai', text: 'Sorry, AI se connect hone me error aa gaya.' }]); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleUserReply = (replyText) => {
        setConversation(prev => [...prev, { sender: 'user', text: replyText }]);
        handleAPIRequest(replyText);
    };

    const resetView = () => { setLessonStarted(false); };

    return (
        <div className="max-w-4xl mx-auto">
            {!lessonStarted ? (
                <div className="max-w-3xl mx-auto space-y-4">
                    <TopicSelector onTopicSelect={startLesson} popularTopics={aiTopics} title="Koi AI topic select karein aur AI ke bare me seekhein!"/>
                    <div className="flex items-center text-center"><hr className="w-full"/><span className="px-2 text-gray-400">YA</span><hr className="w-full"/></div>
                    <SearchComponent 
                        onSearch={startLesson} 
                        placeholder="Koi bhi AI topic search karein..." 
                        buttonText="Start Lesson"
                        loading={loading}
                    />
                </div>
            ) : (
                <div>
                    <button onClick={resetView} className="mb-4 bg-gray-200 px-4 py-2 rounded-lg">‹ Naya Topic Chunein</button>
                    <ChatInterface messages={conversation} onOptionClick={handleUserReply} onSendMessage={handleUserReply} loading={loading} />
                </div>
            )}
        </div>
    );
}
