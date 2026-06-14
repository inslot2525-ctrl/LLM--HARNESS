import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#000000",
        bone: "#ffffff",
        ash: "#bdbdbd",
        smoke: "#9a9a9a",
        plum: "#8052ff",
        amber: "#ffb829",
        lichen: "#15846e",
        /* Severity mapped to Dala palette */
        sev: {
          critical: "#ffb829",   /* Amber Spark */
          high:     "#8052ff",   /* Plum Voltage */
          medium:   "#ffffff",   /* Bone */
          low:      "#bdbdbd",   /* Ash */
          safe:     "#15846e",   /* Lichen */
        },
      },
      fontFamily: {
        sans:    ["var(--font-space-grotesk)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "Inter", "system-ui", "sans-serif"],
        mono:    ["var(--font-jetbrains-mono)", "Fira Code", "monospace"],
      },
      fontSize: {
        hero:    ["113px", { lineHeight: "0.81", letterSpacing: "-0.04em" }],
        display: ["78px",  { lineHeight: "0.9",  letterSpacing: "-0.04em" }],
        "heading-lg": ["48px", { lineHeight: "1.1",  letterSpacing: "-0.04em" }],
        heading:      ["36px", { lineHeight: "1.2",  letterSpacing: "0.021em" }],
        "heading-sm": ["24px", { lineHeight: "1.3",  letterSpacing: "0.021em" }],
        subheading:   ["18px", { lineHeight: "1.5",  letterSpacing: "0.025em" }],
        "body-sm":    ["14px", { lineHeight: "1.5",  letterSpacing: "0.05em" }],
        caption:      ["12px", { lineHeight: "1.5",  letterSpacing: "0.05em" }],
      },
      spacing: {
        "dala-1": "6px",
        "dala-2": "12px",
        "dala-3": "18px",
        "dala-4": "24px",
        "dala-5": "30px",
        "dala-6": "36px",
        "dala-10": "60px",
        "dala-16": "96px",
        "dala-20": "120px",
      },
      borderRadius: {
        pill: "24px",
        card: "16px",
        sm:   "8px",
      },
      maxWidth: {
        dala: "1200px",
      },
      animation: {
        "fade-up":   "fade-up 0.5s ease forwards",
        "fade-in":   "fade-in 0.4s ease forwards",
        "blink":     "blink 1.1s step-end infinite",
        "drift":     "drift 8s ease-in-out infinite",
        "pulse-dim": "pulse-dim 3s ease-in-out infinite",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        blink: {
          "0%, 49%":  { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        drift: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        "pulse-dim": {
          "0%, 100%": { opacity: "0.6" },
          "50%":      { opacity: "1" },
        },
      },
      boxShadow: {
        none: "none",
      },
    },
  },
  plugins: [],
};

export default config;
