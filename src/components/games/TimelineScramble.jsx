import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { Howl } from "howler";
import { Link } from "react-router-dom";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

// 🎵 Sounds
const correctSound = new Howl({ src: ["/sounds/correct.mp3"] });
const incorrectSound = new Howl({ src: ["/sounds/incorrect.mp3"] });
const winSound = new Howl({ src: ["/sounds/win.mp3"] });
const dropSound = new Howl({ src: ["/sounds/drop.mp3"], volume: 0.5 });

// Shuffle array
const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

// Motivational messages
const messages = [
  "Shabash! Aapne kamaal kiya! 🌟",
  "Wah! Lagta hai aap expert ho! 🚀",
  "Correct! Keep it up! 💪",
  "Nice! Practice se perfect! 🎯",
  "Badhai ho! Aap top performer ho! 🏆"
];

// Individual sortable item
function SortableItem({ item, index, feedback, correctOrder }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.event });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : "auto",
    boxShadow: isDragging ? "0 10px 25px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.1)"
  };

  const glow =
    feedback && item.year === correctOrder[index].year
      ? "shadow-[0_0_15px_3px_rgba(34,197,94,0.7)]"
      : feedback && item.year !== correctOrder[index].year
      ? "animate-shake shadow-[0_0_15px_3px_rgba(239,68,68,0.7)]"
      : "";

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ scale: 1 }}
      animate={{ scale: isDragging ? 1.05 : 1 }}
      whileHover={{ scale: 1.03 }}
      className={`p-5 rounded-2xl flex items-center justify-between cursor-grab transition-all bg-white ${glow}`}
    >
      <span className="font-bold text-gray-400 mr-4 text-xl">☰</span>
      <span className="flex-1 text-lg font-semibold text-gray-800">{item.event}</span>
      {feedback && (
        <span className={`font-bold text-xl ${item.year === correctOrder[index].year ? "text-green-500" : "text-red-500"}`}>
          {item.year === correctOrder[index].year ? "✅" : "❌"}
        </span>
      )}
    </motion.div>
  );
}

export default function TimelineScramble({ data, onRestart }) {
  const levels = ["Easy", "Medium", "Hard"];
  const [currentLevel, setCurrentLevel] = useState(0);
  const [eventsPerLevel, setEventsPerLevel] = useState([]);
  const [userOrder, setUserOrder] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [score, setScore] = useState(0);
  const [motivation, setMotivation] = useState("");

  const sensors = useSensors(useSensor(PointerSensor));

  // Setup level
  useEffect(() => {
    const levelCount = 5 + currentLevel * 2; // Easy:5, Medium:7, Hard:9
    const levelEvents = data.events.slice(0, Math.min(levelCount, data.events.length));
    setEventsPerLevel(levelEvents);
    setUserOrder(shuffleArray(levelEvents));
    setFeedback(null);
    setIsFinished(false);
    setScore(0);
    setMotivation("");
  }, [data, currentLevel]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = userOrder.findIndex((i) => i.event === active.id);
      const newIndex = userOrder.findIndex((i) => i.event === over.id);
      setUserOrder(arrayMove(userOrder, oldIndex, newIndex));
      dropSound.play();
      setFeedback(null);
    }
  };

  const checkOrder = () => {
    let allCorrect = true;
    let tempScore = 0;
    for (let i = 0; i < userOrder.length; i++) {
      if (userOrder[i].year === eventsPerLevel[i].year) tempScore += 1;
      else allCorrect = false;
    }
    setScore(tempScore);

    // Random motivational message
    const msg = messages[Math.floor(Math.random() * messages.length)];
    setMotivation(msg);

    if (allCorrect) {
      setFeedback("correct");
      winSound.play();
      setShowConfetti(true);
      setIsFinished(true);
    } else {
      setFeedback("incorrect");
      incorrectSound.play();
    }
  };

  const nextLevel = () => {
    if (currentLevel + 1 < levels.length) setCurrentLevel(currentLevel + 1);
    else onRestart();
  };

  if (!userOrder.length) return <div className="text-center text-xl font-semibold py-20">Loading Game...</div>;

  return (
    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl w-full max-w-3xl mx-auto text-center shadow-2xl relative">
      <Link to="/game-zone" className="mb-6 inline-block bg-gray-200 px-5 py-2 rounded-lg font-medium hover:bg-gray-300 transition">
        ‹ Wapas Game Zone
      </Link>

      <h2 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
        Timeline Scramble ⏳ - {levels[currentLevel]}
      </h2>
      <p className="text-gray-600 mb-6 text-lg">Ghatnaon ko unke saal ke hisaab se sahi kram me lagayein (sabse purani sabse upar)</p>

      <div className="mb-4 text-lg font-semibold">Score: {score}/{userOrder.length}</div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={userOrder.map((i) => i.event)} strategy={verticalListSortingStrategy}>
          <div className={`space-y-3 p-4 rounded-2xl border-2 transition-all ${feedback === "incorrect" ? "border-red-500 animate-shake" : "border-dashed border-gray-300"}`}>
            {userOrder.map((item, index) => (
              <SortableItem key={item.event} item={item} index={index} feedback={feedback} correctOrder={eventsPerLevel} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <motion.button onClick={checkOrder} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white p-4 rounded-2xl font-bold text-2xl shadow-lg hover:shadow-2xl transition-all"
      >
        Mera Order Check Karein! ✅
      </motion.button>

      {/* Motivational Feedback */}
      {motivation && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-yellow-50 rounded-xl shadow-md text-lg font-semibold text-yellow-800">
          {motivation}
        </motion.div>
      )}

      <AnimatePresence>
        {showConfetti && <Confetti recycle={false} numberOfPieces={300} onConfettiComplete={() => setShowConfetti(false)} />}
      </AnimatePresence>

      {/* Level Complete / Next Level */}
      {isFinished && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-6 bg-gradient-to-br from-green-200 to-emerald-100 rounded-2xl shadow-2xl text-center">
          <h2 className="text-3xl font-bold text-green-700 mb-2">Shabash! 🎉</h2>
          <p className="text-lg text-green-600 mb-4">Aapne sabhi ghatnaon ko sahi kram me laga diya!</p>
          <motion.button onClick={nextLevel} whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-full font-bold shadow-lg"
          >
            {currentLevel + 1 < levels.length ? "Next Level →" : "Naya Game Khelein! 🔄"}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
