/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f6f7f8',
          100: '#eceef0',
          200: '#d5d9dd',
          300: '#b0b8bf',
          400: '#848f99',
          500: '#65727d',
          600: '#515b65',
          700: '#424a52',
          800: '#3a4047',
          900: '#1c2024',
          950: '#0e1012',
        },
        brand: {
          50: '#fbf7f0',
          100: '#f5ead6',
          200: '#ead0a8',
          300: '#ddb076',
          400: '#d29a52',
          500: '#c8843a',
          600: '#b06c2f',
          700: '#925428',
          800: '#764526',
          900: '#613a22',
        },
        accent: {
          50: '#eef7f4',
          100: '#d6ece4',
          200: '#aed8ca',
          300: '#7cc0ab',
          400: '#4fa88d',
          500: '#358c73',
          600: '#28705b',
          700: '#225a4a',
          800: '#1e483d',
          900: '#193c33',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'scale-in': 'scale-in 0.25s ease-out',
        'marquee': 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
};
