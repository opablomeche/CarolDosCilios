/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:       '#060606',
        surface:  { 1: '#0f0f0f', 2: '#161616', 3: '#1e1e1e' },
        border:   { DEFAULT: '#252525', subtle: '#181818' },
        white:    '#ffffff',
        cream:    '#f0ebe0',
        muted:    { DEFAULT: '#5a5a5a', light: '#888888' },
        gold:     { DEFAULT: '#c8a96e', dim: '#8a7248' },
        cold:     '#4a7ab8',
        warm:     '#b87a4a',
        'active-bg':      '#0f2a0f',
        'active-text':    '#5ab85a',
        'active-border':  '#2a5a2a',
        'paused-bg':      '#2a0f0f',
        'paused-text':    '#b85a5a',
        'paused-border':  '#5a2a2a',
        'accent-blue':    '#4a7ab8',
        'accent-blue-bg': '#0f1e2e',
        'accent-teal':    '#3a8a7a',
        'accent-teal-bg': '#0f2220',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: '6px', badge: '3px' },
      boxShadow:    { elevated: '0 2px 16px rgba(0,0,0,0.5)' },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.3' },
        },
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up':   'fade-up 0.45s ease forwards',
        'pulse-dot': 'pulse-dot 1.8s ease infinite',
        shimmer:     'shimmer 1.6s ease infinite',
      },
    },
  },
  plugins: [],
}
