/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'bg-main': 'rgb(var(--color-bg-main) / <alpha-value>)',
        'bg-sub': 'rgb(var(--color-bg-sub) / <alpha-value>)',
        'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
        'accent': 'rgb(var(--color-accent) / <alpha-value>)',
        'accent-sub': 'rgb(var(--color-accent-sub) / <alpha-value>)',
        'border': 'rgb(var(--color-border) / <alpha-value>)',
        'hover': 'rgb(var(--color-hover) / <alpha-value>)',
        'success': 'rgb(var(--color-success) / <alpha-value>)',
        'brand-black': 'rgb(var(--color-brand-black) / <alpha-value>)',
        'brand-white': 'rgb(var(--color-brand-white) / <alpha-value>)',
      },
      fontFamily: {
        // 中文字体统一为思源宋体
        'serif-cn': ['Noto Serif SC', 'serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      screens: {
        'mobile': { 'max': '767px' },
        'tablet': { 'min': '768px', 'max': '1024px' },
        'desktop': { 'min': '1025px' },
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(174, 219, 252, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(174, 219, 252, 0.6)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
