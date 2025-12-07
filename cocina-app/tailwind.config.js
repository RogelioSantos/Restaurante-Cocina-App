/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Dark theme for kitchen environment
        kitchen: {
          bg: '#0F172A',        // Deep dark background
          surface: '#1E293B',   // Card background
          border: '#334155',    // Borders
        },
        // Order status colors
        status: {
          queue: {
            light: '#FEF3C7',
            DEFAULT: '#F59E0B',
            dark: '#D97706',
          },
          preparing: {
            light: '#DBEAFE',
            DEFAULT: '#3B82F6',
            dark: '#2563EB',
          },
          ready: {
            light: '#D1FAE5',
            DEFAULT: '#10B981',
            dark: '#059669',
          },
        },
        // Priority/urgency colors
        priority: {
          normal: '#3B82F6',
          warning: '#F59E0B',
          urgent: '#EF4444',
        },
      },
    },
  },
  plugins: [],
}