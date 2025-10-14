import React, { useState, useContext, useEffect } from 'react';
import { useProfile } from "../hooks/useProfile.js";
import { LanguageContext } from '../context/LanguageContext.jsx';
import { fetchStartStory, fetchImprovedStorySegment, fetchFinishStory, fetchCreativeTopics } from "../api.js";
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SearchComponent from "./SearchComponent.jsx";
import GyanDostMascot from "./GyanDostMascot.jsx";
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';
import Confetti from 'react-confetti';
import { Howl } from 'howler';

const winSound = new Howl({ src: ['/sounds/win.mp3'] });
const storyGenres = [
  { name: 'Adventure', emoji: '🚀' }, { name: 'Mystery', emoji: '🕵️' },
  { name: 'Funny', emoji: '😂' }, { name: 'Fantasy', emoji: '🦄' },
  { name: 'Sci-Fi', emoji: '🤖' }, { name: 'Spooky', emoji: '👻' },
  { name: 'Romance', emoji: '❤️' }, { name: 'Historical', emoji: '🏰' },
  { name: 'Drama', emoji: '🎭' }, { name: 'Action', emoji: '💥' },
  { name: 'Thriller', emoji: '🔪' }, { name: 'Musical', emoji: '🎵' },
  { name: 'Superhero', emoji: '🦸‍♂️' }, { name: 'Inspirational', emoji: '🌟' },
];

export default function StoryWeaver({ session }) {
  const { profile } = useProfile(session?.user);
  const { language } = useContext(LanguageContext);
  const [story, setStory] = useState([]);
  const [userLine, setUserLine] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [storyStarted, setStoryStarted] = useState(false);
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

  const handleStartStory = async (topic) => {
    if (!topic.trim() || !profile || !selectedGenre) return;
    setLoading(true);
    try {
      const res = await fetchStartStory(topic, selectedGenre, profile.user_class, language);
      setStory(res.lines ? [{ author: 'ai', text: res.lines }] : []);
      setStoryStarted(true);
    } catch {
      alert("Sorry, AI kahani shuru nahi kar paa raha hai.");
    } finally { setLoading(false); }
  };

  const handleAddLine = async (e) => {
    e.preventDefault();
    if (!userLine.trim()) return;
    const userLineText = userLine;
    const tempUserLine = { author: 'user', text: userLineText };
    setStory(prev => [...prev, tempUserLine]);
    setUserLine('');
    setLoading(true);
    try {
      const storySoFarText = [...story, tempUserLine].map(s => s.text).join('\n');
      const res = await fetchImprovedStorySegment(storySoFarText, userLineText, selectedGenre, profile.user_class, language);
      setStory(prev => {
        const updatedStory = [...prev];
        updatedStory.pop();
        return [...updatedStory, { author: 'user', text: res.improved_user_line }, { author: 'ai', text: res.ai_line }];
      });
    } catch {
      alert("Sorry, AI thoda busy hai.");
      setStory(prev => prev.slice(0, -1));
    } finally { setLoading(false); }
  };

  const handleFinishStory = async () => {
    setLoading(true);
    try {
      const storySoFarText = story.map(s => s.text).join('\n');
      const res = await fetchFinishStory(storySoFarText, selectedGenre, profile.user_class, language);
      setStory(prev => [...prev, { author: 'ai', text: `\n--- THE END ---\n${res.finalPart}` }]);
      setIsFinished(true);
      winSound.play();
    } catch {
      alert("Sorry, AI kahani khatam nahi kar paa raha hai.");
    } finally { setLoading(false); }
  };

  const handleSaveStory = () => {
    const storyText = story.map(s => `${s.author === 'user' ? 'You' : 'AI'}: ${s.text}`).join('\n\n');
    const blob = new Blob([storyText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Story_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setStory([]);
    setSelectedGenre(null);
    setStoryStarted(false);
    setIsFinished(false);
  };

  // ----- Render -----
  if (!selectedGenre) {
    return (
      <div className="text-center max-w-lg mx-auto">
        <Link to="/creative-corner" className="mb-4 inline-block bg-gray-200 px-4 py-2 rounded-lg">‹ Wapas</Link>
        <h1 className="text-4xl font-bold mb-4">Story Weaver</h1>
        <p className="mb-6 text-gray-600">Aap kis tarah ki kahani likhna chahte hain?</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {storyGenres.map(genre => (
            <motion.button key={genre.name} onClick={() => setSelectedGenre(genre.name)} whileHover={{ scale: 1.1 }} className="p-6 bg-white rounded-lg shadow-md">
              <span className="text-4xl">{genre.emoji}</span>
              <p className="font-bold mt-2">{genre.name}</p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (!storyStarted) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <button onClick={() => setSelectedGenre(null)} className="mb-4 inline-block bg-gray-200 px-4 py-2 rounded-lg">‹ Wapas Genre Chunein</button>
        <h1 className="text-4xl font-display font-bold text-blue-500 mb-4">📖 Story Weaver</h1>
        <p className="text-gray-600 mb-6">"Topic for your <span className="font-bold">{selectedGenre}</span> story"</p>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Kuch Ideas...</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {loading ? <p>Loading ideas...</p> : suggestedTopics.map(topic => (
              <button key={topic} onClick={() => handleStartStory(topic)} className="bg-gray-200 px-3 py-1 rounded-full">{topic}</button>
            ))}
          </div>
        </div>

        <SearchComponent onSearch={handleStartStory} placeholder="Ya apna topic likhein..." buttonText="Shuru Karein!" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 p-4">
      {isFinished && <Confetti recycle={false} />}

      <div className="flex justify-between mb-4">
        <button onClick={reset} className="bg-gray-200 px-4 py-2 rounded-lg">‹ Nayi Kahani</button>
        {isFinished && (
          <button onClick={handleSaveStory} className="bg-purple-600 text-white px-4 py-2 rounded-lg">Save Story</button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow-card p-6 mb-4">
        {story.map((line, index) => (
          <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`my-4 ${line.author === 'user' ? 'text-right' : 'text-left'}`}>
            <p className="inline-block bg-gray-100 p-4 rounded-lg text-lg md:text-xl whitespace-pre-wrap">{line.text}</p>
          </motion.div>
        ))}
        {loading && <GyanDostMascot state="thinking" size="small" />}
      </div>

      {!isFinished && (
        <>
          <form onSubmit={handleAddLine} className="flex gap-3 mb-4">
            <input
              type="text"
              value={userLine}
              onChange={(e) => setUserLine(e.target.value)}
              placeholder="Agli line likhein ya bolein..."
              className="flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-50"
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleListen}
              className={`px-4 py-2 rounded-lg transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              <span className="text-2xl">🎤</span>
            </button>
            <button type="submit" disabled={loading || !userLine.trim()} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Add</button>
            <button type="button" onClick={handleFinishStory} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded-lg">Finish</button>
          </form>
        </>
      )}

      {isFinished && (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="text-center p-4 bg-green-100 rounded-lg mt-2">
          <h3 className="text-2xl font-bold text-green-700">Kahani Poori Hui! 🎉</h3>
          <p className="text-gray-600 mt-2">Shabash! Aapne aur GyanDost ne milkar ek amazing kahani banayi hai.</p>
        </motion.div>
      )}
    </div>
  );
}
