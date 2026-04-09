export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kisan-green': {
          50: '#f0f9f0',
          100: '#dcf0dc',
          200: '#bbe1bb',
          300: '#8ec98e',
          400: '#5ba65b',
          500: '#3a8a3a',
          600: '#2c6e2c',
          700: '#255825',
          800: '#204620',
          900: '#1b3b1b',
        },
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
