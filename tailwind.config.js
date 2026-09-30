import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/**/*.blade.php',
        './resources/**/*.js',
        './resources/**/*.jsx',
        './resources/**/*.ts',
        './resources/**/*.tsx',
    ],
    theme: {
        extend: {
            colors: {
                border: 'var(--border)',
                input: 'var(--input)',
                ring: 'var(--ring)',
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                primary: {
                    DEFAULT: 'var(--primary)',
                    foreground: 'var(--primary-foreground)',
                    dark: 'var(--primary-dark)',
                },
                secondary: {
                    DEFAULT: 'var(--secondary)',
                    foreground: 'var(--secondary-foreground)',
                },
                destructive: {
                    DEFAULT: 'var(--destructive)',
                    foreground: 'var(--destructive-foreground)',
                },
                muted: {
                    DEFAULT: 'var(--muted)',
                    foreground: 'var(--muted-foreground)',
                },
                accent: {
                    DEFAULT: 'var(--accent)',
                    foreground: 'var(--accent-foreground)',
                },
                card: {
                    DEFAULT: 'var(--card)',
                    foreground: 'var(--card-foreground)',
                },
                'brand-orange': 'var(--brand-orange)',
                'brand-red': 'var(--brand-red)',
                'brand-navy': 'var(--brand-navy)',
                'brand-teal': 'var(--brand-teal)',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            keyframes: {
                gradient: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                shimmer: {
                    '100%': { transform: 'translateX(200%)' },
                },
                'voice-bounce': {
                    '0%, 100%': { height: '30%' },
                    '50%': { height: '100%' },
                }
            },
            animation: {
                gradient: 'gradient 3s linear infinite',
                shimmer: 'shimmer 1.5s infinite',
                'voice-1': 'voice-bounce 0.6s ease-in-out infinite',
                'voice-2': 'voice-bounce 0.8s ease-in-out 0.1s infinite',
                'voice-3': 'voice-bounce 0.7s ease-in-out 0.25s infinite',
                'voice-4': 'voice-bounce 0.6s ease-in-out 0.4s infinite',
            }
        },
    },
    plugins: [],
};
