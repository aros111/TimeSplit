import React, { useMemo, useState } from "react";
import emailjs from "@emailjs/browser";
import { SleepSettings, Category, CategoryRefinement } from "../types";
import { CategoryRefinementModal } from "./CategoryRefinementModal";
import { translations, Language } from "../translations";

// IMPORTANT: your project currently has "helpsheet.tsx" (see screenshot).
// So we import from "./helpsheet" (lowercase).
import { HelpSheet } from "./helpsheet";
import { DEVLOG, getLatestDevLog } from "../src/devlog";

interface SettingsProps {
  isPro: boolean;
  onUpgrade: () => void;

  sleepSettings: SleepSettings;
  onUpdateSleepSettings: (settings: SleepSettings) => void;

  categories: Category[];
  onRefineCategory: (id: string, refinements: CategoryRefinement) => void;
  onEditCategory: (cat: Category) => void;
  onReorderCategory: (id: string, direction: "up" | "down") => void;

  language: Language;
  onChangeLanguage: (lang: Language) => void;
}

type HelpKey =
  | "language"
  | "pro"
  | "sleep"
  | "sleep_minGap"
  | "categories"
  | "feedback";

import { THEME } from "../src/theme";

const LS_DEVLOG_LAST_SEEN = "timesplit_devlog_last_seen_version";

const HelpBtn: React.FC<{ onClick: () => void; label?: string }> = ({
  onClick,
  label,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label || "Help"}
      title={label || "Help"}
      className="h-8 w-8 rounded-full flex items-center justify-center transition-colors active:scale-95"
      style={{ backgroundColor: THEME.COLORS.TEAL_SOFT, border: `1px solid ${THEME.COLORS.TEAL_SOFT}` }}
    >
      <span
        className="text-sm font-extrabold"
        style={{ color: THEME.COLORS.TEAL, lineHeight: 1 }}
      >
        ?
      </span>
    </button>
  );
};

export const Settings: React.FC<SettingsProps> = ({
  isPro,
  onUpgrade,
  sleepSettings,
  onUpdateSleepSettings,
  categories,
  onRefineCategory,
  onEditCategory,
  onReorderCategory,
  language,
  onChangeLanguage,
}) => {
  const t = translations[language] || translations.en;

  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const [activeRefiningId, setActiveRefiningId] = useState<string | null>(null);

  const [helpOpen, setHelpOpen] = useState(false);
  const [helpKey, setHelpKey] = useState<HelpKey>("feedback");

  const [devLogOpen, setDevLogOpen] = useState(false);

  const latestDevLog = useMemo(() => getLatestDevLog(), []);
  const lastSeenVersion = useMemo(() => {
    try { return localStorage.getItem(LS_DEVLOG_LAST_SEEN) || ""; } catch { return ""; }
  }, []);
  const hasNewDevLog = useMemo(() => {
    if (!latestDevLog) return false;
    return (lastSeenVersion || "") !== latestDevLog.version;
  }, [latestDevLog, lastSeenVersion]);

  const markDevLogAsRead = () => {
    if (!latestDevLog) return;
    try { localStorage.setItem(LS_DEVLOG_LAST_SEEN, latestDevLog.version); } catch { }
  };

  const openHelp = (key: HelpKey) => {
    setHelpKey(key);
    setHelpOpen(true);
  };

  const closeHelp = () => setHelpOpen(false);

  const updateSetting = (key: keyof SleepSettings, value: number) => {
    onUpdateSleepSettings({ ...sleepSettings, [key]: value });
  };

  const sleepCategory = useMemo(() => {
    const byId = categories.find((c) => (c.id || "").toLowerCase() === "sleep");
    if (byId) return byId;

    const byName = categories.find((c) => {
      const n = (c.name || "").toLowerCase();
      return (
        n === "sleep" ||
        n === "schlaf" ||
        n.includes("sleep") ||
        n.includes("schlaf")
      );
    });
    return byName || null;
  }, [categories]);

  const managedCategories = useMemo(() => {
    if (!sleepCategory) return categories;
    return categories.filter((c) => c.id !== sleepCategory.id);
  }, [categories, sleepCategory]);

  const sleepSettingKeys = useMemo(() => {
    const keys = Object.keys(sleepSettings || {}) as Array<keyof SleepSettings>;
    return keys.filter((k) => typeof (sleepSettings as any)[k] === "number");
  }, [sleepSettings]);

  const labelFromKey = (key: string) => {
    const pretty = key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/_/g, " ")
      .trim();
    return pretty.charAt(0).toUpperCase() + pretty.slice(1);
  };

  const formatLocalDateTime = () => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date());
    } catch {
      return new Date().toLocaleString();
    }
  };

  const getEmailJsConfig = () => {
    const serviceId = (import.meta as any).env?.VITE_EMAILJS_SERVICE_ID as
      | string
      | undefined;
    const templateId = (import.meta as any).env?.VITE_EMAILJS_TEMPLATE_ID as
      | string
      | undefined;
    const publicKey = (import.meta as any).env?.VITE_EMAILJS_PUBLIC_KEY as
      | string
      | undefined;

    return {
      serviceId: (serviceId || "").trim(),
      templateId: (templateId || "").trim(),
      publicKey: (publicKey || "").trim(),
    };
  };

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendError(null);

    const trimmed = feedback.trim();
    if (!trimmed || sending) return;

    const { serviceId, templateId, publicKey } = getEmailJsConfig();
    if (!serviceId || !templateId || !publicKey) {
      setSendError(
        "Email config missing. Check .env.local (VITE_EMAILJS_SERVICE_ID / TEMPLATE_ID / PUBLIC_KEY)."
      );
      return;
    }

    setSending(true);
    try {
      const sentAt = formatLocalDateTime();

      // These variables MUST match your EmailJS template variables.
      // Template expects: {{message}} and {{sent_at}}
      await emailjs.send(
        serviceId,
        templateId,
        {
          message: trimmed,
          sent_at: sentAt,
        },
        {
          publicKey,
        }
      );

      setSubmitted(true);
      setFeedback("");
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      setSendError(t?.settings?.feedbackError ?? "Sending failed. Try again.");
    } finally {
      setSending(false);
    }
  };

  const helpTitle = useMemo(() => {
    switch (helpKey) {
      case "language":
        return t?.settings?.languageTitle ?? "Language";
      case "pro":
        return t?.settings?.proTitle ?? "Pro";
      case "sleep":
        return t?.settings?.sleepTitle ?? "Sleep cycle";
      case "sleep_minGap":
        return t?.settings?.sleepMinGapTitle ?? "Minimum Gap Hours";
      case "categories":
        return t?.settings?.manageCategoriesTitle ?? "Categories";
      case "feedback":
      default:
        return t?.settings?.feedbackTitle ?? "Feedback";
    }
  }, [helpKey, t]);

  const helpBody = useMemo(() => {
    switch (helpKey) {
      case "language":
        return (
          t?.settings?.helpLanguage ??
          "Set the app language. TimeSplit is never translated, everything else is."
        );

      case "pro":
        return (
          t?.settings?.helpPro ??
          "One-time Lifetime Pro unlock. Removes limits and unlocks advanced insights."
        );

      case "sleep":
        return (
          t?.settings?.helpSleep ??
          "Sleep controls when a new day starts. Sleep is handled separately because it affects daily resets."
        );

      case "sleep_minGap":
        return (
          t?.settings?.helpSleepMinGap ??
          "Minimum break between two Sleep sessions. Short naps stay part of the same sleep cycle. Example: 4h gap means anything under 4h stays in the same cycle."
        );

      case "categories":
        return (
          t?.settings?.helpCategories ??
          "Each category has exactly ONE icon: emoji OR short text. Time continues per category on the same day. Sleep is separate."
        );

      case "feedback":
      default:
        return (
          t?.settings?.helpFeedback ??
          "Send ideas and issues straight to the developer. Keep it short and include context (what you expected vs what happened)."
        );
    }
  }, [helpKey, t]);

  return (
    <div className="space-y-6 pb-32">
      {/* LANGUAGE */}
      <div
        className="p-4"
        style={{
          backgroundColor: THEME.COLORS.SURFACE,
          borderRadius: THEME.RADII.CARD,
          boxShadow: THEME.SHADOWS.SOFT,
          border: `1px solid ${THEME.COLORS.BORDER}`
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">
              {t?.settings?.languageTitle ?? "Language"}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {t?.settings?.languageHint ??
                "Choose your preferred language for the app UI."}
            </div>
          </div>

          <HelpBtn onClick={() => openHelp("language")} label="Help: Language" />
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onChangeLanguage("de")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border ${language === "de"
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-900 border-slate-200"
              }`}
          >
            Deutsch
          </button>

          <button
            onClick={() => onChangeLanguage("en")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border ${language === "en"
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-900 border-slate-200"
              }`}
          >
            English
          </button>
        </div>
      </div>

      {/* PRO / UPGRADE */}
      {!isPro && (
        <div
          className="p-4"
          style={{
            backgroundColor: THEME.COLORS.SURFACE,
            borderRadius: THEME.RADII.CARD,
            boxShadow: THEME.SHADOWS.SOFT,
            border: `1px solid ${THEME.COLORS.BORDER}`
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                {t?.settings?.proTitle ?? "Pro"}
              </div>
              <div className="mt-2 text-base font-semibold text-slate-900">
                {t?.settings?.proHeadline ?? "Lifetime Pro"}
              </div>
              <div className="mt-1 text-sm text-slate-700">
                {t?.settings?.proText ??
                  "Unlock Pro features like unlimited categories and advanced insights."}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <HelpBtn onClick={() => openHelp("pro")} label="Help: Pro" />

              <div className="shrink-0 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
                <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                  {t?.settings?.priceLabel ?? "Price"}
                </div>
                <div className="mt-1 text-lg font-extrabold text-slate-900">
                  0,99 €
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onUpgrade}
            className="mt-4 w-full rounded-2xl bg-slate-900 py-3 text-white text-sm font-semibold"
          >
            {t?.settings?.upgradeBtn ?? "Upgrade"} · 0,99 €
          </button>
        </div>
      )}

      {/* SLEEP CYCLE (SPECIAL) */}
      <div
        className="p-4"
        style={{
          backgroundColor: THEME.COLORS.SURFACE,
          borderRadius: THEME.RADII.CARD,
          boxShadow: THEME.SHADOWS.SOFT,
          border: `1px solid ${THEME.COLORS.BORDER}`
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center border border-slate-200 bg-slate-50"
              title={sleepCategory?.name || "Sleep"}
            >
              <span className="text-lg">
                {sleepCategory?.emoji || sleepCategory?.icon || "🌙"}
              </span>
            </div>

            <div>
              <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                {t?.settings?.sleepTitle ?? "Sleep cycle"}
              </div>
              <div className="mt-1 text-sm text-slate-700">
                {t?.settings?.sleepHint ??
                  "These settings control when a new day starts after your sleep cycle."}
              </div>
            </div>
          </div>

          <HelpBtn onClick={() => openHelp("sleep")} label="Help: Sleep cycle" />
        </div>

        {sleepSettingKeys.length === 0 ? (
          <div className="mt-3 text-xs text-slate-500">
            {t?.settings?.sleepNoSettings ?? "No sleep cycle settings available."}
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {sleepSettingKeys.map((k) => {
              const current = Number((sleepSettings as any)[k] ?? 0);
              const rawLabel = labelFromKey(String(k));
              const translatedLabel =
                (t as any)?.settings?.sleepLabels?.[String(k)] ||
                rawLabel;


              const isMinGap =
                String(k).toLowerCase().includes("gap") ||
                rawLabel.toLowerCase().includes("gap");

              return (
                <div
                  key={String(k)}
                  className="rounded-2xl border border-slate-200 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold text-slate-900">
                        {rawLabel}
                      </div>
                      {isMinGap && (
                        <HelpBtn
                          onClick={() => openHelp("sleep_minGap")}
                          label="Help: Minimum gap hours"
                        />
                      )}
                    </div>

                    <div className="text-sm font-semibold text-slate-700 tabular-nums">
                      {current}
                    </div>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={24}
                    step={1}
                    value={current}
                    onChange={(e) => updateSetting(k, Number(e.target.value))}
                    className="mt-3 w-full"
                  />

                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>0</span>
                    <span>24</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MANAGE CATEGORIES (EXCLUDES SLEEP) */}
      <div
        className="p-4"
        style={{
          backgroundColor: THEME.COLORS.SURFACE,
          borderRadius: THEME.RADII.CARD,
          boxShadow: THEME.SHADOWS.SOFT,
          border: `1px solid ${THEME.COLORS.BORDER}`
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">
              {t?.settings?.manageCategoriesTitle ?? "Manage categories"}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {t?.settings?.categoryHint ?? "Tap to edit / refine"}
            </div>
          </div>

          <HelpBtn
            onClick={() => openHelp("categories")}
            label="Help: Categories"
          />
        </div>

        <div className="mt-3 space-y-2">
          {managedCategories.map((c, idx) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 p-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-8 w-8 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: c.color || "#F1F3F5" }}
                >
                  <span className="text-lg">{c.emoji || c.icon || ""}</span>
                </div>

                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {c.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {t?.settings?.categoryHint ?? "Tap to edit / refine"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onReorderCategory(c.id, "up")}
                  disabled={idx === 0}
                  className="h-9 w-9 rounded-xl border border-slate-200 text-slate-700 disabled:opacity-40"
                  title={t?.settings?.moveUp ?? "Move up"}
                >
                  ↑
                </button>
                <button
                  onClick={() => onReorderCategory(c.id, "down")}
                  disabled={idx === managedCategories.length - 1}
                  className="h-9 w-9 rounded-xl border border-slate-200 text-slate-700 disabled:opacity-40"
                  title={t?.settings?.moveDown ?? "Move down"}
                >
                  ↓
                </button>

                <button
                  onClick={() => onEditCategory(c)}
                  className="h-9 px-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-semibold"
                >
                  {t?.settings?.editBtn ?? "Edit"}
                </button>

                <button
                  onClick={() => setActiveRefiningId(c.id)}
                  className="h-9 px-3 rounded-xl bg-slate-900 text-white text-sm font-semibold"
                >
                  {t?.settings?.refineBtn ?? "Refine"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FEEDBACK */}
      <div
        className="p-4"
        style={{
          backgroundColor: THEME.COLORS.SURFACE,
          borderRadius: THEME.RADII.CARD,
          boxShadow: THEME.SHADOWS.SOFT,
          border: `1px solid ${THEME.COLORS.BORDER}`
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">
              {t?.settings?.feedbackTitle ?? "Feedback"}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {t?.settings?.feedbackHint ??
                "Send a quick note directly to the developer."}
            </div>
          </div>

          <HelpBtn
            onClick={() => openHelp("feedback")}
            label="Help: Feedback"
          />
        </div>

        <form onSubmit={handleFeedback} className="mt-3 space-y-3">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={t?.settings?.feedbackPlaceholder ?? "Your idea..."}
            className="w-full min-h-[120px] rounded-2xl border border-slate-200 p-3 text-sm outline-none"
          />

          {sendError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {sendError}
            </div>
          )}

          <button
            type="submit"
            disabled={sending || !feedback.trim()}
            className="w-full rounded-2xl bg-slate-900 py-3 text-white text-sm font-semibold disabled:opacity-60"
          >
            {sending
              ? t?.settings?.sendingBtn ?? "Sending…"
              : t?.settings?.sendFeedbackBtn ?? "Send"}
          </button>

          {submitted && (
            <div className="text-xs text-slate-600">
              {t?.settings?.feedbackThanks ?? "Thanks!"}
            </div>
          )}
        </form>
      </div>

      {/* DEV LOG */}
      <div
        className="p-4"
        style={{
          backgroundColor: THEME.COLORS.SURFACE,
          borderRadius: THEME.RADII.CARD,
          boxShadow: THEME.SHADOWS.SOFT,
          border: `1px solid ${THEME.COLORS.BORDER}`
        }}
      >
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">
            {t?.settings?.devlogTitle ?? "Dev log"}
          </div>

          <div className="flex items-center gap-2">
            {hasNewDevLog && (
              <div className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                NEW
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                const next = !devLogOpen;
                setDevLogOpen(next);
                if (next) markDevLogAsRead();
              }}
              className="h-9 px-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-semibold"
            >
              {devLogOpen ? (t?.settings?.devlogHide ?? "Hide") : (t?.settings?.devlogShow ?? "Show")}
            </button>
          </div>
        </div>

        <div className="mt-2 text-xs text-slate-500">
          {t?.settings?.devlogHint ?? "What changed in recent versions."}
        </div>

        {devLogOpen && (
          <div className="mt-4 space-y-3">
            {DEVLOG.map((entry) => (
              <div key={entry.version} className="rounded-2xl border border-slate-200 p-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{entry.title}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    v{entry.version} · {entry.date}
                  </div>
                </div>

                <ul className="mt-3 space-y-1 text-sm text-slate-700 list-disc pl-5">
                  {entry.changes.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeRefiningId && (
        <CategoryRefinementModal
          categoryId={activeRefiningId}
          onClose={() => setActiveRefiningId(null)}
          onSave={(refinements) => {
            onRefineCategory(activeRefiningId, refinements);
            setActiveRefiningId(null);
          }}
        />
      )}

      {/* HELP SHEET (should NOT be covered by bottom nav) */}
      <HelpSheet
        open={helpOpen}
        onClose={closeHelp}
        title={helpTitle}
        body={helpBody}
        // This padding keeps it above the bottom nav (safe area)
        bottomOffsetClassName="pb-28"
        accentBg={THEME.COLORS.TEAL_SOFT}
        accentFg={THEME.COLORS.TEAL}
      />
    </div>
  );
};
