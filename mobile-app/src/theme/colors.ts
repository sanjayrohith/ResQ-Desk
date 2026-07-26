/**
 * RESQ PREMIUM BLACK PALETTE v3
 * Ported 1:1 from frontend/src/index.css + tailwind.config.ts.
 * `slate` and `cyan` below are the web app's remapped scales
 * (NOT Tailwind's stock blue/cyan) — see tailwind.config.ts comment.
 */

export const slate = {
  50: '#f6f6f5',
  100: '#e9e9e7',
  200: '#d4d3cf',
  300: '#b1b0ab',
  400: '#84837d',
  500: '#605f59',
  600: '#454440',
  700: '#2a2a27',
  800: '#1a1a18',
  900: '#111110',
  950: '#080807',
};

export const cyan = {
  50: '#fafafb',
  100: '#f2f2f4',
  200: '#e4e4e8',
  300: '#d0d0d7',
  400: '#c2c2cb',
  500: '#a2a2ac',
  600: '#83838d',
  700: '#63636c',
  800: '#45454b',
  900: '#29292d',
  950: '#161619',
};

export const red = {
  300: '#fca5a5',
  400: '#f87171',
  500: '#ef4444',
  600: '#dc2626',
};

export const amber = {
  400: '#fbbf24',
  500: '#f59e0b',
  600: '#d97706',
};

export const orange = {
  500: '#f97316',
};

export const emerald = {
  400: '#34d399',
  500: '#10b981',
  600: '#059669',
};

export const yellow = {
  400: '#facc15',
  500: '#eab308',
};

export const purple = {
  500: '#a855f7',
};

export const colors = {
  background: '#060605',
  card: '#0f0e0c',
  foreground: '#f5f4f2',
  mutedForeground: slate[500],
  border: 'rgba(226, 226, 232, 0.08)',
  destructive: red[500],

  panelBg1: 'rgba(18, 17, 15, 0.92)',
  panelBg2: 'rgba(14, 13, 12, 0.78)',
  panelBorder: 'rgba(226, 226, 232, 0.08)',

  slate,
  cyan,
  red,
  amber,
  orange,
  emerald,
  yellow,
  purple,

  vehicle: {
    AMBULANCE: cyan[400],
    FIRE_ENGINE: orange[500],
    RESCUE_BOAT: purple[500],
    DEFAULT: slate[500],
  },
  unitStatus: {
    AVAILABLE: emerald[500],
    EN_ROUTE: cyan[400],
    ON_SCENE: amber[500],
    RETURNING: slate[500],
  },
};

export type SeverityKey = 'Critical' | 'High' | 'Medium' | 'Low' | 'Normal';

export const severityConfig: Record<
  SeverityKey,
  { bg: string; text: string; border: string; label: string }
> = {
  Critical: { bg: 'rgba(239,68,68,0.15)', text: red[400], border: 'rgba(239,68,68,0.3)', label: 'CRITICAL' },
  High: { bg: 'rgba(245,158,11,0.15)', text: amber[400], border: 'rgba(245,158,11,0.3)', label: 'HIGH' },
  Medium: { bg: 'rgba(234,179,8,0.15)', text: yellow[400], border: 'rgba(234,179,8,0.3)', label: 'MEDIUM' },
  Low: { bg: 'rgba(16,185,129,0.15)', text: emerald[400], border: 'rgba(16,185,129,0.3)', label: 'LOW' },
  Normal: { bg: slate[800], text: slate[400], border: 'transparent', label: 'NORMAL' },
};
