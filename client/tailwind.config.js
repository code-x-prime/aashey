/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				cormorant: ["var(--font-cormorant)", "serif"],
				playfair: ["var(--font-playfair)", "serif"],
				sans: ["var(--font-poppins)", "sans-serif"],
				sc: ["var(--font-cormorant-sc)", "serif"],
				// Legacy aliases
				display: ["var(--font-playfair)", "serif"],
				accent: ["var(--font-cormorant)", "serif"],
				heading: ["var(--font-playfair)", "serif"],
			},
			colors: {
				brand: {
					brown: "#3F1F00",
					green: "#092D15",
					gold: "#C9933A",
					lightgold: "#F0C96B",
					cream: "#FDF6E3",
					dark: "#1A0A00",
				},
				// Legacy colors (kept for compatibility)
				gold: {
					DEFAULT: '#C9933A',
					light: '#F0C96B',
					dark: '#3F1F00',
				},
				maroon: {
					DEFAULT: '#3F1F00',
					light: '#5A2F0A',
					dark: '#2A1500',
				},
				brown: '#3F1F00',
				saffron: '#FF8C00',
				'jf-green': '#092D15',
				beige: '#FDF6E3',
				cream: '#FDF6E3',
				'warm-white': '#FDF6E3',
				// System Colors
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				marquee: {
					'0%': { transform: 'translateX(0%)' },
					'100%': { transform: 'translateX(-100%)' },
				},
				'marquee-infinite': {
					'0%': { transform: 'translateX(0%)' },
					'100%': { transform: 'translateX(-50%)' },
				}
			},
			animation: {
				marquee: 'marquee 25s linear infinite',
				'marquee-infinite': 'marquee-infinite 25s linear infinite',
			}
		}

	},
	plugins: [require("tailwindcss-animate")],
};
