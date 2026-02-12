/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#d4a843',
          500: '#c9952c',
          600: '#b8861f',
        },
        dark: {
          900: '#0a0a0a',
          800: '#0f0f0f',
          700: '#141414',
          600: '#1a1a1a',
          500: '#222222',
          400: '#2a2a2a',
          300: '#333333',
        }
      }
    },
  },
  plugins: [],
}
