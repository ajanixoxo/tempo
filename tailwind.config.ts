import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        tempo: {
          bg: '#080809',
          panel: '#0e0e11',
          surface: '#151518',
          hover: '#1d1d22',
          hairline: '#202026',
          muted: '#71717a',
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        condensed: [
          'Impact',
          '"DIN Alternate"',
          '"Arial Narrow"',
          '"Helvetica Neue Condensed"',
          'sans-serif',
        ],
        impact: [
          'Impact',
          'Haettenschweiler',
          '"Arial Black"',
          '"Franklin Gothic Bold"',
          'sans-serif',
        ],
        serif: ['Georgia', '"Times New Roman"', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
