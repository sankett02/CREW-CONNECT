/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            colors: {
                primary: '#6366f1',
                accent: '#38bdf8',
                'bg-main': '#080d1a',
                'bg-card': 'rgba(15, 23, 42, 0.8)',
                'text-main': '#f0f4ff',
                'text-muted': '#7e8fb5',
                border: 'rgba(255, 255, 255, 0.08)',
                'glass-bg': 'rgba(255, 255, 255, 0.04)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-hero': 'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)',
            },
            boxShadow: {
                'glow-primary': '0 0 40px rgba(99, 102, 241, 0.25)',
                'glow-accent': '0 0 40px rgba(56, 189, 248, 0.15)',
                'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.6 },
                },
            },
        },
    },
    plugins: [],
}
