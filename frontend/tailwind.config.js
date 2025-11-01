/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
        display: ['Manrope', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
        body: ['Manrope', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f3fbf7',
          100: '#e2f5ec',
          200: '#c5ead9',
          300: '#9ad7bb',
          400: '#68bd99',
          500: '#3b9c7a',
          600: '#247b60',
          700: '#1b5f4c',
          800: '#154a3b',
          900: '#0f382e',
          950: '#08231d',
        },
        accent: {
          50: '#f7fafc',
          100: '#e8f1f6',
          200: '#cfe0ec',
          300: '#a8c7dd',
          400: '#77aac8',
          500: '#4d87ad',
          600: '#3f6f91',
          700: '#375a73',
          800: '#30495d',
          900: '#253746',
        },
        moss: {
          50: '#f7faf4',
          100: '#e7f0df',
          200: '#cfe1bf',
          300: '#a9cb93',
          400: '#7cab62',
          500: '#5d8c45',
          600: '#476e35',
          700: '#38542b',
          800: '#2f4326',
          900: '#273720',
        },
      },
    },
  },
  plugins: [],
}
