import React, { useState } from 'react';
import { useProfile } from "../hooks/useProfile.js";
import { fetchMindMap, fetchTutorResponse } from "../api.js";
import GyanDostMascot from "./GyanDostMascot.jsx";
import MindMapDisplay from "./MindMapDisplay.jsx";
import ChatInterface from './ChatInterface.jsx';
import SearchComponent from './SearchComponent.jsx';
import TopicSelector from './TopicSelector.jsx';

const popularMindMapTopics = [
  { name: 'Fractions', icon: '➗', color: 'bg-pink-400' },
  { name: 'Decimals', icon: '🔢', color: 'bg-red-400' },
  { name: 'Computer Basics', icon: '💻', color: 'bg-gray-400' },
  { name: 'Computer Programming', icon: '💻', color: 'bg-gray-600' },
  { name: 'States of Matter', icon: '🧊', color: 'bg-cyan-400' },
  { name: 'Human Body Systems', icon: '🫀', color: 'bg-red-300' },
  { name: 'Famous Inventors', icon: '🧑‍🔬', color: 'bg-purple-400' },
  { name: 'Freedom Fighters', icon: '🚩', color: 'bg-red-400' },  
  { name: 'Water Cycle', icon: '💧', color: 'bg-blue-500' },
  { name: 'Solar System', icon: '🪐', color: 'bg-indigo-500' },
  { name: 'Photosynthesis', icon: '🌿', color: 'bg-green-500' },
  { name: 'Human Heart', icon: '❤️', color: 'bg-red-500' },
  { name: 'Pythagorean Theorem', icon: '📐', color: 'bg-yellow-500' },
  { name: 'Newton\'s Laws', icon: '🍎', color: 'bg-orange-500' },
  { name: 'Periodic Table', icon: '🧪', color: 'bg-purple-500' },
  { name: 'World War I', icon: '🌍', color: 'bg-gray-700' },
  { name: 'Electric Circuits', icon: '💡', color: 'bg-yellow-400' },
  { name: 'Popular Technologies', icon: '🌐', color: 'bg-indigo-600'},
  { name: 'Grammar Basics', icon: '📝', color: 'bg-yellow-300' },
  { name: 'Geometry', icon: '📏', color: 'bg-pink-600' },
  { name: 'Algebra', icon: '🔢', color: 'bg-red-600' },
  { name: 'Ramayan', icon: '🏹', color: 'bg-orange-500' },
  { name: 'Mahabharat', icon: '⚔️', color: 'bg-blue-500' },
  { name: 'Bhagavad Gita', icon: '🕉️', color: 'bg-yellow-500' },
  { name: 'Hamare Rishi-Muni', icon: '🧙‍♂️', color: 'bg-indigo-500' },
  { name: 'Yoga aur Uske Fayde', icon: '🧘‍♀️', color: 'bg-green-500' },
  { name: 'Indian Festivals aur Unka Mahatva', icon: '🎉', color: 'bg-purple-500' },
  { name: 'Indian Classical Music', icon: '🎵', color: 'bg-pink-500' },
  { name: 'Indian Dance Forms', icon: '💃', color: 'bg-indigo-500' },
  { name: 'Famous Indian Monuments', icon: '🏰', color: 'bg-gray-600' },
  { name: 'Indian Cuisine', icon: '🍛', color: 'bg-yellow-600' },
  { name: 'Hindu Dharm ke Mukhya Siddhant', icon: '🙏', color: 'bg-orange-600' },
  { name: 'Vedas aur Unka Mahatva', icon: '📜', color: 'bg-green-500' },
  { name: 'Upanishadon ka Parichay', icon: '🧘‍♂️', color: 'bg-purple-500' },
  { name: 'Chanakya Niti', icon: '🧠', color: 'bg-gray-600' },
  { name: 'Spirituality in India', icon: '🧘‍♂️', color: 'bg-purple-600' },
  { name: 'Universe', icon: '🌌', color: 'bg-blue-800' },
];

export default function MindMapExplorer({ session }) {
    const { profile } = useProfile(session?.user);
    const [loading, setLoading] = useState(false);
    const [mindMapData, setMindMapData] = useState(null);
    const [conversation, setConversation] = useState([]);
    const [lessonStarted, setLessonStarted] = useState(false);

    const handleSearchForMindMap = async (topic) => {
        if (!topic.trim()) return alert("Please enter a topic.");
        setLoading(true);
        setMindMapData(null);
        setLessonStarted(false);
        try {
            const res = await fetchMindMap(topic, profile.user_class, profile.preferred_language);
            setMindMapData(res.mindMapData);
        } catch (error) { alert("Mind map banane me error aa gaya."); } 
        finally { setLoading(false); }
    };

    const startChatFromNode = (nodeTopic) => {
        setLessonStarted(true);
        setConversation([]);
        handleTutorAPIRequest(`Teach me about this sub-topic: ${nodeTopic}`);
    };
    
    const handleTutorAPIRequest = async (newMessage) => {
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
        handleTutorAPIRequest(replyText);
    };

    if (lessonStarted) {
        return (
            <div className="max-w-3xl mx-auto">
                <button onClick={() => setLessonStarted(false)} className="mb-4 bg-gray-200 px-4 py-2 rounded-lg">‹ Wapas Mind Map par Jaayein</button>
                <ChatInterface messages={conversation} onOptionClick={handleUserReply} onSendMessage={handleUserReply} loading={loading} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-4xl font-display font-bold text-blue-600">🗺️ Mind Map Explorer</h2>
                <p className="text-gray-500 mt-2">Kisi bhi topic ko visually explore karein!</p>
            </div>

            {/* TopicSelector for popular topics */}
            <div className="max-w-3xl mx-auto mb-6">
                <TopicSelector 
                    onTopicSelect={handleSearchForMindMap} 
                    popularTopics={popularMindMapTopics} 
                    title="Koi popular topic select karein aur mind map generate karein!" 
                />
            </div>

            <div className="max-w-2xl mx-auto mb-6">
                <SearchComponent 
                    onSearch={handleSearchForMindMap}
                    placeholder="Mind map banane ke liye topic search karein..."
                    buttonText="Generate Mind Map"
                    loading={loading}
                />
            </div>

            {loading && <div className="mt-6"><GyanDostMascot state="thinking" /></div>}

            {mindMapData && !loading && (
                <div className="mt-6">
                    <MindMapDisplay data={mindMapData} onNodeClick={startChatFromNode} />
                </div>
            )}
        </div>
    );
}
