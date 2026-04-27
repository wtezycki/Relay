/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ember: '#d95d39',
        pine: '#204b57',
        cream: '#f7f1e3',
        ink: '#1f2933',
        moss: '#5b7c64',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 20px 45px rgba(31, 41, 51, 0.12)',
      },
    },
  },
  plugins: [],
}
