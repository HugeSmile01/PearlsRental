/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      colors: {
        cream: {
          DEFAULT: '#fff7e8',
          50: '#fffdf8',
          100: '#fff7e8',
          200: '#f9ecd2',
        },
        gold: {
          50: '#fefdf7',
          100: '#fdf9e3',
          200: '#faf0c0',
          300: '#f5e190',
          400: '#edcc58',
          500: '#e2b52e',
          600: '#c99520',
          700: '#a87219',
          800: '#895a1b',
          900: '#714b1a',
        },
        obsidian: {
          50: '#f5f5f5',
          100: '#e8e8e8',
          200: '#d1d1d1',
          300: '#ababab',
          400: '#7d7d7d',
          500: '#606060',
          600: '#4a4a4a',
          700: '#333333',
          800: '#1f1f1f',
          900: '#111111',
          950: '#080808',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        shimmer: 'shimmer 1.5s infinite',
        'pulse-gold': 'pulseGold 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(226, 181, 46, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(226, 181, 46, 0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
