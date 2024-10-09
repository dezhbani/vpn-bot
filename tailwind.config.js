/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
          animation: {
            'spin-slow': 'spin 5s linear infinite',
          },
          colors: {
            'main-blue': '#0095FF',
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