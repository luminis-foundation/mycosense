/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        myco: {
          soil:    '#1a1208',
          bark:    '#2d1f0e',
          moss:    '#1e2d1a',
          spore:   '#4a7c59',
          mycel:   '#a8c5a0',
          pulse:   '#7fff7a',
          amber:   '#e8a838',
          alert:   '#e05c3a',
          mist:    '#c8d8c4',
          ink:     '#0d1a0b',
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
        body:    ['"Inter"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flicker': 'flicker 4s ease-in-out infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.85 },
        }
      }
    }
  },
  plugins: []
}
