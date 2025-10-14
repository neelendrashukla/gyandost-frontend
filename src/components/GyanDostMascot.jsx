import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';

// Hum local animation files ka use kar rahe hain, jo sabse best tareeka hai
const animations = {
  idle: "/animation/idle.json",
  thinking: "/animation/thinking.json",
  success: "/animation/success.json",
  waving: "/animation/waving.json",
  talking: "/animation/talking.json" 
};

export default function GyanDostMascot({ state = 'idle', size = 'medium' }) {
  const getSize = () => {
    switch(size) {
      case 'small': return '100px';
      case 'medium': return '150px';
      case 'large': return '200px';
      default: return '150px';
    }
  };
  
  const animUrl = animations[state] || animations.idle;
  const animSize = getSize();

  return (
    <div className="flex justify-center items-center" style={{ width: animSize, height: animSize }}>
        <Player
            autoplay
            loop
            src={animUrl}
            style={{ height: '100%', width: '100%' }}
        />
    </div>
  );
}