/** Colours/fonts map to CSS variables in src/styles/tokens.css — change tokens there. */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        parchment: { light: v("c-parchment-light"), DEFAULT: v("c-parchment"), dark: v("c-parchment-dark") },
        sepia: v("c-sepia"),
        ink: v("c-ink"),
        brass: { DEFAULT: v("c-brass"), light: v("c-gold") },
        olive: { DEFAULT: v("c-olive"), dark: v("c-olive-dark") },
        sea: v("c-sea"),
        oxblood: v("c-oxblood"),
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
        note: "var(--font-note)",
      },
      boxShadow: {
        paper: "var(--shadow-paper)",
        lift: "var(--shadow-lift)",
        inset: "var(--shadow-inset)",
      },
    },
  },
  plugins: [],
};
