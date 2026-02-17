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
                'fade-out': 'fadeOut 0.5s ease-out forwards',
                'blur-spread': 'blurSpread 2s ease-out forwards',
                'text-glow': 'textGlow 2s ease-in-out infinite alternate',
                'draw': 'draw 3s ease-in-out forwards',
                'mist-drift': 'mistDrift 10s ease-in-out infinite alternate',
                'shine-metallic': 'shineMetallic 3s ease-in-out infinite',
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
                },
                blurSpread: {
                    '0%': { filter: 'blur(20px)', opacity: 0, letterSpacing: '0.5em' },
                    '100%': { filter: 'blur(0)', opacity: 1, letterSpacing: '0.1em' }
                },
                textGlow: {
                    '0%': { textShadow: '0 0 10px rgba(255,183,0,0.2)' },
                    '100%': { textShadow: '0 0 30px rgba(255,183,0,0.6), 0 0 50px rgba(255,183,0,0.4)' }
                },
                draw: {
                    '0%': { strokeDashoffset: '1000' },
                    '100%': { strokeDashoffset: '0' }
                },
                mistDrift: {
                    '0%': { transform: 'translateX(-5%) translateY(-5%) scale(1)' },
                    '100%': { transform: 'translateX(5%) translateY(5%) scale(1.1)' }
                },
                shineMetallic: {
                    '0%': { transform: 'translateX(-100%) rotate(45deg)', opacity: 0 },
                    '20%': { opacity: 0.5 },
                    '50%': { transform: 'translateX(100%) rotate(45deg)', opacity: 0 },
                    '100%': { transform: 'translateX(100%) rotate(45deg)', opacity: 0 }
                }
            }
        }
    },
    plugins: [],
}
