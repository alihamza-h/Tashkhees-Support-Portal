/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary: #9CD4E0 (Cyan-ish) - Mapped to 'primary' and 'purple' (for backward compatibility)
                primary: {
                    50: '#f4fbfd',
                    100: '#eef9fc',
                    200: '#dcf4fa',
                    300: '#bfeaf6',
                    400: '#9cd4e0', // Brand Primary
                    500: '#7ac0d0',
                    600: '#5a9eb0',
                    700: '#427f90',
                    800: '#336675',
                    900: '#2a525f',
                    950: '#1a3640',
                },
                // Accent: #E4E6A3 (Lime-ish) - Mapped to 'accent' and 'blue' (for highlights)
                accent: {
                    50: '#fdfeeb',
                    100: '#fbfed6',
                    200: '#f7fbad',
                    300: '#e4e6a3', // Brand Accent
                    400: '#d1d47a',
                    500: '#b5b852',
                    600: '#90933d',
                    700: '#6d6f2e',
                    800: '#575928',
                    900: '#484a24',
                    950: '#272811',
                },
                // Neutral: #4C4D4F (Grey) - Mapped to 'neutral', 'dark', 'slate', 'gray'
                neutral: {
                    50: '#f6f6f7',
                    100: '#e3e3e4',
                    200: '#c6c7c9',
                    300: '#a4a6a9',
                    400: '#83868b',
                    500: '#65686e',
                    600: '#4c4d4f', // Brand Neutral
                    700: '#3e3f41',
                    800: '#323335',
                    900: '#2a2b2c',
                    950: '#1a1b1c',
                },
                // Mapping for backward compatibility to instantly reskin
                purple: {
                    50: '#f4fbfd',
                    100: '#eef9fc',
                    200: '#dcf4fa',
                    300: '#bfeaf6',
                    400: '#9cd4e0', // Primary
                    500: '#7ac0d0',
                    600: '#5a9eb0',
                    700: '#427f90',
                    800: '#336675',
                    900: '#2a525f',
                    950: '#1a3640',
                },
                blue: {
                    50: '#fdfeeb',
                    100: '#fbfed6',
                    200: '#f7fbad',
                    300: '#e4e6a3', // Accent
                    400: '#d1d47a',
                    500: '#b5b852',
                    600: '#90933d',
                    700: '#6d6f2e',
                    800: '#575928',
                    900: '#484a24',
                    950: '#272811',
                },
                slate: {
                    50: '#f6f6f7',
                    100: '#e3e3e4',
                    200: '#c6c7c9',
                    300: '#a4a6a9',
                    400: '#83868b',
                    500: '#65686e',
                    600: '#4c4d4f', // Neutral
                    700: '#3e3f41',
                    800: '#323335',
                    900: '#2a2b2c',
                    950: '#1a1b1c',
                },
                dark: {
                    50: '#f6f6f7',
                    100: '#e3e3e4',
                    200: '#c6c7c9',
                    300: '#a4a6a9',
                    400: '#83868b',
                    500: '#65686e',
                    600: '#4c4d4f',
                    700: '#3e3f41',
                    800: '#323335',
                    900: '#2a2b2c',
                    950: '#1a1b1c',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-down': 'slideDown 0.5s ease-out',
                'fade-in': 'fadeIn 0.5s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(168, 85, 247, 0.5), 0 0 20px rgba(168, 85, 247, 0.3)' },
                    '100%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.8), 0 0 40px rgba(168, 85, 247, 0.5)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(100%)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-100%)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}
