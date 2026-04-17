import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta del proyecto
        primary: {
          50:  '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        fasting: {
          bg:   '#f3f4f6',
          text: '#9ca3af',
        },
      },
    },
  },
  plugins: [],
};

export default config;
