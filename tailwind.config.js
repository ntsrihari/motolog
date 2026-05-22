/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#0D0D0D',
        surface1: 'rgba(255,255,255,0.06)',
        surface2: 'rgba(255,255,255,0.10)',
        accent: '#E8FF3A',
        'accent-light': '#F0FF7A',
        'accent-dark': '#1A6F00',
        blue: '#3A8DFF',
        danger: '#FF4D4D',
        success: '#2ECC71',
        warning: '#F59E0B',
        'text-primary': '#F5F5F5',
        'text-secondary': '#9A9A9A',
        'text-muted': '#5A5A5A',
        border: 'rgba(255,255,255,0.12)',
      },
      borderRadius: {
        card: '20px',
        inner: '14px',
        pill: '50px',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
