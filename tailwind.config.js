/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Circle Picks brand colors
        primary: {
          DEFAULT: '#FD512E',
          50: '#FFF5F2',
          100: '#FFEBE6',
          200: '#FFD4CC',
          300: '#FFB3A3',
          400: '#FF8066',
          500: '#FD512E',
          600: '#E5401F',
          700: '#CC3318',
          800: '#A62812',
          900: '#801E0D',
        },
        // Surface colors
        surface: {
          DEFAULT: '#F6F7F9',
          50: '#FFFFFF',
          100: '#F6F7F9',
          200: '#EDEEF1',
          300: '#E4E6EA',
        },
        // Chip/tag background
        chip: {
          DEFAULT: '#EDEEF1',
          active: '#FFE6E0',
        },
        // Text colors
        'dark-grey': '#111111',
        'medium-grey': '#555555',
        'light-grey': '#888888',
        // Dividers
        divider: '#E4E6EA',
        // Secondary palette
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
