/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF3B5C",
        secondary: "#7B2FF7",
        tertiary: "#FF6A4D",
        dark: "#1C1C1E",
        light: "#F5F5F7",
        rw: {
          pink: "#FF3B5C",
          rose: "#FF3B5C",
          purple: "#7B2FF7",
          orange: "#FF6A4D",
          dark: "#1C1C1E",
          glass: "rgba(255, 255, 255, 0.15)",
          glassInner: "rgba(255, 255, 255, 0.25)",
          text: {
            soft: "#4B4B4F",
            deep: "#1C1C1E",
          }
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-primary": "linear-gradient(135deg, #FF3B5C, #7B2FF7)",
        "gradient-cta": "linear-gradient(135deg, #FF3B5C, #FF6A4D)",
        "gradient-secondary": "linear-gradient(135deg, #7B2FF7, #FF3B5C)",
        "gradient-dark": "linear-gradient(135deg, #1C1C1E, #2C2C2E)",
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      animation: {
        'heartbeat': 'heartbeat 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.05)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        }
      }
    },
  },
  plugins: [],
};
