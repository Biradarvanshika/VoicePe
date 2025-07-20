// postcss.config.cjs
const postcssImport = require('postcss-import');
const tailwindNesting = require('tailwindcss/nesting');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

module.exports = {
  plugins: [
    postcssImport,
    tailwindNesting(),
    tailwindcss,
    autoprefixer,
  ],
};
