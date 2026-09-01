import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F1F0EA',
        panel: '#FBFAF6',
        ink: '#1E1C18',
        line: '#D9D6C9',
        muted: '#736F63',
        available: '#2F5D3A',
        reserved: '#B8862C',
        sold: '#9A3324',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        none: '0px',
        tag: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
