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
      },
      borderRadius: {
        DEFAULT: '8px'
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(11, 31, 58, 0.06)',
        'card': '0 1px 3px rgba(0,0,0,0.08)'
      }
    },
  },
  plugins: [],
};
