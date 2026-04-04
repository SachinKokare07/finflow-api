/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#07111f',
        panel: '#0d1b2a',
        panelAlt: '#12263a',
        line: 'rgba(148, 163, 184, 0.16)',
        mint: '#34d399',
        teal: '#2dd4bf',
        gold: '#fbbf24',
        coral: '#fb7185',
        sky: '#38bdf8',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(45, 212, 191, 0.16), 0 24px 80px rgba(2, 8, 23, 0.55)',
        soft: '0 16px 50px rgba(2, 8, 23, 0.35)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui'],
        body: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui'],
      },
      backgroundImage: {
        'hero-grid': 'radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.16) 1px, transparent 0)',
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        drift: 'drift 16s linear infinite',
        pulseGlow: 'pulseGlow 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        drift: {
          '0%': { transform: 'translateX(0px)' },
          '50%': { transform: 'translateX(18px)' },
          '100%': { transform: 'translateX(0px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.68' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};