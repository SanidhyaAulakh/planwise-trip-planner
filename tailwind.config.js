export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      borderColor: {
        gradient:
          "conic-gradient(from 0deg, #f87171, #fb923c, #facc15, #f87171)",
      },
      colors: {
        primary: "#2563eb", // blue-600 or any color you picked
      },
    },
  },
  plugins: [],
};
