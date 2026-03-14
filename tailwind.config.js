/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669',
        },
        teal: {
          50: '#f0fdfa',
          500: '#14b8a6',
          600: '#0d9488',
        },
        amber: {
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        'grotesk': ['"Space Grotesk"', 'ui-sans-serif', 'system-ui'],
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}

