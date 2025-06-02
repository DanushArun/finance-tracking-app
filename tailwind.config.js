/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Marske', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
        heading: ['Voyager Grotesque', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      colors: {
        // You can define your app-specific color palette here,
        // inspired by the Figma design, for easier reuse.
        'brand-purple': '#6B46C1', // Example purple
        'brand-blue': '#3B82F6',   // Example blue
        'dark-bg': '#111827',     // Example dark background
        'dark-card': '#1F2937',   // Example dark card background
      },
      // Add other theme extensions if needed
    },
  },
  plugins: [],
}
