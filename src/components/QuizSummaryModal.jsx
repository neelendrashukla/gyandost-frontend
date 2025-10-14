import React from 'react';
import GyanDostMascot from "./GyanDostMascot.jsx";

export default function QuizSummaryModal({ score, total, onClose }) {
  const xpGained = score * 10;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4">
        <GyanDostMascot state="success" height="120px" width="120px" />
        <h2 className="text-3xl font-bold text-green-600 mt-4">Shaandaar Pradarshan!</h2>
        <div className="my-6">
          <p className="text-lg">Aapka Score</p>
          <p className="text-5xl font-bold my-1">{score} / {total}</p>
          <p className="text-yellow-500 font-semibold text-lg">+{xpGained} XP ✨</p>
        </div>
        <button onClick={onClose} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg">Aage Badhein</button>
      </div>
    </div>
  );
}