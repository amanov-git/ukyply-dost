/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  daisyui: {
    themes: [
      {
        'custom-theme': {
          'primary': '#0000ff',
          'secondary': '#1E293B',
        },
      }
    ],
  },
  theme: {
    extend: {
      colors: {
        'first-dark-bg-color': '#111827',
        'second-dark-bg-color': '#1f2937',
        'second-light-bg-color': 'rgb(241 245 249)',
        ...defaultTheme.colors,
      },
      screens: {
        // xs: '400px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [require("daisyui"), require("tailwind-scrollbar")],
};