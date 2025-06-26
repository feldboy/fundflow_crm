/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'primary': '#1E40AF', // Deep blue (primary) - blue-800
        'secondary': '#64748B', // Professional slate gray (secondary) - slate-500
        'accent': '#0EA5E9', // Bright blue (accent) - sky-500
        
        // Background Colors
        'background': '#FAFAFA', // Warm off-white (background) - gray-50
        'surface': '#FFFFFF', // Pure white (surface) - white
        
        // Text Colors
        'text-primary': '#1E293B', // Dark slate (text primary) - slate-800
        'text-secondary': '#64748B', // Medium gray (text secondary) - slate-500
        
        // Status Colors
        'success': '#059669', // Professional green (success) - emerald-600
        'warning': '#D97706', // Amber orange (warning) - amber-600
        'error': '#DC2626', // Clear red (error) - red-600
        
        // Border Colors
        'border': '#E2E8F0', // Light gray (border) - slate-200
      },
      fontFamily: {
        'heading': ['Inter', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'caption': ['Inter', 'sans-serif'],
        'data': ['JetBrains Mono', 'monospace'],
      },
      fontWeight: {
        'normal': '400',
        'medium': '500',
        'semibold': '600',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'overlay': '0 10px 25px rgba(0, 0, 0, 0.15)',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
      },
      transitionTimingFunction: {
        'ease-out': 'ease-out',
        'ease-in-out': 'ease-in-out',
      },
      zIndex: {
        '1000': '1000',
        '1100': '1100',
        '1200': '1200',
        '1300': '1300',
      },
    },
  },
  plugins: [],
}