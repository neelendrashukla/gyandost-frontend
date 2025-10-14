// frontend/src/components/QuizCard.jsx
import React, { useState } from "react";

export default function QuizCard({ q, onAnswer }) {
  // q = { id, question, options[], answerIndex, hint, explanation }
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  function chooseOption(idx) {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    const correct = idx === q.answerIndex;
    if (onAnswer) onAnswer(correct);
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-md mb-4">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium">{q.question}</h3>
        <span className="text-sm text-gray-400">Q{q.id}</span>
      </div>

      <div className="mt-3 grid gap-2">
        {q.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = q.answerIndex === i;
          let bg = "bg-gray-100";
          if (revealed) {
            if (isCorrect) bg = "bg-green-100";
            else if (isSelected && !isCorrect) bg = "bg-red-100";
          }
          return (
            <button
              key={i}
              onClick={() => chooseOption(i)}
              className={`text-left px-3 py-2 rounded-md border ${bg} hover:border-gray-300`}
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 text-sm text-gray-600">
        {revealed ? (
          <>
            <div>
              {selected === q.answerIndex ? (
                <span className="text-green-700 font-semibold">Correct ✅</span>
              ) : (
                <span className="text-red-700 font-semibold">Incorrect ❌</span>
              )}
            </div>
            <div className="mt-2"><strong>Explanation:</strong> {q.explanation}</div>
          </>
        ) : (
          <div className="text-sm text-gray-500">Tip: {q.hint}</div>
        )}
      </div>
    </div>
  );
}
