export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'bounce-smooth': {
          '0%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'bounce-smooth': 'bounce-smooth 1s infinite ease-in-out',
      },
      fontFamily: {
        sans: ['IBM Plex Sans Thai', 'sans-serif'],
      },
      colors: {
        blue: {
          50: '#EFE5FD',
          100: '#D4BFF9',
          200: '#B794F6',
          300: '#9965F4',
          400: '#7E3FF2',
          500: '#6002EE',
          600: '#5300E8',
          700: '#3D00E0',
          800: '#1C00DB',
          900: '#0000D6',
        },
        purple: {
          50: '#FBE9FE',
          100: '#F3C7FD',
          200: '#EDA0FE',
          300: '#E278FA',
          400: '#D75AF2',
          500: '#CC3EEA',
          600: '#BB3BE3',
          700: '#A436DB',
          800: '#9132D3',
          900: '#6C2CC6',
        },
        green: {
          50: '#F8FDE9',
          100: '#EEF8C9',
          200: '#E3F5A6',
          300: '#D8F183',
          400: '#CFEC67',
          500: '#C8E84D',
          600: '#BCD646',
          700: '#ACBF3D',
          800: '#9CA834',
          900: '#828125',
        },
        black: {
          50: '#FEFCFA',
          100: '#F9F7F5',
          200: '#F4F3F0',
          300: '#EFEEEB',
          400: '#CECDCA',
          500: '#B1B0AD',
          600: '#868583',
          700: '#71706E',
          800: '#51504E',
          900: '#2F2E2C',
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-none': {
          'scrollbar-width': 'none',
          '-ms-overflow-style': 'none',
        },
        '.scrollbar-none::-webkit-scrollbar': {
          display: 'none',
        },
      });
    },
  ],
};
