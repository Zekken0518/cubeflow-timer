module.exports = {
  content: ['./index.html', './CUBE Timer.html', './assets/offline.js'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: { oled: { bg: '#050507', card: '#0d0e14', elevated: '#151722', border: '#222638' } },
    },
  },
};
