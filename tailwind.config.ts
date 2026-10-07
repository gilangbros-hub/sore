import type { Config } from 'tailwindcss';

// Tokens copied from the design handoff (Styles.dc.html). Extra keyframes
// (sway, now, breath, pulse, halo) come from the individual screen files.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: { 950: '#0F0C24', 900: '#15122E', 800: '#1E1940', 700: '#2A2353', 600: '#3A3270' },
        amber: { 300: '#F6C98F', 400: '#F0B067' },
        gold: { 300: '#E3C584' },
        ivory: { 50: '#F6EFE3' },
        mist: { 300: '#BDB4D3', 400: '#9D94BA' },
        coral: { 300: '#F4A28C' },
        plum: { 500: '#7A5FA8' },
        dusk: { 400: '#C9835A' },
        card: { face: '#F3E9D6' },
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      borderRadius: { field: '14px', tile: '16px', card: '20px', panel: '24px' },
      keyframes: {
        twinkle: { '0%,100%': { opacity: '.2' }, '50%': { opacity: '.95' } },
        glow: { '0%,100%': { opacity: '.75' }, '50%': { opacity: '1' } },
        rise: { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'none' } },
        trace: { from: { strokeDashoffset: '200' }, to: { strokeDashoffset: '0' } },
        'trace-loop': {
          '0%': { strokeDashoffset: '200', opacity: '.3' },
          '45%,85%': { strokeDashoffset: '0', opacity: '1' },
          '100%': { strokeDashoffset: '0', opacity: '.3' },
        },
        orb: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.05)' } },
        'orb-wait': { '0%,100%': { transform: 'scale(1)', opacity: '.85' }, '50%': { transform: 'scale(1.08)', opacity: '1' } },
        halo: { '0%,100%': { opacity: '.6', transform: 'scale(1)' }, '50%': { opacity: '1', transform: 'scale(1.08)' } },
        sway: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        breath: { '0%,100%': { transform: 'scale(.96)', opacity: '.55' }, '50%': { transform: 'scale(1.04)', opacity: '.9' } },
        now: { '0%,100%': { boxShadow: '0 0 0 0 rgba(240,176,103,.45)' }, '50%': { boxShadow: '0 0 0 8px rgba(240,176,103,0)' } },
        pulse: { '0%,100%': { opacity: '.55' }, '50%': { opacity: '1' } },
      },
      animation: {
        twinkle: 'twinkle 5.5s ease-in-out infinite',
        glow: 'glow 7s ease-in-out infinite',
        rise: 'rise .6s ease .25s both',
        trace: 'trace 1.6s ease-out both',
        'trace-loop': 'trace-loop 7s ease-in-out infinite both',
        orb: 'orb 8s ease-in-out infinite',
        'orb-wait': 'orb-wait 8s ease-in-out infinite',
        halo: 'halo 8s ease-in-out infinite',
        sway: 'sway 6s ease-in-out infinite',
        breath: 'breath 5s ease-in-out infinite',
        now: 'now 2.4s ease-in-out infinite',
        pulse: 'pulse 2.6s ease-in-out infinite',
      },
      transitionTimingFunction: { flip: 'cubic-bezier(.2,.7,.2,1)' },
    },
  },
  plugins: [],
};

export default config;
