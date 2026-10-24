import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        // 白烬山口 palette: ink night, walnut, brass, parchment, frost, white-fire, wax seal
        ink: { DEFAULT: '#0a0d12', 800: '#10151c', 700: '#171e27', 600: '#212a35' },
        wood: { DEFAULT: '#24180f', light: '#3a281a', dark: '#140d08' },
        brass: { DEFAULT: '#b4935a', light: '#dcc08a', dim: '#6f5a36' },
        parchment: { DEFAULT: '#e8dcc0', dim: '#b9aa86', dark: '#8a7a58' },
        frost: { DEFAULT: '#d6e3ec', dim: '#8ea2b2', deep: '#4a5d6e' },
        pyre: { DEFAULT: '#a8e6f0', soft: '#7cc7d6', dim: '#3d7480' },
        seal: { DEFAULT: '#8e2a2a', light: '#b84a4a', dark: '#5a1616' },
        ember: {
          50: '#fef3c7',
          100: '#fde68a',
          200: '#fcd34d',
          300: '#fbbf24',
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
        ash: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        cinzel: ['var(--font-cinzel)', 'var(--font-noto-serif-sc)', 'Noto Serif SC', 'serif'],
        latin: ['var(--font-cormorant)', 'var(--font-noto-serif-sc)', 'Georgia', 'serif'],
        serif: ['var(--font-noto-serif-sc)', 'Noto Serif SC', 'Songti SC', 'serif'],
      },
      boxShadow: {
        'glow-amber': '0 0 20px rgba(251, 191, 36, 0.3), 0 0 40px rgba(251, 191, 36, 0.1)',
        'glow-red': '0 0 20px rgba(220, 38, 38, 0.3), 0 0 40px rgba(220, 38, 38, 0.1)',
        'inner-glow': 'inset 0 0 20px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out forwards',
        hearth: 'hearth 6s ease-in-out infinite',
        flicker: 'flicker 3.2s ease-in-out infinite',
        'speaker-glow': 'speakerGlow 2.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        hearth: {
          '0%, 100%': { opacity: '0.75', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.06)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '40%': { opacity: '0.82' },
          '43%': { opacity: '0.95' },
          '70%': { opacity: '0.88' },
        },
        speakerGlow: {
          '0%, 100%': { boxShadow: '0 0 0 1px rgba(220,192,138,0.55), 0 0 14px rgba(168,230,240,0.12)' },
          '50%': { boxShadow: '0 0 0 1px rgba(220,192,138,0.9), 0 0 22px rgba(168,230,240,0.28)' },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
