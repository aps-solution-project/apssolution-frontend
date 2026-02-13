/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/hooks/**/*.{js,jsx}",
    "./src/lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      // 🌟 여기에 애니메이션 정의 추가
      animation: {
        "ping-slow": "ping 7s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      // 필요하다면 확산 크기(scale)를 조절하기 위해 keyframes도 확장 가능
      keyframes: {
        ping: {
          "75%, 100%": {
            transform: "scale(1.5)", // 너무 크게 퍼지지 않도록 1.5배로 제한
            opacity: "0",
          },
        },
      },
    },
  },
  plugins: [],
};
