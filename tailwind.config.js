/** @type {import('tailwindcss').Config} */

module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
          width: {
            '76': '19rem',
            '84': '21rem',
            '88': '22rem',
            '92': '23rem',
            '100': '25rem',
          },
          animation: {
            'spin-slow': 'spin 5s linear infinite',
            'marquee': 'marquee 3000ms linear infinite'
          },
          keyframes: {
            marquee: {
              '0%': { transform: 'translateX(0%)' },
              '100%': { transform: 'translateX(-100%)' },
            },
          },
          colors: {
            'main-blue': '#0095FF',
            'dark-blue': '#363853',
            'silver': 'silver'
          },
          fontFamily: {
            'iran-sans': ['iran-sans'],
            'b-kamran': ['b-kamran'],
            'outfit-semiBold': ['outfit-semiBold']
          },
          zIndex: {
            '60': '60',
            '70': '70',
            '80': '80',
            '90': '90'
          }
        },
    },
    plugins: [],
  }