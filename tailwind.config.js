/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 나중에 학교 전용 색상을 추가하고 싶다면 여기서 수정할 수 있습니다.
    },
  },
  plugins: [],
}