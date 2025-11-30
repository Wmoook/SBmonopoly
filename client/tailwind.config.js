/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'monopoly-brown': '#8B4513',
        'monopoly-lightblue': '#87CEEB',
        'monopoly-pink': '#FF69B4',
        'monopoly-orange': '#FFA500',
        'monopoly-red': '#FF0000',
        'monopoly-yellow': '#FFFF00',
        'monopoly-green': '#008000',
        'monopoly-darkblue': '#00008B',
        'monopoly-railroad': '#000000',
        'monopoly-utility': '#808080',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-fast': 'pulse 0.5s infinite',
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
}
