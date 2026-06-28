import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E40AF',
        'sky-accent': '#0EA5E9',
        'dark-slate': '#1E293B',
        'muted-gray': '#94A3B8',
        danger: '#DC2626',
        warning: '#D97706',
        success: '#059669',
        bg: '#F8FAFC',
      },
    },
  },
  plugins: [],
} satisfies Config
