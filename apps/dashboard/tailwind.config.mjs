/** @type {import('tailwindcss').Config} */
import { fontFamily } from 'tailwindcss/defaultTheme';

const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    // If you use components from the ui package, add its path too:
    // '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', ...fontFamily.sans],
        mono: ['var(--font-geist-mono)', ...fontFamily.mono],
        'just-sans': ['"JUST Sans"', ...fontFamily.sans], // Add JUST Sans
      },
      borderRadius: {
        '3xl': '1.5rem', // Ensure 3xl is defined if not default
      },
      // Add other theme extensions if needed
    },
  },
  plugins: [],
  darkMode: 'class', // Or 'media' based on your setup
};

export default config;
