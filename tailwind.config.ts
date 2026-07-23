import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#2b2a28',
        'ink-dim': '#6b675f',
        paper: '#faf9f7',
        'paper-raised': '#ffffff',
        frame: '#f1efea',
        block: '#e7e4dd',
        'block-strong': '#dad6cc',
        border: '#c9c4b8',
        // Oficiální paleta klienta (Coolors export): f7aa15-ea8b0a-d97110-9c3415-59211b-391413.
        // 400–900 jsou přesné hodnoty z palety, 50–300 jsou dogenerované světlejší odstíny
        // pro pozadí/tinty ve stejné barevné rodině.
        honey: {
          50: '#fef8ec',
          100: '#fceecb',
          200: '#f8dc98',
          300: '#f9c65c',
          400: '#f7aa15',
          500: '#ea8b0a',
          600: '#d97110',
          700: '#9c3415',
          800: '#59211b',
          900: '#391413',
        },
        // Tlumená tmavá hnědá pro .section-dark - záměrně jiná (méně sytá) než
        // honey-800/900, aby tmavé sekce nepůsobily křiklavě vedle zbytku palety.
        coffee: '#332821',
        good: '#3f6b45',
        'good-bg': '#e4efe3',
        bad: '#96392c',
        'bad-bg': '#f4e4df',
        // Minor natural accent (nature/bees/flowers) — used sparingly, never dominant.
        leaf: {
          50: '#f2f6ea',
          100: '#e3ecd2',
          300: '#b7c98d',
          400: '#93aa64',
          500: '#748f49',
          600: '#5b7139',
        },
      },
      // Pozn.: NIKDY nepoužívat jednopísmenné klíče jako "s"/"l" - kolidují s
      // Tailwind vestavěnými směrovými utilitami (rounded-s = start/left strana,
      // rounded-l = levá strana), což dřív způsobovalo nesouměrně zaoblené rohy
      // (rounded-l/rounded-s se aplikovalo jen na levou stranu místo na všechny rohy).
      borderRadius: {
        sm: '8px',
        md: '16px',
        xl: '32px',
      },
      fontFamily: {
        sans: [
          'var(--font-body)',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Arial',
          'sans-serif',
        ],
      },
      maxWidth: {
        content: '1180px',
        hero: '1200px',
        header: '1440px',
      },
      boxShadow: {
        warm: '0 12px 30px -12px rgba(217, 113, 16, 0.32)',
      },
    },
  },
  plugins: [],
};

export default config;
