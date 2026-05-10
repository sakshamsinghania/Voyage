/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "oklch(10% 0.008 60 / <alpha-value>)",
        ground: "oklch(15% 0.010 60 / <alpha-value>)",
        surface: "oklch(19% 0.010 60 / <alpha-value>)",
        rim: "oklch(24% 0.008 60 / <alpha-value>)",
        quiet: "oklch(64% 0.006 60 / <alpha-value>)",
        loud: "oklch(93% 0.006 60 / <alpha-value>)",
        amber: {
          DEFAULT: "oklch(74% 0.16 75 / <alpha-value>)",
          dim: "oklch(60% 0.13 75 / <alpha-value>)",
          deep: "oklch(45% 0.10 75 / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: [
          "IBM Plex Sans",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "IBM Plex Mono",
          "ui-monospace",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        label: ["0.6875rem", { lineHeight: "1", letterSpacing: "0.06em" }],
        meta: ["0.75rem", { lineHeight: "1.2", letterSpacing: "0.03em" }],
        body: ["0.9375rem", { lineHeight: "1.65" }],
        title: ["1.0625rem", { lineHeight: "1.3", letterSpacing: "-0.005em" }],
        head: ["1.5rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      transitionTimingFunction: {
        expo: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        120: "120ms",
        200: "200ms",
      },
      boxShadow: {
        float: "0 4px 24px oklch(5% 0.005 60 / 0.6)",
      },
    },
  },
  plugins: [],
};
