/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{vue,js,ts,jsx,tsx}", // Asegura que escanee archivos Vue/JS
    ],
    darkMode: 'class', // Habilitar darkMode con la clase 'dark'
    theme: {
      extend: {
        colors: {
          'primary': {
            DEFAULT: '#1A3064',  // Dark blue from "Health" text
            'light': '#2A4075',
            'dark': '#15254D'  // Ajustado para mejor visibilidad en modo oscuro
          },
          'secondary': {
            DEFAULT: '#00C7A0',  // Teal from "Flow" text
            'light': '#39DABD',
            'dark': '#00A286'  // Ajustado para mejor visibilidad en modo oscuro
          },
          'accent': {
            DEFAULT: '#19E8B5',  // Green from the wave
            'light': '#45F5C7',
            'dark': '#16C99D'  // Ajustado para mejor visibilidad en modo oscuro
          },
          'navy': '#1A2A47',      // Dark navy for text
          'wave': {
            'blue': '#0F5FA3',    // Start of wave
            'teal': '#00C7A0',    // Middle of wave
            'green': '#19E8B5'    // End of wave
          }
        },
        backgroundColor: {
          dark: '#1A1A2E',          // Azul oscuro más profesional
          'dark-surface': '#232335', // Superficie con un toque más azulado (más oscuro)
          'dark-elevated': '#2E2E48', // Elementos elevados con mejor contraste
          'dark-card': '#282840',    // Color para tarjetas más visibles
          'dark-button': '#353555',  // Color para botones
          'dark-accent': '#3E5686',  // Color acento azulado
          'dark-success': '#2A6B60', // Color para elementos de éxito
          'dark-warning': '#8A5F2D', // Color para elementos de advertencia
          'dark-danger': '#7A3333'   // Color para elementos de peligro
        },
        textColor: {
          'dark-primary': '#FFFFFF',  // Texto principal más brillante para mayor contraste
          'dark-secondary': '#C8D1F7', // Texto secundario más brillante y azulado
          'dark-muted': '#8A97C9',    // Texto de menor importancia pero aún legible
          'dark-heading': '#F0F4FF',   // Color especial para encabezados
          'dark-success': '#A1F0C8',   // Color para texto de éxito
          'dark-warning': '#FFE0A3',   // Color para texto de advertencia
          'dark-danger': '#FFB8B8'     // Color para texto de peligro
        },
        borderColor: {
          'dark-border': '#3D3D5C',  // Bordes más visibles para elementos en modo oscuro
          'dark-border-light': '#4A4A6A', // Bordes más claros
          'dark-border-accent': '#375592', // Bordes con acento azul
          'dark-border-success': '#2C9F80', // Bordes de éxito
          'dark-border-warning': '#BE8B3E', // Bordes de advertencia 
          'dark-border-danger': '#B94D4D'  // Bordes de peligro
        },
        // Sombras específicas para modo oscuro
        boxShadow: {
          'dark-sm': '0 2px 4px 0 rgba(0, 0, 0, 0.3)',
          'dark': '0 4px 8px -1px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.45)',
          'dark-md': '0 6px 12px -1px rgba(0, 0, 0, 0.6), 0 3px 8px -1px rgba(0, 0, 0, 0.55)',
          'dark-card': '0 4px 16px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        },
        // Bordes redondeados específicos
        borderRadius: {
          'card': '0.75rem'
        }
      },
    },
    plugins: [
       require('@tailwindcss/forms'), 
    ],
  }