// frontend/src/components/LessonCard.jsx

import React from "react";
import { TypeAnimation } from 'react-type-animation'; // NEW

export default function LessonCard({ title, body }) {
  return (
    <div className="card bg-white p-6 rounded-lg shadow-md mt-4">
      <h2 className="text-xl font-semibold mb-3 text-gray-800">{title}</h2>
      <div style={{ whiteSpace: "pre-wrap" }} className="text-gray-700 leading-relaxed">
        {/* NEW: Typing animation for the explanation body */}
        <TypeAnimation
          sequence={[body]}
          wrapper="span"
          speed={80}
          cursor={false}
          style={{ fontSize: '1em', display: 'inline-block' }}
        />
      </div>
    </div>
  );
}