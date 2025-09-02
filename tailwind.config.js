/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Sarabun', 'sans-serif'],
        heading: ['Kumar One', 'sans-serif'], // ตรวจสอบว่ามีบรรทัดนี้
      },
    },
  },
  plugins: [],
}