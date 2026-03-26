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
        navy: {
          950: '#070D15',
          900: '#0D1B2A',
          800: '#1B2838',
          700: '#243447',
          600: '#2E4156',
          500: '#3A5068',
        },
        accent: {
          DEFAULT: '#2D7DD2',
          light: '#4A9BE8',
          dark: '#1E5FA0',
        },
        success: {
          DEFAULT: '#06D6A0',
          dark: '#04A87E',
          light: '#34EDBB',
        },
        warning: {
          DEFAULT: '#FFB703',
          dark: '#CC9200',
          light: '#FFCB47',
        },
        danger: {
          DEFAULT: '#EF233C',
          dark: '#BF1C30',
          light: '#F4566A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-out-right': 'slideOutRight 0.3s ease-in',
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-out': 'fadeOut 0.2s ease-in',
        'scale-in': 'scaleIn 0.2s ease-out',
        'toast-in': 'toastIn 0.3s ease-out',
        'toast-out': 'toastOut 0.3s ease-in',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        toastIn: {
          '0%': { transform: 'translateY(-100%) translateX(-50%)', opacity: '0' },
          '100%': { transform: 'translateY(0) translateX(-50%)', opacity: '1' },
        },
        toastOut: {
          '0%': { transform: 'translateY(0) translateX(-50%)', opacity: '1' },
          '100%': { transform: 'translateY(-100%) translateX(-50%)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
