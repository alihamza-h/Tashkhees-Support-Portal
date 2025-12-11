/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Primary: #9CD4E0 (Cyan-ish)
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
                // Accent: #E4E6A3 (Lime-ish)
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
                // Neutral: #4C4D4F (Grey)
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
                // Semantic Priorities
                critical: { 500: '#F43F5E', 400: '#FB7185' }, // Rose
                high: { 500: '#F97316', 400: '#FB923C' },     // Orange
                medium: { 500: '#F59E0B', 400: '#FBBF24' },   // Amber
                low: { 500: '#06B6D4', 400: '#22D3EE' },      // Cyan

                // Semantic Statuses
                unassigned: { 500: '#94A3B8', 400: '#CBD5E1' }, // Slate
                todo: { 500: '#8B5CF6', 400: '#A78BFA' },       // Violet
                inprogress: { 500: '#0EA5E9', 400: '#38BDF8' }, // Sky
                qa: { 500: '#D946EF', 400: '#E879F9' },         // Pink
                completed: { 500: '#10B981', 400: '#34D399' },  // Emerald
                done: { 500: '#14B8A6', 400: '#2DD4BF' },       // Teal

                // Mappings for backward compatibility
                purple: {
                    50: '#f4fbfd', 100: '#eef9fc', 200: '#dcf4fa', 300: '#bfeaf6',
                    400: '#9cd4e0', 500: '#7ac0d0', 600: '#5a9eb0', 700: '#427f90',
                    800: '#336675', 900: '#2a525f', 950: '#1a3640',
                },
                blue: {
                    50: '#fdfeeb', 100: '#fbfed6', 200: '#f7fbad', 300: '#e4e6a3',
                    400: '#d1d47a', 500: '#b5b852', 600: '#90933d', 700: '#6d6f2e',
                    800: '#575928', 900: '#484a24', 950: '#272811',
                },
                slate: {
                    50: '#f6f6f7', 100: '#e3e3e4', 200: '#c6c7c9', 300: '#a4a6a9',
                    400: '#83868b', 500: '#65686e', 600: '#4c4d4f', 700: '#3e3f41',
                    800: '#323335', 900: '#2a2b2c', 950: '#1a1b1c',
                },
                dark: {
                    50: '#f6f6f7', 100: '#e3e3e4', 200: '#c6c7c9', 300: '#a4a6a9',
                    400: '#83868b', 500: '#65686e', 600: '#4c4d4f', 700: '#3e3f41',
                    800: '#323335', 900: '#2a2b2c', 950: '#1a1b1c',
                },
                // New Light Mode Theme Colors
                peach: {
                    50: '#fff8f3',
                    100: '#fff0e0',
                    200: '#ffe0c2',
                    300: '#ffd3ac', // Primary Soft Peach
                    400: '#ffb985',
                    500: '#fa9d5a',
                    600: '#eb7a31',
                    700: '#c25e22',
                    800: '#9c4a1e',
                    900: '#7d3e1d',
                },
                beige: {
                    50: '#fbfaf9',
                    100: '#f5f2ef',
                    200: '#ebe6e0',
                    300: '#dcd3cb',
                    400: '#ccbeb1', // Secondary Subtle Beige
                    500: '#b09f91',
                    600: '#948375',
                    700: '#78695f',
                    800: '#61554e',
                    900: '#504641',
                },
                brown: {
                    50: '#f7f5f2',
                    100: '#ebe6df',
                    200: '#d6cec2',
                    300: '#bbaea0',
                    400: '#9c8c7a',
                    500: '#80705e',
                    600: '#664c36', // Primary Dark Text / Contrast
                    700: '#523d2b',
                    800: '#453426',
                    900: '#3a2c22',
                },
                coffee: {
                    50: '#f4f2f0',
                    100: '#e3dfdb',
                    200: '#c5beb6',
                    300: '#a3998f',
                    400: '#83776d',
                    500: '#665a50',
                    600: '#4d433b',
                    700: '#331c08', // Deep Accent Contrast
                    800: '#2d1a0b',
                    900: '#26170d',
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
