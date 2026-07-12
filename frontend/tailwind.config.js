/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060B18',
          900: '#0B1120',
          850: '#111827',
          800: '#1A2332',
          700: '#2E3B4E',
          600: '#475569'
        },
        brand: {
          blue: '#3B82F6',
          green: '#10B981',
          amber: '#F59E0B',
          red: '#EF4444',
          purple: '#8B5CF6'
        }
      }
    },
  },
  plugins: [],
}
