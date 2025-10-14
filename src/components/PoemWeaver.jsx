import React, { useState, useContext, useEffect } from "react";
import { useProfile } from "../hooks/useProfile.js";
import { LanguageContext } from "../context/LanguageContext.jsx";
import {
  fetchStartPoem,
  fetchImprovedPoemSegment,
  fetchFinishPoem,
  fetchCreativeTopics,
} from "../api.js";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SearchComponent from "./SearchComponent.jsx";
import GyanDostMascot from "./GyanDostMascot.jsx";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition.js";
import Confetti from "react-confetti";
import { Howl } from "howler";
import { toast } from "react-hot-toast";

const winSound = new Howl({ src: ["/sounds/win.mp3"] });

const poemGenres = [
  { name: "Funny", emoji: "😂" },
  { name: "Motivational", emoji: "💪" },
  { name: "Sad", emoji: "😢" },
  { name: "Nature", emoji: "🌳" },
  { name: "Adventure", emoji: "🚀" },
  { name: "Friendship", emoji: "🤝" },
  { name: "Love", emoji: "❤️" },
  { name: "Festive", emoji: "🎉" },
  { name: "Inspirational", emoji: "🌟" },
  { name: "Mystery", emoji: "🕵️" },
  { name: "Fantasy", emoji: "🦄" },
  { name: "Historical", emoji: "🏰" },
];

export default function PoemWeaver({ session }) {
  const { profile } = useProfile(session?.user);
  const { language } = useContext(LanguageContext);

  const [poemText, setPoemText] = useState("");
  const [userLine, setUserLine] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [poemStarted, setPoemStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [suggestedTopics, setSuggestedTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");

  const { isListening, transcript, handleListen } = useSpeechRecognition();

  // Mic speech updates input
  useEffect(() => {
    if (transcript) setUserLine(transcript);
  }, [transcript]);

  // Fetch topic ideas
  useEffect(() => {
    const getTopics = async () => {
      if (selectedGenre && profile) {
        setLoading(true);
        try {
          const res = await fetchCreativeTopics(selectedGenre, profile.user_class, language);
          setSuggestedTopics(res.topics || []);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    };
    getTopics();
  }, [selectedGenre, profile, language]);

  // Start poem
  const handleStartPoem = async (topic) => {
    if (!topic.trim() || !profile || !selectedGenre) return;
    setSelectedTopic(topic);
    setLoading(true);
    try {
      const res = await fetchStartPoem(topic, selectedGenre, profile.user_class, language);
      setPoemText(res.lines || "");
      setPoemStarted(true);
    } catch (error) {
      alert("Sorry, AI kavita shuru nahi kar paa raha hai.");
    } finally {
      setLoading(false);
    }
  };

  // Add line
  const handleAddLine = async (e) => {
    e.preventDefault();
    if (!userLine.trim()) return;
    const poemSoFarText = poemText;
    const userLineText = userLine;
    setUserLine("");
    setLoading(true);
    try {
      const res = await fetchImprovedPoemSegment(
        poemSoFarText,
        userLineText,
        selectedGenre,
        profile.user_class,
        language
      );
      setPoemText((prev) => prev + "\n" + res.improved_user_line + "\n" + res.ai_line);
    } catch (error) {
      alert("Sorry, AI thoda busy hai.");
    } finally {
      setLoading(false);
    }
  };

  // Finish poem
  const handleFinishPoem = async () => {
    const poemSoFarText = poemText;
    setLoading(true);
    try {
      const res = await fetchFinishPoem(
        poemSoFarText,
        selectedGenre,
        profile.user_class,
        language
      );
      setPoemText((prev) => prev + `\n\n--- THE END ---\n${res.finalPart}`);
      setIsFinished(true);
      winSound.play();
      toast.success("Kavita poori ho gayi! ✨");
    } catch (error) {
      alert("Sorry, AI kavita khatam nahi kar paa raha hai.");
    } finally {
      setLoading(false);
    }
  };

  // Save poem as file
  const handleSavePoemToFile = () => {
    const fileName = `${selectedTopic || "poem"}-${Date.now()}.txt`;
    const blob = new Blob([poemText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Kavita file ke roop me download ho gayi! 💾");
  };

  // Reset poem
  const reset = () => {
    setPoemText("");
    setSelectedGenre(null);
    setPoemStarted(false);
    setIsFinished(false);
    setSelectedTopic("");
  };

  // Choose genre screen
  if (!selectedGenre) {
    return (
      <div className="text-center max-w-lg mx-auto">
        <Link
          to="/creative-corner"
          className="mb-4 inline-block bg-gray-200 px-4 py-2 rounded-lg"
        >
          ‹ Wapas
        </Link>
        <h1 className="text-4xl font-bold mb-4">Kavita Weaver</h1>
        <p className="mb-6 text-gray-600">Aap kis mood ki kavita likhna chahte hain?</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {poemGenres.map((genre) => (
            <motion.button
              key={genre.name}
              onClick={() => setSelectedGenre(genre.name)}
              whileHover={{ scale: 1.1 }}
              className="p-6 bg-white rounded-lg shadow-md"
            >
              <span className="text-4xl">{genre.emoji}</span>
              <p className="font-bold mt-2">{genre.name}</p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // Choose topic screen
  if (!poemStarted) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <button
          onClick={() => setSelectedGenre(null)}
          className="mb-4 inline-block bg-gray-200 px-4 py-2 rounded-lg"
        >
          ‹ Wapas Genre Chunein
        </button>
        <h1 className="text-4xl font-display font-bold text-pink-500 mb-4">✍️ Kavita Weaver</h1>
        <p className="text-gray-600 mb-6">
          "Topic for your <span className="font-bold">{selectedGenre}</span> poem?"
        </p>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Kuch Ideas...</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {loading ? (
              <p>Loading ideas...</p>
            ) : (
              suggestedTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleStartPoem(topic)}
                  className="bg-gray-200 px-3 py-1 rounded-full"
                >
                  {topic}
                </button>
              ))
            )}
          </div>
        </div>

        <SearchComponent
          onSearch={handleStartPoem}
          placeholder="Ya apna topic likhein..."
          buttonText="Shuru Karein!"
        />
      </div>
    );
  }

  // Poem writing screen
  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      {isFinished && <Confetti recycle={false} />}

      <div className="flex justify-between mb-4">
        <button onClick={reset} className="bg-gray-200 px-4 py-2 rounded-lg">‹ Nayi Kavita</button>
        {isFinished && (
          <button onClick={handleSavePoemToFile} className="bg-yellow-500 text-white px-4 py-2 rounded-lg">Save Poem 💾</button>
        )}
      </div>

      <div className="flex-1 bg-white p-6 rounded-lg shadow-card overflow-y-auto mb-4 border-2 border-pink-200">
        <p className="text-lg md:text-xl whitespace-pre-wrap text-gray-800 font-mono">{poemText}</p>
        {loading && <GyanDostMascot state="thinking" size="small" />}
      </div>

      {!isFinished && (
        <form onSubmit={handleAddLine} className="flex gap-3 items-center">
          <button
            type="button"
            onClick={handleListen}
            className={`p-3 rounded-full ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            🎤
          </button>
          <input
            type="text"
            value={userLine}
            onChange={(e) => setUserLine(e.target.value)}
            placeholder="Agli line likhein ya bolein..."
            className="flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-pink-500"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !userLine.trim()} className="bg-pink-600 text-white px-4 py-3 rounded-lg">Add</button>
          <button type="button" onClick={handleFinishPoem} disabled={loading} className="bg-green-600 text-white px-4 py-3 rounded-lg">Finish</button>
        </form>
      )}

      {isFinished && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-4 bg-green-100 rounded-lg mt-2">
          <h3 className="text-2xl font-bold text-green-700">Kavita Poori Hui! ✍️</h3>
          <p className="text-gray-600 mt-2">Shabash! Aap ek behtareen kavi hain.</p>
        </motion.div>
      )}
    </div>
  );
}
