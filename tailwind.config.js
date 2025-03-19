/** @type {import('tailwindcss').Config} */
export default {
  mode: 'jit',
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-light': {
          500: '#FF7D0A'
        },
        'primary-dark': {
          500: '#FF7D0A'
        },
        'secondary-dark': {
          500: '#1C1C1D'
        }
      }
    },
  },
  plugins: [],
}

