/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Argus brand colors from your logo
        'argus-navy': '#1e3a8a',      // Deep navy blue
        'argus-teal': '#14b8a6',      // Teal green
        'argus-orange': '#f59e0b',    // Orange accent
        'argus-light': '#f0f9ff',     // Light blue background
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
