import React, { useState, useContext, useEffect } from 'react';
import { useProfile } from "../hooks/useProfile.js";
import { LanguageContext } from '../context/LanguageContext.jsx';
import { fetchStartScript, fetchImprovedScriptSegment, fetchFinishScript, fetchCreativeTopics } from "../api.js";
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SearchComponent from "./SearchComponent.jsx";
import GyanDostMascot from "./GyanDostMascot.jsx";
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';
import Confetti from 'react-confetti';
import { Howl } from 'howler';

const winSound = new Howl({ src: ['/sounds/win.mp3'] });
const scriptGenres = [
  { name: 'Comedy', emoji: '😂' }, { name: 'Action', emoji: '💥' },
  { name: 'Mystery', emoji: '🕵️' }, { name: 'Drama', emoji: '🎭' },
  { name: 'Fantasy', emoji: '🦄' }, { name: 'Sci-Fi', emoji: '🤖' },
  { name: 'Horror', emoji: '👻' }, { name: 'Romance', emoji: '❤️' },
  { name: 'Historical', emoji: '🏰' }, { name: 'Adventure', emoji: '🚀' },
  { name: 'Thriller', emoji: '🔪' }, { name: 'Musical', emoji: '🎵' },
  { name: 'Superhero', emoji: '🦸‍♂️' }, { name: 'Inspirational', emoji: '🌟' },
];

export default function ScriptWeaver({ session }) {
  const { profile } = useProfile(session?.user);
  const { language } = useContext(LanguageContext);
  const [scriptText, setScriptText] = useState("");
  const [userLine, setUserLine] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [scriptStarted, setScriptStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [suggestedTopics, setSuggestedTopics] = useState([]);
  const { isListening, transcript, handleListen } = useSpeechRecognition();

  useEffect(() => { if (transcript) setUserLine(transcript); }, [transcript]);

  useEffect(() => {
    const getTopics = async () => {
      if (selectedGenre && profile) {
        setLoading(true);
        try {
          const res = await fetchCreativeTopics(selectedGenre, profile.user_class, language);
          setSuggestedTopics(res.topics || []);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
      }
    };
    getTopics();
  }, [selectedGenre, profile, language]);

  const handleStartScript = async (scene) => {
    if (!scene.trim() || !profile || !selectedGenre) return;
    setLoading(true);
    try {
      const res = await fetchStartScript(scene, selectedGenre, profile.user_class, language);
      setScriptText(res.script || "");
      setScriptStarted(true);
    } catch { alert("Sorry, AI script shuru nahi kar paa raha hai."); }
    finally { setLoading(false); }
  };

  const handleAddLine = async (e) => {
    e.preventDefault();
    if (!userLine.trim()) return;
    const userLineText = userLine;
    setUserLine('');
    setLoading(true);
    try {
      const res = await fetchImprovedScriptSegment(scriptText, userLineText, selectedGenre, profile.user_class, language);
      setScriptText(prev => prev + '\n' + res.improved_user_line + '\n' + res.ai_line);
    } catch { alert("Sorry, AI thoda busy hai."); } 
    finally { setLoading(false); }
  };
  
  const handleFinishScript = async () => {
    setLoading(true);
    try {
      const res = await fetchFinishScript(scriptText, selectedGenre, profile.user_class, language);
      setScriptText(prev => prev + `\n\n--- THE END ---\n${res.finalPart}`);
      setIsFinished(true);
      winSound.play();
    } catch { alert("Sorry, AI natak khatam nahi kar paa raha hai."); }
    finally { setLoading(false); }
  };

  const handleSaveScript = () => {
    const blob = new Blob([scriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Script_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setScriptText("");
    setSelectedGenre(null);
    setScriptStarted(false);
    setIsFinished(false);
  };

  // ----- Render -----
  if (!selectedGenre) {
    return (
      <div className="text-center max-w-lg mx-auto">
        <Link to="/creative-corner" className="mb-4 inline-block bg-gray-200 px-4 py-2 rounded-lg">‹ Wapas</Link>
        <h1 className="text-4xl font-bold mb-4">Natak Manch</h1>
        <p className="mb-6 text-gray-600">Aap kis tarah ka natak likhna chahte hain?</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {scriptGenres.map(genre => (
            <motion.button key={genre.name} onClick={() => setSelectedGenre(genre.name)} whileHover={{ scale: 1.1 }} className="p-6 bg-white rounded-lg shadow-md">
              <span className="text-4xl">{genre.emoji}</span>
              <p className="font-bold mt-2">{genre.name}</p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (!scriptStarted) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <button onClick={() => setSelectedGenre(null)} className="mb-4 inline-block bg-gray-200 px-4 py-2 rounded-lg">‹ Wapas Genre Chunein</button>
        <h1 className="text-4xl font-display font-bold text-indigo-500 mb-4">🎭 Natak Manch</h1>
        <p className="text-gray-600 mb-6">"Give a scene idea for your <span className="font-bold">{selectedGenre}</span> play"</p>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Kuch Ideas...</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {loading ? <p>Loading ideas...</p> : suggestedTopics.map(topic => (
              <button key={topic} onClick={() => handleStartScript(topic)} className="bg-gray-200 px-3 py-1 rounded-full">{topic}</button>
            ))}
          </div>
        </div>

        <SearchComponent onSearch={handleStartScript} placeholder="Ya apna idea likhein..." buttonText="Shuru Karein!" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      {isFinished && <Confetti recycle={false} />}

      <div className="flex justify-between mb-4">
        <button onClick={reset} className="bg-gray-200 px-4 py-2 rounded-lg">‹ Naya Natak</button>
        {isFinished && (
          <button onClick={handleSaveScript} className="bg-purple-600 text-white px-4 py-2 rounded-lg">Save Script</button>
        )}
      </div>

      <div className="flex-1 bg-white p-6 rounded-lg shadow-card overflow-y-auto mb-4 border-2 border-indigo-200">
        <p className="text-lg whitespace-pre-wrap text-gray-800 font-mono">{scriptText}</p>
      </div>

      {!isFinished && (
        <form onSubmit={handleAddLine} className="flex gap-3 items-center">
          <button type="button" onClick={handleListen} className={`p-3 rounded-lg ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 hover:bg-gray-300'}`}>
            🎤
          </button>
          <input
            type="text"
            value={userLine}
            onChange={(e) => setUserLine(e.target.value)}
            placeholder="Character: Dialogue..."
            className="flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-indigo-500"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !userLine.trim()} className="bg-indigo-600 text-white px-4 py-3 rounded-lg">Add</button>
          <button type="button" onClick={handleFinishScript} disabled={loading} className="bg-green-600 text-white px-4 py-3 rounded-lg">Finish</button>
        </form>
      )}

      {isFinished && (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="text-center p-4 bg-green-100 rounded-lg mt-2">
          <h3 className="text-2xl font-bold text-green-700">Natak Poora Hua! 🎭</h3>
          <p className="text-gray-600 mt-2">Shabash! Aap ek behtareen lekhak hain.</p>
        </motion.div>
      )}
    </div>
  );
}
