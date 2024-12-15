/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-custom': 'linear-gradient(to bottom, #EDA529, #EE2B2B)',
        'gradient-svg': 'linear-gradient(to right, #89B30C, #6AB609)',
      }
    },
  },
  plugins: [],
}

