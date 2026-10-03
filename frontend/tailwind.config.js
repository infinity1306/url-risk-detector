/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                'cyber-bg': '#0a0e17',
                'cyber-card': '#111827',
                'cyber-border': '#1e293b',
                'cyber-accent': '#00f0ff',
                'cyber-accent2': '#7c3aed',
                'cyber-green': '#22c55e',
                'cyber-yellow': '#eab308',
                'cyber-orange': '#f97316',
                'cyber-red': '#ef4444',
                'cyber-critical': '#dc2626',
                'cyber-text': '#e2e8f0',
                'cyber-muted': '#94a3b8',
            },
            fontFamily: {
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'cyber': '0 0 20px rgba(0, 240, 255, 0.15)',
                'cyber-lg': '0 0 40px rgba(0, 240, 255, 0.2)',
                'glow-green': '0 0 20px rgba(34, 197, 94, 0.3)',
                'glow-red': '0 0 20px rgba(239, 68, 68, 0.3)',
                'glow-yellow': '0 0 20px rgba(234, 179, 8, 0.3)',
            },
            animation: {
                'pulse-slow': 'pulse 3s ease-in-out infinite',
                'scan-line': 'scanLine 2s linear infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                scanLine: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100%)' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(0, 240, 255, 0.2)' },
                    '100%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.6)' },
                },
            },
        },
    },
    plugins: [],
};
