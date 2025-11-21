/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#04060c",
          soft: "#0a0f1e",
          card: "rgba(9, 12, 24, 0.85)",
        },
        foreground: "#f6f7fb",
        accent: {
          DEFAULT: "#9d7bff",
          bright: "#b58dff",
          neon: "#46f0ff",
        },
        border: {
          DEFAULT: "#22273d",
          glow: "rgba(157, 123, 255, 0.6)",
        },
        muted: "#8d95b5",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(157, 123, 255, 0.35)",
        card: "0 30px 80px rgba(5, 6, 12, 0.75)",
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at 20% 20%, rgba(157,123,255,0.35), transparent 45%), radial-gradient(circle at 80% 0%, rgba(70,240,255,0.3), transparent 40%), radial-gradient(circle at 50% 80%, rgba(157,123,255,0.45), transparent 50%)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease",
        "slide-up": "slideUp 0.7s ease-out",
        "slow-pulse": "slowPulse 8s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(24px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slowPulse: {
          "0%, 100%": { opacity: "0.7", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
      },
    },
  },
  plugins: [],
};
