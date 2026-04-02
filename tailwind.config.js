/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#C41E3A',
          dark: '#8B0000',
          light: '#E8334A',
          50: '#FFF0F2',
          100: '#FFE0E4',
          200: '#FFC0C8',
          300: '#FF8090',
          400: '#E8334A',
          500: '#C41E3A',
          600: '#A01830',
          700: '#8B0000',
          800: '#6B0000',
          900: '#4A0000',
        },
        accent: {
          DEFAULT: '#F5C518',
          dark: '#D4A017',
          light: '#FFD84D',
        },
        surface: '#FFF8F8',
        'surface-2': '#FFF0F0',
        border: '#F0E0E0',
        muted: '#6B7280',
        dark: '#1A0A0A',
      },
      animation: {
        'fadeInUp': 'fadeInUp 0.7s cubic-bezier(0.4,0,0.2,1) both',
        'scaleIn': 'scaleIn 0.6s cubic-bezier(0.4,0,0.2,1) both',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'slideInDown': 'slideInDown 0.5s ease both',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(32px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        slideInDown: {
          from: { opacity: '0', transform: 'translateY(-20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'primary-sm': '0 4px 16px rgba(196, 30, 58, 0.2)',
        'primary-md': '0 8px 32px rgba(196, 30, 58, 0.25)',
        'primary-lg': '0 16px 48px rgba(196, 30, 58, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 20px 48px rgba(196, 30, 58, 0.15)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, rgba(196,30,58,0.85) 0%, rgba(139,0,0,0.65) 40%, rgba(26,10,10,0.55) 100%)',
        'accent-gradient': 'linear-gradient(135deg, #F5C518, #D4A017)',
        'primary-gradient': 'linear-gradient(135deg, #C41E3A, #8B0000)',
        'section-gradient': 'linear-gradient(180deg, #FFF8F8 0%, #FFFFFF 100%)',
      },
    },
  },
  plugins: [],
};