/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
      },
      colors: {
        cit: {
          blue: '#1E3A8A',
          azure: '#2563EB',
          sky: '#38BDF8',
          gold: '#F59E0B',
          navy: '#0A0F1D',
        }
      },
      boxShadow: {
        'glass': '0 20px 50px -12px rgba(0, 0, 0, 0.65), 0 0 25px rgba(37, 99, 235, 0.15)',
        'glass-hover': '0 25px 60px -10px rgba(0, 0, 0, 0.75), 0 0 35px rgba(56, 189, 248, 0.25)',
        'glow-primary': '0 0 25px -3px rgba(37, 99, 235, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
