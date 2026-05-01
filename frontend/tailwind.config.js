/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Dark mode: deep navy/charcoal ──
        dark: {
          DEFAULT: '#0d1117',    // GitHub-inspired deep dark
          lighter: '#161b22',    // Slightly lighter panels
          card: '#1c2333',       // Card backgrounds in dark mode
        },
        // ── Light mode: warm slate (not pure white) ──
        light: {
          DEFAULT: '#f0f2f5',    // Warm gray — professional, not blinding
          darker: '#e4e7ec',     // Slightly darker areas
          card: '#ffffff',       // Pure white only for card surfaces
        },
        // ── Brand colors ──
        primary:  '#3b82f6',     // Electric Blue
        accent:   '#06d6a0',     // Teal/Mint accent
        warning:  '#f59e0b',     // Amber
        danger:   '#ef4444',     // Red
      },
      // ── Custom keyframe animations ──
      animation: {
        'fade-in':       'fadeIn 0.5s ease-out',
        'slide-up':      'slideUp 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'zoom-in':       'zoomIn 0.3s ease-out',
        'bounce-soft':   'bounceSoft 2s ease-in-out infinite',
        'glow-pulse':    'glowPulse 2.5s ease-in-out infinite',
        'float':         'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'gradient-x':    'gradientX 4s ease infinite',
        'shimmer':       'shimmer 2s linear infinite',
        'spin-slow':     'spin 10s linear infinite',
        'ticker':        'ticker 25s linear infinite',
        'ping-slow':     'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        fadeIn:       { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp:      { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        slideInLeft:  { '0%': { opacity: 0, transform: 'translateX(-20px)' }, '100%': { opacity: 1, transform: 'translateX(0)' } },
        zoomIn:       { '0%': { opacity: 0, transform: 'scale(0.9)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
        bounceSoft:   { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        glowPulse:    { '0%,100%': { boxShadow: '0 0 20px rgba(59,130,246,0.3)' }, '50%': { boxShadow: '0 0 50px rgba(59,130,246,0.7)' } },
        float:        { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-18px)' } },
        gradientX:    { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        shimmer:      { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        ticker:       { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
      },
      // ── Font families ──
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      // ── Box shadows ──
      boxShadow: {
        'glow-sm':  '0 0 15px rgba(59,130,246,0.3)',
        'glow':     '0 0 30px rgba(59,130,246,0.4)',
        'glow-lg':  '0 0 60px rgba(59,130,246,0.5)',
        'glow-accent': '0 0 30px rgba(6,214,160,0.4)',
        'card':     '0 8px 32px -8px rgba(0,0,0,0.12)',
        'card-hover': '0 20px 60px -12px rgba(0,0,0,0.2)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      // ── Backdrop blur ──
      backdropBlur: {
        xs: '2px',
      },
      // ── Background sizes ──
      backgroundSize: {
        '200': '200% 200%',
        '400': '400% 400%',
      },
    },
  },
  plugins: [],
}
