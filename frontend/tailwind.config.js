/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{vue,js,ts,jsx,tsx}", // Asegura que escanee archivos Vue/JS
    ],
    theme: {
      extend: {},
    },
    plugins: [
       require('@tailwindcss/forms'), 
    ],
  }