/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'bg-main': '#FEFFFF',
        'bg-sub': '#F4F6FA',
        'text-primary': '#1a1a2e',
        'text-secondary': '#6b6b7b',
        'accent': '#AEDBFC',
        'accent-sub': '#C8E0F4',
        'border': '#C4BAD2',
        'hover': '#EAC9C4',
        'success': '#a8d8b9',
        'brand-black': '#000000',
        'brand-white': '#FFFFFF',
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
