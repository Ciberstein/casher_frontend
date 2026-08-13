/**
 * Casher — sistema "Comprobante".
 *
 * La interfaz está impresa: tinta sobre papel. El color cromático solo aparece
 * donde el dinero se mueve (entrada / salida / espera) o donde la marca firma
 * algo (sello). Todo lo demás es tinta, papel y línea.
 *
 * Los tokens semánticos viven en src/index.css como triples RGB y se invierten
 * solos en modo oscuro. Las escalas `slate` / `neutral` / `emerald` están
 * reasignadas a las rampas de papel / tinta / sello para que las utilidades ya
 * escritas en la app hablen el nuevo idioma sin reescribirlas una por una.
 */

const token = (name) => `rgb(var(${name}) / <alpha-value>)`

export default {
  mode: 'jit',
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Superficies
        canvas:  token('--c-canvas'),
        surface: token('--c-surface'),
        sunken:  token('--c-sunken'),
        raised:  token('--c-raised'),

        // Trazo
        line:    token('--c-line'),
        rule:    token('--c-rule'),

        // Tinta
        ink:     token('--c-ink'),
        muted:   token('--c-muted'),
        faint:   token('--c-faint'),
        reverse: token('--c-reverse'),

        // Sello: la firma de la marca
        sello: {
          DEFAULT: token('--c-sello'),
          ink:     token('--c-sello-ink'),
          soft:    token('--c-sello-soft'),
        },

        // Dirección del dinero
        entrada: { DEFAULT: token('--c-entrada'), soft: token('--c-entrada-soft') },
        salida:  { DEFAULT: token('--c-salida'),  soft: token('--c-salida-soft')  },
        espera:  { DEFAULT: token('--c-espera'),  soft: token('--c-espera-soft')  },

        // Rampa papel (reasigna `slate`)
        slate: {
          50:  '#F7F5F0',
          100: '#F0EDE5',
          200: '#E3DFD5',
          300: '#CFC9BB',
          400: '#A9A192',
          500: '#8B8375',
          600: '#6B6357',
          700: '#4F493F',
          800: '#33302A',
          900: '#1E1D19',
          950: '#121110',
        },

        // Rampa tinta (reasigna `neutral`)
        neutral: {
          50:  '#F2F3F4',
          100: '#E4E6E9',
          200: '#CBCFD5',
          300: '#A6ACB6',
          400: '#7A8290',
          500: '#545B67',
          600: '#3B404A',
          700: '#2C313A',
          800: '#22252C',
          900: '#171A1F',
          950: '#0E1013',
        },

        // Rampa sello (reasigna `emerald`)
        emerald: {
          50:  '#FDF4EA',
          100: '#FAE4CB',
          200: '#F4C695',
          300: '#EDA55E',
          400: '#E28833',
          500: '#D2690A',
          600: '#A94F04',
          700: '#853E05',
          800: '#66300A',
          900: '#4A250C',
          950: '#2A1305',
        },
      },

      fontFamily: {
        sans: ['Archivo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },

      letterSpacing: {
        stamp: '0.14em',
      },

      // El documento no es burbujeante: radios cortos y consistentes.
      borderRadius: {
        none: '0',
        sm:   '0.125rem',
        DEFAULT: '0.25rem',
        md:   '0.25rem',
        lg:   '0.375rem',
        xl:   '0.5rem',
        '2xl': '0.625rem',
        '3xl': '0.875rem',
        full: '9999px',
      },

      boxShadow: {
        // Sombras de imprenta: contorno nítido, casi sin difuminado.
        sm:   '0 1px 0 0 rgb(var(--c-rule) / 0.7)',
        DEFAULT: '0 1px 2px 0 rgb(var(--c-shadow) / 0.10)',
        md:   '0 2px 6px -2px rgb(var(--c-shadow) / 0.14)',
        lg:   '0 8px 20px -10px rgb(var(--c-shadow) / 0.24)',
        xl:   '0 14px 34px -14px rgb(var(--c-shadow) / 0.30)',
        '2xl':'0 24px 56px -20px rgb(var(--c-shadow) / 0.38)',
        stamp: '0 0 0 1px rgb(var(--c-line)), 0 1px 0 0 rgb(var(--c-rule))',
      },

      keyframes: {
        'print-in': {
          '0%':   { opacity: '0', transform: 'translateY(-0.35em)', clipPath: 'inset(0 0 100% 0)' },
          '100%': { opacity: '1', transform: 'translateY(0)',       clipPath: 'inset(0 0 0 0)' },
        },
        'feed-in': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'bar': {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(300%)' },
        },
        'stamp-in': {
          '0%':   { opacity: '0', transform: 'scale(1.18) rotate(-6deg)' },
          '60%':  { opacity: '1', transform: 'scale(0.97) rotate(-6deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(-6deg)' },
        },
      },
      animation: {
        'print-in': 'print-in 520ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'feed-in':  'feed-in 420ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'stamp-in': 'stamp-in 380ms cubic-bezier(0.34, 1.4, 0.64, 1) both',
        'bar':      'bar 1100ms cubic-bezier(0.65, 0, 0.35, 1) infinite',
      },
    },
  },
  plugins: [],
}
