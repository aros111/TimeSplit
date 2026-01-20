export type Language = "de" | "en";

export const translations: Record<Language, any> = {
  de: {
    common: {
      save: "Speichern",
      cancel: "Abbrechen",
      close: "Schließen",
      edit: "Bearbeiten",
      delete: "Löschen",
      new: "Neu",
      show: "Anzeigen",
    },

    language: {
      title: "Sprache",
      description: "Wähle deine bevorzugte Sprache für die App.",
      german: "Deutsch",
      english: "Englisch",
    },

    stats: {
      title: "Insights",
      subtitle: "Ein wertfreier Blick auf deinen Tag",
      emptyState: "Noch keine Einträge",
      totalToday: "Heute erfasst",
      upgradeHint: "Upgrade auf Pro für Wochen- & Monatsansichten",
    },

    timeline: {
      title: "Verlauf",
      subtitle: "Chronologischer Tagesablauf",
      empty: "Noch keine Aktivitäten heute.",
    },

    timer: {
      stillRunning: "Bist du noch dabei?",
      stopNow: "Jetzt stoppen",
    },

    settings: {
      languageTitle: "Sprache",
      languageHint: "Wähle die Sprache für die App-Oberfläche. Du kannst sie später im Menü ändern.",

      proTitle: "Pro",
      proHeadline: "Lifetime Pro",
      proText: "Schaltet Pro-Funktionen frei wie unbegrenzte Kategorien und erweiterte Insights.",
      priceLabel: "Preis",
      upgradeBtn: "Upgrade",

      sleepTitle: "Schlafzyklus",
      sleepHint: "Diese Einstellungen bestimmen, wann ein neuer Tag nach deinem Schlafzyklus beginnt.",
      sleepNoSettings: "Keine Schlafzyklus-Einstellungen verfügbar.",
      sleepMinGapTitle: "Minimale Pause (Stunden)",

      manageCategoriesTitle: "Kategorien verwalten",
      categoryHint: "Tippe zum Bearbeiten / Verfeinern",
      moveUp: "Nach oben",
      moveDown: "Nach unten",
      editBtn: "Bearbeiten",
      refineBtn: "Verfeinern",

      feedbackTitle: "Feedback",
      feedbackHint: "Sende eine kurze Nachricht direkt an den Entwickler.",
      feedbackPlaceholder: "Deine Idee…",
      feedbackError: "Senden fehlgeschlagen. Bitte nochmal versuchen.",
      sendingBtn: "Sende…",
      sendFeedbackBtn: "Senden",
      feedbackThanks: "Danke!",

      devlogTitle: "Devlog",
      devlogHint: "Was sich in den letzten Versionen geändert hat.",
      devlogShow: "Anzeigen",
      devlogHide: "Ausblenden",
      newBadge: "NEU",

      helpLanguage: "Stelle die Sprache der App ein. Du kannst sie jederzeit im Menü ändern.",
      helpPro: "Einmaliger Lifetime-Pro-Kauf. Hebt Limits auf und schaltet erweiterte Insights frei.",
      helpSleep: "Schlaf bestimmt, wann dein Tag „neu“ beginnt. Schlaf wird separat behandelt, weil er tägliche Resets beeinflusst.",
      helpSleepMinGap:
        "Minimale Pause zwischen zwei Schlaf-Sessions. Kurze Nickerchen bleiben im selben Schlafzyklus. Beispiel: 4h bedeutet: alles unter 4h zählt noch zum gleichen Zyklus.",
      helpCategories: "Jede Kategorie hat genau EIN Icon: Emoji ODER kurzer Text. Zeit läuft pro Kategorie am selben Tag. Schlaf ist separat.",
      helpFeedback:
        "Sende Ideen und Bugs direkt an den Entwickler. Kurz halten und Kontext dazu: Erwartung vs. was passiert ist.",

      sleepLabels: {
        nightStartHour: "Nacht-Start (Uhr)",
        nightEndHour: "Nacht-Ende (Uhr)",
        minGapHours: "Minimale Pause (h)",
      },
    },

    categories: {
      title: "Kategorien",
      refine: "Verfeinern",
      work: "Arbeit",
      commute: "Pendeln",
    },
  },

  en: {
    common: {
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      edit: "Edit",
      delete: "Delete",
      new: "New",
      show: "Show",
    },

    language: {
      title: "Language",
      description: "Choose your preferred language for the app.",
      german: "German",
      english: "English",
    },

    stats: {
      title: "Insights",
      subtitle: "A non-judgmental look at your day",
      emptyState: "No entries yet",
      totalToday: "Total tracked today",
      upgradeHint: "Upgrade to Pro for weekly & monthly views",
    },

    timeline: {
      title: "Timeline",
      subtitle: "Review your day chronologically",
      empty: "No activities tracked today.",
    },

    timer: {
      stillRunning: "Are you still doing this?",
      stopNow: "Stop now",
    },

    settings: {
      languageTitle: "Language",
      languageHint: "Choose your preferred language for the app UI. You can change it later in the menu.",

      proTitle: "Pro",
      proHeadline: "Lifetime Pro",
      proText: "Unlock Pro features like unlimited categories and advanced insights.",
      priceLabel: "Price",
      upgradeBtn: "Upgrade",

      sleepTitle: "Sleep cycle",
      sleepHint: "These settings control when a new day starts after your sleep cycle.",
      sleepNoSettings: "No sleep cycle settings available.",
      sleepMinGapTitle: "Minimum Gap Hours",

      manageCategoriesTitle: "Manage categories",
      categoryHint: "Tap to edit / refine",
      moveUp: "Move up",
      moveDown: "Move down",
      editBtn: "Edit",
      refineBtn: "Refine",

      feedbackTitle: "Feedback",
      feedbackHint: "Send a quick note directly to the developer.",
      feedbackPlaceholder: "Your idea…",
      feedbackError: "Sending failed. Try again.",
      sendingBtn: "Sending…",
      sendFeedbackBtn: "Send",
      feedbackThanks: "Thanks!",

      devlogTitle: "Dev log",
      devlogHint: "What changed in recent versions.",
      devlogShow: "Show",
      devlogHide: "Hide",
      newBadge: "NEW",

      helpLanguage: "Set the app language. You can change it anytime in the menu.",
      helpPro: "One-time Lifetime Pro unlock. Removes limits and unlocks advanced insights.",
      helpSleep: "Sleep controls when a new day starts. Sleep is handled separately because it affects daily resets.",
      helpSleepMinGap:
        "Minimum break between two Sleep sessions. Short naps stay part of the same sleep cycle. Example: 4h gap means anything under 4h stays in the same cycle.",
      helpCategories: "Each category has exactly ONE icon: emoji OR short text. Time continues per category on the same day. Sleep is separate.",
      helpFeedback:
        "Send ideas and issues straight to the developer. Keep it short and include context (expected vs what happened).",

      sleepLabels: {
        nightStartHour: "Night Start Hour",
        nightEndHour: "Night End Hour",
        minGapHours: "Minimum Gap Hours",
      },
    },

    categories: {
      title: "Categories",
      refine: "Refine",
      work: "Work",
      commute: "Commute",
    },
  },
};
