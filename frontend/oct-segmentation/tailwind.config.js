/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Khai báo bộ màu medical để dùng trong code React
        medical: {
          bg: 'var(--bg-primary)',
          card: 'var(--bg-secondary)',
          hover: 'var(--bg-hover)',
          text: 'var(--text-primary)',
          subtext: 'var(--text-secondary)',
          accent: 'var(--accent-color)',
          border: 'var(--border-color)',
        }
      },
      animation: {
        'scan': 'scan 3s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        }
      }
    },
  },
  plugins: [],
}