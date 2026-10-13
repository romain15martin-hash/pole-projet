import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cs: {
          pink: '#D6226B',
          'pink-hover': '#E8317D',
          dark: '#070B19',
          surface: '#0E162E',
          'surface-light': '#141F3E',
          border: '#1E2B52',
          muted: '#94A3B8',
          light: '#F1F5F9'
        },
        theme: {
          soirees: '#F43F5E',
          culture: '#F59E0B',
          art: '#8B5CF6',
          sports: '#10B981'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif']
      }
    }
  }
}
