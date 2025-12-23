export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    obsidian: '#0f0d08',
                    surface: '#1c180f',
                    primary: '#ffb700',
                    glow: 'rgba(255, 183, 0, 0.2)',
                    silk: '#fcfcf9',
                    cream: '#f2f2eb',
                    accent: '#ff8f00',
                    carbon: '#0a0804'
                }
            },
            fontFamily: {
                'display': ['Inter', 'sans-serif'],
                'serif': ['Playfair Display', 'serif'],
                'outfit': ['Outfit', 'sans-serif'],
            },
            borderRadius: {
                'ultra': '3.5rem',
                'mega': '2.5rem',
                'lg': '2rem',
            },
            animation: {
                'pulse-glow': 'pulseGlow 3s infinite',
                'reveal': 'reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'screen-in': 'screenIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                'slow-zoom': 'slowZoom 20s ease-in-out infinite alternate',
                'fade-out': 'fadeOut 0.5s ease-out forwards'
            },
            keyframes: {
                pulseGlow: {
                    '0%, 100%': { opacity: 0.5, transform: 'scale(1)' },
                    '50%': { opacity: 1, transform: 'scale(1.05)' },
                },
                reveal: {
                    '0%': { opacity: 0, transform: 'translateY(30px) scale(0.95)' },
                    '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
                },
                screenIn: {
                    '0%': { opacity: 0, transform: 'translateY(20px) scale(0.98)' },
                    '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
                },
                slowZoom: {
                    '0%': { transform: 'scale(1)' },
                    '100%': { transform: 'scale(1.15)' }
                },
                fadeOut: {
                    '0%': { opacity: 1, transform: 'translateY(0)' },
                    '100%': { opacity: 0, transform: 'translateY(-20px)' }
                }
            }
        }
    },
    plugins: [],
}
