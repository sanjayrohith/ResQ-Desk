import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        /* === PREMIUM BLACK THEME REMAP ===
           `slate` (was blue-grey) -> warm neutral near-black.
           `cyan`  (was the blue accent) -> refined champagne gold.
           Remapping here retints every existing slate-/cyan- utility class
           across the app without editing any component. */
        slate: {
          50: "#f6f6f5",
          100: "#e9e9e7",
          200: "#d4d3cf",
          300: "#b1b0ab",
          400: "#84837d",
          500: "#605f59",
          600: "#454440",
          700: "#2a2a27",
          800: "#1a1a18",
          900: "#111110",
          950: "#080807",
        },
        cyan: {
          50: "#fbf8ef",
          100: "#f6efd6",
          200: "#ecdcac",
          300: "#e0c87f",
          400: "#d4af37",
          500: "#c39a2b",
          600: "#a07d22",
          700: "#7c611c",
          800: "#594718",
          900: "#3c300f",
          950: "#221b08",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        panel: {
          DEFAULT: "hsl(var(--panel))",
          foreground: "hsl(var(--panel-foreground))",
          header: "hsl(var(--panel-header))",
        },
        emergency: {
          critical: "hsl(var(--emergency-critical))",
          "critical-foreground": "hsl(var(--emergency-critical-foreground))",
          warning: "hsl(var(--emergency-warning))",
          "warning-foreground": "hsl(var(--emergency-warning-foreground))",
          success: "hsl(var(--emergency-success))",
          "success-foreground": "hsl(var(--emergency-success-foreground))",
          busy: "hsl(var(--emergency-busy))",
          "busy-foreground": "hsl(var(--emergency-busy-foreground))",
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
