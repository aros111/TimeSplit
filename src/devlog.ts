// src/devlog.ts

export type DevLogEntry = {
    version: string;
    date: string; // YYYY-MM-DD
    title: string;
    changes: string[];
};

export const DEVLOG: DevLogEntry[] = [
    {
        version: "0.2.0",
        date: "2026-01-20",
        title: "Beta Release für Testkunden",
        changes: [
            "Neues Start-/Entry-Gate mit Tutorial-Hinweis.",
            "Kategorie-Editor stabilisiert (kein White-Screen mehr beim Anlegen/Bearbeiten).",
            "Deutsch/Englisch UI verbessert.",
            "Hinweis: Einige Funktionen sind noch in Arbeit. Bitte Feedback über das Feedback-Formular senden.",
        ],
    },
    {
        version: "0.1.0",
        date: "2026-01-18",
        title: "Erste interne Version",
        changes: [
            "Basis-Tracking, Verlauf und Stats.",
            "Settings inkl. Kategorien und Sleep-Zyklus.",
        ],
    },
];

export const getLatestDevLog = (): DevLogEntry | null => {
    return DEVLOG.length ? DEVLOG[0] : null;
};
