/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        prestige: {
          bg: '#020617',
          card: '#0f172a',
          border: 'rgba(255, 255, 255, 0.05)',
          accent: '#4f46e5',
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        float: 'float 6s ease-in-out infinite',
        glow: 'glow 4s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { opacity: 0.8, filter: 'brightness(1)' },
          '50%': { opacity: 1, filter: 'brightness(1.5)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

