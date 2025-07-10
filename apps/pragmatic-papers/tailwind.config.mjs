/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import tailwindcssAnimate from 'tailwindcss-animate'
import typography from '@tailwindcss/typography'
import tailwindcssTextStroke from '@designbycode/tailwindcss-text-stroke'

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  plugins: [tailwindcssAnimate, typography, tailwindcssTextStroke],
  prefix: '',
  safelist: [
    'lg:col-span-4',
    'lg:col-span-6',
    'lg:col-span-8',
    'lg:col-span-12',
    'border-border',
    'bg-card',
    'border-error',
    'bg-error/30',
    'border-success',
    'bg-success/30',
    'border-warning',
    'bg-warning/30',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        '2xl': '2rem',
        DEFAULT: '1rem',
        lg: '2rem',
        md: '2rem',
        sm: '1rem',
        xl: '2rem',
      },
      screens: {
        '2xl': '86rem',
        lg: '64rem',
        md: '48rem',
        sm: '40rem',
        xl: '80rem',
      },
    },
    extend: {
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        /* TODO: Move these definitions to shared styles */
        brand: '#0080ff',
        brandLight: '#56b0ff',
        /* END */

        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        background: 'hsl(var(--background))',
        border: 'hsla(var(--border))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        foreground: 'hsl(var(--foreground))',
        input: 'hsl(var(--input))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        ring: 'hsl(var(--ring))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        success: 'hsl(var(--success))',
        error: 'hsl(var(--error))',
        warning: 'hsl(var(--warning))',
      },
      fontFamily: {
        mono: ['var(--font-geist-mono)'],
        sans: ['var(--font-geist-sans)'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      typography: () => ({
        DEFAULT: {
          css: [
            {
              '--tw-prose-body': 'var(--text)',
              '--tw-prose-headings': 'var(--text)',
              fontFamily: 'var(--font-serif)',
              h1: {
                fontSize: '8rem',
                fontWeight: 700,
                marginBottom: '0.25em',
                color: 'transparent',
                '-webkit-text-stroke-width': '2px',
                '-webkit-text-stroke-color': 'var(--brand-light)',
                fontFamily: 'Open Sans,Open Sans Fallback',
              },
              h2: {
                fontSize: '2.25rem',
                fontWeight: 700,
                textAlign: 'center',
                lineHeight: 1.2,
                letterSpacing: 0,
              },
              h3: {
                fontSize: '1.5rem',
                fontWeight: 700,
                textAlign: 'center',
                lineHeight: 1.2,
                letterSpacing: 0,
              },
              h4: {
                fontSize: '1.25rem',
                fontWeight: 700,
                textAlign: 'left',
                lineHeight: '30px',
                letterSpacing: 0,
              },
              p: {
                fontSize: '1.188rem',
                lineHeight: '1.9rem',
                fontWeight: '400',
                letterSpacing: '-0.25px',
                fontVariationSettings: '"opsz" 20',
              },
              a: {
                boxShadow: 'inset 0 -2px 0 0 var(--brand)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'box-shadow 0.2s ease-out',
                wordBreak: 'break-word',
              },
              'a:hover': {
                boxShadow: 'inset 0 -11px 0 0 var(--brand-light)',
              },
            },
          ],
        },
        md: {
          css: [
            {
              h1: {
                fontSize: '9.5vw',
                fontWeight: 700,
                marginBottom: '0.25em',
                color: 'transparent',
                '-webkit-text-stroke-width': '2px',
                '-webkit-text-stroke-color': 'var(--brand-light)',
              },
            },
          ],
        },
      }),
    },
  },
}

export default config
