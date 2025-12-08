/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Cyberpunk / Sci-Fi Palette
                'cyber-black': '#0f172a',
                'cyber-dark': '#1e293b',
                'cyber-gray': '#334155',
                'neon-blue': '#06b6d4', // Cyan-500
                'neon-purple': '#8b5cf6', // Violet-500
                'neon-green': '#10b981', // Emerald-500
                'neon-red': '#f43f5e',   // Rose-500
                'neon-yellow': '#f59e0b', // Amber-500
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            boxShadow: {
                'neon-blue': '0 0 5px #06b6d4, 0 0 10px #06b6d4',
                'neon-purple': '0 0 5px #8b5cf6, 0 0 10px #8b5cf6',
            },
        },
    },
    plugins: [],
}
