/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0B1F3A',
        accent: '#C6A14A',
        success: '#1E7F4F',
        danger: '#B91C1C',
        background: '#F8F9FA'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      minHeight: {
        screen: ['100vh', '100dvh']
      },
      minWidth: {
        screen: ['100vw', '100dvw']
      }
    },
  },
  plugins: [],
};
