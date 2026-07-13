import tailwindPlugin from 'prettier-plugin-tailwindcss';

/** @type {import("prettier").Config} */
const config = {
  plugins: [tailwindPlugin],
  singleQuote: true,
  trailingComma: 'all',
  semi: true,
  printWidth: 80,
  tabWidth: 2,
};

export default config;
