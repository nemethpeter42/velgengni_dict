import type { Config } from 'tailwindcss'
import * as flowbytePlugin from "flowbite/plugin"
export default {
  content: [ 
    "./src/**/*.{vue,js,ts,jsx,tsx}", 
    'node_modules/flowbite/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
  //  flowbytePlugin,
  ],
  darkMode: 'class',
} satisfies Config

