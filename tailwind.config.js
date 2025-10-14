/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cosmic-blue': '#1A2A4E', // Deep Space Blue
        'cosmic-purple': '#4A2A6F', // Galactic Purple
        'star-yellow': '#FFD700', // Gold for stars
        'nebula-pink': '#FF69B4', // Vibrant Pink for nebulae
        'space-gray': '#CED4DA', // Light gray for subtle elements
        'brand-primary': '#4A90E2', // Existing friendly blue
        'brand-secondary': '#F5A623', // Existing warm orange/yellow
        'brand-background': '#F9FAFB', // Will be mostly replaced by cosmic theme
        'brand-text': '#E0E0E0', // Light text for dark backgrounds
        'brand-success': '#7ED321',
      },
      fontFamily: {
        sans: ['Poppins', ...defaultTheme.fontFamily.sans],
        display: ['Baloo Bhai 2', 'cursive'], // Changed to Baloo Bhai 2 for thicker look
      },
      boxShadow: {
        'card': '0px 8px 30px rgba(0, 0, 0, 0.3)', // Deeper shadow for floating effect
        'card-hover': '0px 12px 40px rgba(0, 0, 0, 0.4)',
        'star-glow': '0 0 15px rgba(255, 215, 0, 0.7)', // Glow for active elements
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '25%': { transform: 'translateY(-5px) translateX(5px)' },
          '50%': { transform: 'translateY(0px) translateX(0px)' },
          '75%': { transform: 'translateY(5px) translateX(-5px)' },
        },
        'star-blink': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        'mascot-wave': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(10deg)' },
          '50%': { transform: 'rotate(-10deg)' },
          '75%': { transform: 'rotate(10deg)' },
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'star-blink': 'star-blink 2s ease-in-out infinite',
        'mascot-wave': 'mascot-wave 1s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}