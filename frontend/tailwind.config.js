/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lime: {
          DEFAULT: '#d4ff3a',
          400: '#e2ff66',
          500: '#d4ff3a',
          600: '#b8e61e',
        },
        surface: {
          light: '#f7f7f5',
          card: '#ffffff',
          dark: '#0c0d0e',
          darkCard: '#151619',
          darkBorder: '#23252a'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Outfit', 'Space Grotesk', 'sans-serif']
      },
      boxShadow: {
        'polaroid': '0 20px 40px -15px rgba(0,0,0,0.12), 0 0 1px 1px rgba(0,0,0,0.05)',
        'polaroid-hover': '0 30px 60px -15px rgba(0,0,0,0.22), 0 0 1px 1px rgba(0,0,0,0.08)',
        'glow-lime': '0 0 35px -5px rgba(212, 255, 58, 0.45)',
        'dock': '0 12px 32px rgba(0, 0, 0, 0.16), 0 2px 6px rgba(0,0,0,0.08)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-reverse': 'floatRev 7s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1.5deg)' },
        },
        floatRev: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(12px) rotate(-1.5deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
