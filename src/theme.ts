export const THEME = {
    COLORS: {
        BG: "#FDFCF8",        // Warm ivory/cream
        SURFACE: "#FFFFFF",   // White surface for cards (or "#F7F5F0" if darker needed)
        SURFACE_ALT: "#F5F3EB", // Slightly darker cream for secondary areas
        NAVY: "#0F172A",      // Deep desaturated navy (slate-900 like)
        NAVY_SOFT: "#1E293B", // Navy tint for hover
        TEAL: "#0D9488",      // Teal/Turquoise accent (Teal-600)
        TEAL_SOFT: "#CCFBF1", // Soft mint/teal (Teal-100)
        TEAL_TEXT: "#115E59", // Darker teal for text on soft bg
        TEXT: "#1E293B",      // Near-black/navy text
        MUTED: "#64748B",     // Soft gray-blue
        BORDER: "#E2E8F0",    // Subtle border
        DANGER: "#FCA5A5",    // Muted red
        DANGER_BG: "#FEF2F2", // Very soft red bg
        DANGER_TEXT: "#991B1B", // Dark red text
    },
    RADII: {
        CARD: "18px",
        MODAL: "20px",
        PILL: "999px",
        BTN: "14px",
    },
    SHADOWS: {
        SOFT: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
        Nav: "0 -8px 30px rgba(0,0,0,0.02)",
    },
    SPACING: {
        GUTTER: "1rem",
    }
} as const;
