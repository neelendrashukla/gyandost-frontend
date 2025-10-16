import React, { useState } from 'react';
import { useProfile } from "../hooks/useProfile.js";
import { fetchTutorResponse } from "../api.js";
import GyanDostMascot from "./GyanDostMascot.jsx";
import SearchComponent from './SearchComponent.jsx';
import TopicSelector from './TopicSelector.jsx';
import ChatInterface from './ChatInterface.jsx';

const popularSanskritiTopics = [
  { name: 'Ramayan', icon: '🏹', color: 'bg-orange-500' },
  { name: 'Mahabharat', icon: '⚔️', color: 'bg-blue-500' },
  { name: 'Bhagavad Gita', icon: '🕉️', color: 'bg-yellow-500' },
  { name: 'Hamare Rishi-Muni', icon: '🧙‍♂️', color: 'bg-indigo-500' },
  { name: 'Mahadev aur Unki Kahaniyan', icon: '🔱', color: 'bg-blue-600' },
  { name: 'Shri Krishna', icon: '🎶🪈', color: 'bg-indigo-500' },
  { name: 'Pancatantra ki Kahaniyan', icon: '🦊', color: 'bg-green-600' },
  { name: 'Jungle Book ki Kahaniyan', icon: '🐅', color: 'bg-yellow-700' },
  { name: 'Akbar-Birbal ki Kahaniyan', icon: '👑', color: 'bg-red-500' },
  { name: 'Spirituality in India', icon: '🧘‍♂️', color: 'bg-purple-600' },
  { name: 'Science vs spirituality', icon: '🔬🧘‍♀️', color: 'bg-purple-500'},
  { name: 'Yoga aur Uske Fayde', icon: '🧘‍♀️', color: 'bg-green-500' },
  { name: 'Adhyatmikta vs Dharmikta', icon: '🕉️', color: 'bg-yellow-400' },
  { name: 'Indian Festivals aur Unka Mahatva', icon: '🎉', color: 'bg-purple-500' },
  { name: 'Indian Classical Music', icon: '🎵', color: 'bg-pink-500' },
  { name: 'Indian Dance Forms', icon: '💃', color: 'bg-indigo-500' },
  { name: 'Famous Indian Monuments', icon: '🏰', color: 'bg-gray-600' },
  { name: 'Indian Cuisine', icon: '🍛', color: 'bg-yellow-600' },
  { name: 'Hindu Dharm ke Mukhya Siddhant', icon: '🙏', color: 'bg-orange-600' },
  { name: 'Vedas aur Unka Mahatva', icon: '📜', color: 'bg-green-500' },
  { name: 'Upanishadon ka Parichay', icon: '🧘‍♂️', color: 'bg-purple-500' },
  { name: 'Chanakya Niti', icon: '🧠', color: 'bg-gray-600' },
  { name: 'Gautam Buddha ki Kahani', icon: '🧘', color: 'bg-indigo-500' },
  { name: 'Aaryabhatta aur Unke Yogdan', icon: '🌟', color: 'bg-yellow-500' },
  { name: 'Bhartiya Vaigyanik', icon: '🔬', color: 'bg-purple-500' },
  { name: 'Shivaji Maharaj', icon: '👑', color: 'bg-red-500' },
  { name: 'Rani Lakshmibai', icon: '🗡️', color: 'bg-pink-500' },
  { name: 'Ashoka the Great', icon: '🦁', color: 'bg-yellow-500' },
  { name: 'Maharana Pratap', icon: '🏹', color: 'bg-blue-500' },
  { name: 'Sikh Gurus aur Unka Sandesh', icon: '☬', color: 'bg-cyan-500' },
  { name: 'Mahatma Gandhi', icon: '🕊️', color: 'bg-white' },
  { name: 'Swami Vivekananda', icon: '🧑‍🎓', color: 'bg-orange-400' },
  { name: 'Veer Savarkar', icon: '🛡️', color: 'bg-green-400' },
  { name: 'Subhas Chandra Bose', icon: '🚩', color: 'bg-red-400' },
  { name: 'Dr. B.R. Ambedkar', icon: '📜', color: 'bg-blue-400' },
  { name: 'Veera Bhagat Singh', icon: '✊', color: 'bg-red-400' },
  { name: 'APJ Abdul Kalam', icon: '🚀', color: 'bg-green-400' },
  { name: 'Sardar Vallabhbhai Patel', icon: '🗺️', color: 'bg-gray-400' },
];

export default function SanskritiGyan({ session }) {
    const { profile } = useProfile(session?.user);
    const [loading, setLoading] = useState(false);
    const [conversation, setConversation] = useState([]);
    const [lessonStarted, setLessonStarted] = useState(false);

    const startLesson = (topicToStart) => {
        if (!topicToStart.trim()) return;
        setLessonStarted(true);
        setConversation([]);
        handleAPIRequest(`Tell me about this Indian cultural topic: ${topicToStart}`);
    };

    const handleAPIRequest = async (newMessage) => {
        if (!profile?.user_class) return;
        setLoading(true);
        const historyForAPI = conversation.map(m => ({ role: m.sender === 'ai' ? 'model' : 'user', parts: [{ text: m.text }] }));
        try {
            const res = await fetchTutorResponse(historyForAPI, newMessage, profile.user_class, profile.preferred_language);
            setConversation(prev => [...prev, { sender: 'ai', text: res.response }]);
        } catch (error) { setConversation(prev => [...prev, { sender: 'ai', text: 'Sorry, AI se connect hone me error aa gaya.' }]); } 
        finally { setLoading(false); }
    };
    
    const handleUserReply = (replyText) => {
        setConversation(prev => [...prev, { sender: 'user', text: replyText }]);
        handleAPIRequest(replyText);
    };

    const resetLesson = () => { setLessonStarted(false); };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-6">
                <h1 className="text-4xl font-display font-bold text-orange-600">🕉️ Sanskriti aur Gyan</h1>
            </div>

            {!lessonStarted ? (
                  <div className="space-y-4">
                    <TopicSelector onTopicSelect={startLesson} popularTopics={popularSanskritiTopics} title="Kisi vishay ke baare me gehraai se jaanein!" />
                    <div className="my-4 flex items-center text-center"><hr className="w-full" /><span className="px-2 text-gray-400">YA</span><hr className="w-full" /></div>
                    <SearchComponent 
                      onSearch={startLesson}
                      placeholder="Granth, Mahapurush, ya Itihas..."
                      buttonText="Explore"
                      loading={loading} />
                  </div>
            ) : (
                <>
                    <button onClick={resetLesson} className="mb-4 bg-gray-200 px-4 py-2 rounded-lg">‹ Naya Topic Chunein</button>
                    <ChatInterface messages={conversation} onOptionClick={handleUserReply} onSendMessage={handleUserReply} loading={loading} />
                </>
            )}
        </div>
    );
}