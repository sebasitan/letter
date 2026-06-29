/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFDFB',
          100: '#FDF8F3',
          200: '#F9F1E8',
          300: '#F5E9DC',
        },
        ink: {
          DEFAULT: '#4A1D1F',
          light: '#6B2D30',
          dark: '#3A1517',
        },
        gold: {
          DEFAULT: '#C49A2E',
          light: '#D4AB3F',
          dark: '#A68125',
        },
        rust: {
          DEFAULT: '#B5593A',
          light: '#C76A4B',
          dark: '#9A4A2F',
        },
        burgundy: {
          DEFAULT: '#722F37',
          light: '#8B3A43',
          dark: '#5A252C',
        }
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        dm: ['"DM Sans"', 'sans-serif'],
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
        'marquee-reverse': 'marquee-reverse 30s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
    },
  },
  plugins: [],
}
