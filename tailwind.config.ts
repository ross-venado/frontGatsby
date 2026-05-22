import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17202a',
        maize: '#f6b73c',
        jade: '#0f8b6f',
        clay: '#b85c38',
      },
      boxShadow: {
        soft: '0 14px 40px rgba(23, 32, 42, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
