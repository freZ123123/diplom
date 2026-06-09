/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#22c55e',
          light: '#4ade80',
          dark: '#16a34a'
        },
        surface: {
          DEFAULT: '#0d0d0d',
          card: '#1a1a1a',
          elevated: '#242424',
          hover: '#2a2a2a'
        },
        border: '#333333'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    }
  },
  plugins: []
}
