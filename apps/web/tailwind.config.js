/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        hero: "url('/assets/background.png')",
      },
      borderWidth: {
        1: '1px',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        'blue-dark': 'var(--primary-blue-dark)',
        'blue-base': 'var(--primary-blue-base)',
        'blue-light': 'var(--primary-blue-light)',
        'gray-100': 'var(--gray-100)',
        'gray-200': 'var(--gray-200)',
        'gray-300': 'var(--gray-300)',
        'gray-400': 'var(--gray-400)',
        'gray-500': 'var(--gray-500)',
        'gray-600': 'var(--gray-600)',
        'feedback-danger': 'var(--feedback-danger)',
        'feedback-open': 'var(--feedback-open)',
        'feedback-progress': 'var(--feedback-progress)',
        'feedback-done': 'var(--feedback-done)',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'var(--primary-blue-base)',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: 'var(--primary-blue-light)',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: 'var(--gray-600)',
          foreground: 'var(--gray-300)',
        },
        accent: {
          DEFAULT: 'var(--primary-blue-light)',
          foreground: 'var(--primary-blue-dark)',
        },
        destructive: {
          DEFAULT: 'var(--feedback-danger)',
          foreground: '#FFFFFF',
        },
        border: 'var(--gray-500)',
        input: 'var(--gray-600)',
        ring: 'var(--primary-blue-base)',
        chart: {
          1: 'var(--primary-blue-dark)',
          2: 'var(--primary-blue-base)',
          3: 'var(--primary-blue-light)',
          4: 'var(--feedback-progress)',
          5: 'var(--feedback-done)',
        },
      },
      fontSize: {
        'text-xl': ['1.5rem', '140%'],
        'text-lg': ['1.25rem', '140%'],
        'heading-md': ['1rem', '140%'],
        'text-sm': ['0.875rem', '140%'],
        'text-xs': ['0.75rem', '140%'],
        'text-xxs': ['0.625rem', '140%'],
      },
      fontWeight: {
        regular: '400',
        bold: '700',
      },
      textTransform: {
        uppercase: 'uppercase',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
