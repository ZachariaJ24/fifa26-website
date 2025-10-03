// Midnight Studios INTl - All rights reserved
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Enhanced FIFA-themed custom colors using CSS variables
        "field-green": {
          50: "hsl(var(--field-green-50))",
          100: "hsl(var(--field-green-100))",
          200: "hsl(var(--field-green-200))",
          300: "hsl(var(--field-green-300))",
          400: "hsl(var(--field-green-400))",
          500: "hsl(var(--field-green-500))",
          600: "hsl(var(--field-green-600))",
          700: "hsl(var(--field-green-700))",
          800: "hsl(var(--field-green-800))",
          900: "hsl(var(--field-green-900))",
        },
        "stadium-gold": {
          50: "hsl(var(--stadium-gold-50))",
          100: "hsl(var(--stadium-gold-100))",
          200: "hsl(var(--stadium-gold-200))",
          300: "hsl(var(--stadium-gold-300))",
          400: "hsl(var(--stadium-gold-400))",
          500: "hsl(var(--stadium-gold-500))",
          600: "hsl(var(--stadium-gold-600))",
          700: "hsl(var(--stadium-gold-700))",
          800: "hsl(var(--stadium-gold-800))",
          900: "hsl(var(--stadium-gold-900))",
        },
        "pitch-blue": {
          50: "hsl(var(--pitch-blue-50))",
          100: "hsl(var(--pitch-blue-100))",
          200: "hsl(var(--pitch-blue-200))",
          300: "hsl(var(--pitch-blue-300))",
          400: "hsl(var(--pitch-blue-400))",
          500: "hsl(var(--pitch-blue-500))",
          600: "hsl(var(--pitch-blue-600))",
          700: "hsl(var(--pitch-blue-700))",
          800: "hsl(var(--pitch-blue-800))",
          900: "hsl(var(--pitch-blue-900))",
        },
        "goal-orange": {
          50: "hsl(var(--goal-orange-50))",
          100: "hsl(var(--goal-orange-100))",
          200: "hsl(var(--goal-orange-200))",
          300: "hsl(var(--goal-orange-300))",
          400: "hsl(var(--goal-orange-400))",
          500: "hsl(var(--goal-orange-500))",
          600: "hsl(var(--goal-orange-600))",
          700: "hsl(var(--goal-orange-700))",
          800: "hsl(var(--goal-orange-800))",
          900: "hsl(var(--goal-orange-900))",
        },
        "assist-white": {
          50: "hsl(var(--assist-white-50))",
          100: "hsl(var(--assist-white-100))",
          200: "hsl(var(--assist-white-200))",
          300: "hsl(var(--assist-white-300))",
          400: "hsl(var(--assist-white-400))",
          500: "hsl(var(--assist-white-500))",
          600: "hsl(var(--assist-white-600))",
          700: "hsl(var(--assist-white-700))",
          800: "hsl(var(--assist-white-800))",
          900: "hsl(var(--assist-white-900))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "gradient-x": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        "float": {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(14, 165, 233, 0.3)",
          },
          "50%": {
            boxShadow: "0 0 30px rgba(14, 165, 233, 0.6), 0 0 40px rgba(37, 99, 235, 0.3)",
          },
        },
        "shimmer": {
          "0%": {
            backgroundPosition: "-200% center",
          },
          "100%": {
            backgroundPosition: "200% center",
          },
        },
        "slide-in-right": {
          "0%": {
            transform: "translateX(100%)",
            opacity: "0",
          },
          "100%": {
            transform: "translateX(0)",
            opacity: "1",
          },
        },
        "slide-in-left": {
          "0%": {
            transform: "translateX(-100%)",
            opacity: "0",
          },
          "100%": {
            transform: "translateX(0)",
            opacity: "1",
          },
        },
        "fade-in-up": {
          "0%": {
            transform: "translateY(20px)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
        "gradient-text": {
          "0%, 100%": {
            "background-position": "0% 50%",
          },
          "50%": {
            "background-position": "100% 50%",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gradient-x": "gradient-x 3s ease infinite",
        "float": "float 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "slide-in-right": "slide-in-right 0.5s ease-out",
        "slide-in-left": "slide-in-left 0.5s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "gradient-text": "gradient-text 3s ease infinite",
      },
      scale: {
        '102': '1.02',
        '103': '1.03',
      },
      boxShadow: {
        '3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.25)',
        'hockey-glow': '0 0 20px rgba(14, 165, 233, 0.4), 0 0 40px rgba(37, 99, 235, 0.2)',
        'hockey-glow-lg': '0 0 30px rgba(14, 165, 233, 0.5), 0 0 60px rgba(37, 99, 235, 0.3)',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hockey-pattern": "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        "fifa-pattern": "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2316a34a' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
