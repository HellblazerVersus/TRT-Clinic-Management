/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        // Core palette — near black like Lamin/Vercel
        surface: {
          0:   '#050507',
          50:  '#0a0b0f',
          100: '#0f1014',
          200: '#14151a',
          300: '#1c1d23',
          400: '#242530',
          500: '#2e2f3d',
        },
        // Accent teal — pops against pure black
        teal: {
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
        // Status
        danger:  '#f87171',
        warning: '#fbbf24',
        ok:      '#34d399',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '0.8' },
        },
      },
      animation: {
        'fade-up':  'fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':  'fade-in 0.3s ease both',
        shimmer:    'shimmer 2s infinite linear',
        glow:       'glow 3s ease-in-out infinite',
      },
      fontFamily: {
        sans:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono:  ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(20,184,166,0.15), transparent)',
        'card-shine':  'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
