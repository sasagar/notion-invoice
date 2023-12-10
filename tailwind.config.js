/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx,css}',
  ],
  theme: {
    extend: {
      screens: {
        print: { raw: 'print' },
      },
      colors: {
        'kent-blue': {
          '50': '#f0f6fa',
          '100': '#dce8f2',
          '200': '#afc7e0',
          '300': '#85a2cc',
          '400': '#425fa8',
          '500': '#112382',
          '600': '#0e1f75',
          '700': '#0a1761',
          '800': '#06104f',
          '900': '#040a3b',
          '950': '#020526'
        }
      }
      //   backgroundImage: {
      //     'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      //     'gradient-conic':
      //       'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      //   },
      // },
    },
    plugins: [],
  }
}
