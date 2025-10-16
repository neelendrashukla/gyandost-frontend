import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';

// Section inside the modal
const GuideSection = ({ icon, title, children }) => (
  <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
    <h3 style={{ 
      fontSize: '1.25rem', 
      fontWeight: 'bold', 
      color: '#4c1d95', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.75rem' 
    }}>
      <span style={{ fontSize: '1.875rem' }}>{icon}</span> {title}
    </h3>
    <p style={{ 
      color: '#111827',  
      marginTop: '0.5rem', 
      paddingLeft: '2.5rem',
      fontSize: '1rem',
      lineHeight: '1.5'
    }}>{children}</p>
  </div>
);

export default function UserGuideModal({ onClose }) {
  useEffect(() => {
    console.log('UserGuideModal rendering!'); 
  }, []);

  // Check for modal-root
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    console.error('modal-root element not found!');
    return null;
  }

  // Modal content 
  const modalContent = (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        backgroundColor: 'rgba(0, 0, 0, 0.6)', 
        backdropFilter: 'blur(4px)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 9999, 
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        style={{ 
          backgroundColor: 'white', 
          borderRadius: '16px', 
          width: '100%', 
          maxWidth: '48rem', 
          maxHeight: '90vh', 
          display: 'flex', 
          flexDirection: 'column', 
          padding: '1.5rem', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
          overflowY: 'auto'
          
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexShrink: 0 }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#4c1d95' }}>Welcome to GyanDost! 🚀</h2>
          <button 
            onClick={onClose} 
            style={{ 
              color: '#9ca3af', 
              fontSize: '1.875rem', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer' 
            }}
            onMouseOver={(e) => e.target.style.color = '#1f2937'}
            onMouseOut={(e) => e.target.style.color = '#9ca3af'}
          >
            &times;
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
           <GuideSection icon="🧑‍🚀" title="Aapka Mission Control (Header)">
             🚀 Yeh aapka super personal dashboard hai! Yahan se aap apni progress ko asaan tareeke se track kar sakte hain – jaise XP points, level up, aur daily streak! 📈✨
           </GuideSection>

           <GuideSection icon="🎓" title="AI Tutor">
             🤖 Yeh aapka personal smart AI teacher hai, Jo aapko stories aur fun way se seekhne mein madad karega! Koi bhi topic search kijiye aur ek full interactive lesson paayein. 📚 Jab ready ho, "Take Final Test" pe click karke quick quiz dekar XP jeetiye aur master banein! 🏆💡
           </GuideSection>

           <GuideSection icon="🕉️" title="Sanskriti aur Gyan">
              Ramayan, Mahabharat, Bhagavad Gita jaise epic granthon aur Bharat ki rich sanskriti ko modern twist ke sath samajhiye. Creative storytelling aur **easy-to-understand analogies** ke through prachin gyaan aur values ka maza lijiye! 📖🌟
           </GuideSection>

           <GuideSection icon="🤖" title="AI ke Ajoobe">
             🔬 AI kaise magic karta hai? Machine Learning kya hai? Future tech jaise chatbots ko simple stories aur quizzes se seekhiye – bilkul beginner-friendly! ⚡🎉
           </GuideSection>

           <GuideSection icon="🗺️" title="Mind Map Explorer">
             🧠 Complex topics ko beautiful interactive mind maps mein badaliye! Connections ko visually connect kijiye – yeh learning ko super easy aur memorable banata hai! 🌳🔗
           </GuideSection>

           <GuideSection icon="🎮" title="Game Zone">
             🕹️ Fun AI-powered games kheliye jaise 'Concept Match' 🧩, 'Riddles' ❓, 'True or False' 🔍 aur 'Timeline Scramble' ⏰ ! Apni knowledge test kijiye – har game aapke level ke hisaab se adapt hota hai! 🎯🏅
           </GuideSection>

           <GuideSection icon="📝" title="Exam Mode">
             ⏱️ Subject chuniye (chapter optional) aur exam type select kijiye. AI custom timed exam banayega! Score ke saath detailed feedback aur explanations milega – confident banne ke liye perfect! 📊👍
           </GuideSection>

           <GuideSection icon="🎨" title="Imagination's Flight">
             ✨ Yeh aapki creativity ka ultimate playground hai! AI ke saath nayi kahaniyan ✍️, poems 🌹, aur natak 🎭 banaiye – imagination ko wings do! 🚀
           </GuideSection>
        </div>
      </div>
    </div>
  );

  // Portal into modal-root
  return ReactDOM.createPortal(modalContent, modalRoot);
}