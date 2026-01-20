
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, Session, View, Category, SleepSuggestion, SleepSettings, CategoryRefinement } from './types';
import { INITIAL_CATEGORIES, DEFAULT_SLEEP_SETTINGS, DEFAULT_RESET_HOUR } from './constants';
import { loadState, saveState } from './utils/storage';
import { TimerDisplay } from './components/TimerDisplay';
import { Timeline } from './components/Timeline';
import { Stats } from './components/Stats';
import { Settings } from './components/Settings';
import { CategoryModal } from './components/CategoryModal';
import { SleepSuggestionCard } from './components/SleepSuggestionCard';
import { TimeHeader } from './components/TimeHeader';
import { translations, Language } from "./translations";
import { getLatestDevLog } from "./src/devlog";
import { THEME } from './src/theme';

const getDeviceLanguage = (): Language => {
  const lang = navigator.language.toLowerCase();
  return lang.startsWith("de") ? "de" : "en";
};
// Validation helper for single Unicode emoji
const validateSingleEmoji = (str: string): string => {
  if (!str) return '✨';
  try {
    const segmenterConstructor = (Intl as any).Segmenter;
    if (segmenterConstructor) {
      const segments = Array.from(new segmenterConstructor().segment(str)) as any[];
      return segments.length > 0 ? segments[0].segment : '✨';
    }
    return Array.from(str)[0] || '✨';
  } catch (e) {
    return str.charAt(0) || '✨';
  }
};

// Helper component to display and live-update the daily total for a category
const CategoryDailyTime: React.FC<{
  totalTimeToday?: number;
  isActive: boolean;
  activeStartTime?: number;
  lightMode?: boolean;
}> = ({ totalTimeToday = 0, isActive, activeStartTime, lightMode }) => {
  const [currentTotal, setCurrentTotal] = useState(totalTimeToday);

  useEffect(() => {
    const update = () => {
      const sessionElapsed = (isActive && activeStartTime) ? Date.now() - activeStartTime : 0;
      setCurrentTotal(totalTimeToday + sessionElapsed);
    };

    update();
    if (isActive) {
      const interval = setInterval(update, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive, totalTimeToday, activeStartTime]);

  const format = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;

    if (hours > 0) return `${hours}h ${remainingMins}m`;
    return `${remainingMins}m`;
  };

  // If no time tracked and not active, stay clean
  if (currentTotal < 60000 && !isActive) return null;

  return (
    <span className={`text-[9px] mt-1 font-bold uppercase tracking-wider transition-opacity ${lightMode ? 'text-white/60' : 'text-slate-400'}`}>
      Heute: {format(currentTotal)}
    </span>
  );
};

const getTutorialSteps = (lang: Language) => {
  const isDe = lang === 'de';
  return [
    {
      title: isDe ? "Willkommen bei TimeSplit" : "Welcome to TimeSplit",
      body: isDe
        ? "TimeSplit hilft dir, deinen Tag mit einem Fingertipp zu erfassen. Du kannst dieses Tutorial jederzeit überspringen."
        : "TimeSplit helps you track your day with one tap. You can skip this tutorial anytime.",
      label: null
    },
    {
      title: isDe ? "Erfassen (Stoppuhr)" : "Track (Stopwatch)",
      body: isDe
        ? "Tippe auf eine Kategorie, um den Timer zu starten. Tippe später am selben Tag erneut, um fortzufahren."
        : "Tap a category to start its timer. Tap it again later the same day to continue. Time is added for that day.",
      label: isDe ? "TRACKEN" : "TRACK",
      tip: isDe
        ? "Tipp: Starte mit deiner Hauptaktivität. Dein Tag wird schnell sichtbar."
        : "Tip: Start with your main activity. Your day becomes visible fast."
    },
    {
      title: isDe ? "Kategorien" : "Categories",
      body: isDe
        ? "Jede Kategorie hat genau EIN Icon: Emoji oder Text. Du kannst sie in den Einstellungen bearbeiten und sortieren."
        : "Each category has exactly ONE icon: emoji or text. You can edit, refine, reorder, and customize colors in Settings.",
      label: null
    },
    {
      title: isDe ? "Verlauf / Timeline" : "Timeline / History",
      body: isDe
        ? "Alles wird chronologisch gespeichert. Du kannst deinen Tag in einer klaren Liste überprüfen."
        : "Everything you do is saved chronologically with time and icons. You can review your day in one clear list.",
      label: "TIMELINE"
    },
    {
      title: isDe ? "Statistik" : "Stats",
      body: isDe
        ? "Sieh dir deine Zeiten für Heute, Woche und Monat an. Klare Summen und Prozente, ohne Diagramm-Overload."
        : "See your time split for Today, Week, and Month. You get clear totals and percentages, without chart overload.",
      label: isDe ? "STATS" : "STATS"
    },
    {
      title: isDe ? "Menü / Einstellungen" : "Menu / Settings",
      body: isDe
        ? "Im Menü kannst du Kategorien verwalten, deinen Schlafzyklus einstellen, die Sprache ändern, den Dev-Log ansehen, auf Pro upgraden und Feedback senden."
        : "In the Menu you can manage categories, set your sleep cycle (day reset), change language, view the Dev log, upgrade to Pro, and send feedback directly to the developer.",
      label: isDe ? "MENÜ" : "MENU"
    }
  ];
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = loadState();

    // Migration: Ensure all existing categories have the 'emoji' field
    if (saved) {
      const migratedCategories = saved.categories.map(cat => ({
        ...cat,
        emoji: cat.emoji || cat.icon || '✨'
      }));
      return { ...saved, categories: migratedCategories };
    }

    return {
      activeSessionId: null,
      sessions: [],
      categories: INITIAL_CATEGORIES,
      isPro: false,
      sleepSettings: DEFAULT_SLEEP_SETTINGS,
      dailyResetHour: DEFAULT_RESET_HOUR,
    };
  });

  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [hasStartedOnce, setHasStartedOnce] = useState<boolean>(() => {
    try { return localStorage.getItem("timesplit_has_started_once") === "1"; } catch { return false; }
  });

  /* --- LANGUAGE & FIRST-RUN SETUP --- */
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem("timesplit_lang");
      if (saved === "de" || saved === "en") return saved;
    } catch { }
    const nav = (navigator.language || "").toLowerCase();
    return nav.startsWith("de") ? "de" : "en";
  });

  const [languageLocked, setLanguageLocked] = useState<boolean>(() => {
    try { return localStorage.getItem("timesplit_lang") === "de" || localStorage.getItem("timesplit_lang") === "en"; }
    catch { return false; }
  });

  const handleLanguageChoice = (lang: Language) => {
    setLanguage(lang);
    setLanguageLocked(true);
    try { localStorage.setItem("timesplit_lang", lang); } catch { }
  };

  /* --- TUTORIAL --- */
  const [tutorialDone, setTutorialDone] = useState(() => {
    try { return localStorage.getItem("timesplit_tutorial_done") === "1"; } catch { return false; }
  });
  const [tutorialStep, setTutorialStep] = useState(0);

  // Tutorial only runs if NOT done and language IS chosen
  const tutorialOpen = !tutorialDone && languageLocked;

  const closeTutorial = () => {
    setTutorialDone(true);
    try { localStorage.setItem("timesplit_tutorial_done", "1"); } catch { }
  };

  const [betaNoticeDismissed, setBetaNoticeDismissed] = useState<boolean>(() => {
    try { return localStorage.getItem("timesplit_beta_notice_dismissed") === "1"; } catch { return false; }
  });

  const dismissBetaNotice = () => {
    setBetaNoticeDismissed(true);
    try { localStorage.setItem("timesplit_beta_notice_dismissed", "1"); } catch { }
  };

  const latest = useMemo(() => getLatestDevLog(), []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Logic to determine the current tracking day string (YYYY-MM-DD)
  const getTrackingDay = (ts: number, resetHour: number): string => {
    const d = new Date(ts);
    if (d.getHours() < resetHour) {
      d.setDate(d.getDate() - 1);
    }
    return d.toISOString().split('T')[0];
  };

  // Automated Daily Reset Logic
  useEffect(() => {
    const checkReset = () => {
      const now = Date.now();
      const resetHour = state.dailyResetHour ?? DEFAULT_RESET_HOUR;
      const lastReset = state.lastGlobalResetTimestamp ?? 0;

      const boundary = new Date(now);
      boundary.setHours(resetHour, 0, 0, 0);
      if (new Date(now).getHours() < resetHour) {
        boundary.setDate(boundary.getDate() - 1);
      }
      const boundaryTs = boundary.getTime();

      if (lastReset < boundaryTs) {
        setState(prev => {
          let newActiveId = prev.activeSessionId;
          let newSessions = [...prev.sessions];
          const todayStr = getTrackingDay(now, resetHour);

          if (prev.activeSessionId) {
            const activeSess = prev.sessions.find(s => s.id === prev.activeSessionId);
            if (activeSess && activeSess.categoryId !== 'cat-sleep') {
              newActiveId = null;
              newSessions = newSessions.map(s =>
                s.id === prev.activeSessionId ? { ...s, endTime: boundaryTs } : s
              );
            }
          }

          const newCategories = prev.categories.map(cat => {
            if (cat.id !== 'cat-sleep') {
              return {
                ...cat,
                totalTimeToday: 0,
                lastResetDate: todayStr
              };
            }
            return cat;
          });

          return {
            ...prev,
            activeSessionId: newActiveId,
            sessions: newSessions,
            categories: newCategories,
            lastGlobalResetTimestamp: now
          };
        });
      }
    };

    checkReset();
    const interval = setInterval(checkReset, 60000);
    return () => clearInterval(interval);
  }, [state.dailyResetHour, state.lastGlobalResetTimestamp, state.activeSessionId]);

  const activeSession = state.sessions.find(s => s.id === state.activeSessionId);
  const activeCategory = state.categories.find(c => c.id === activeSession?.categoryId);
  const isSleepActive = activeCategory?.id === 'cat-sleep';

  const sleepSuggestion = useMemo(() => {
    if (activeSession || !state.isPro) return null;

    const finishedSessions = state.sessions.filter(s => !!s.endTime).sort((a, b) => b.endTime! - a.endTime!);
    if (finishedSessions.length === 0) return null;

    const lastSession = finishedSessions[0];
    const now = Date.now();
    const gapMs = now - lastSession.endTime!;

    if (gapMs < state.sleepSettings.minGapHours * 60 * 60 * 1000) return null;
    if (state.dismissedSuggestionId === lastSession.endTime?.toString()) return null;

    const isInNightWindow = (ts: number) => {
      const h = new Date(ts).getHours();
      const { nightStartHour, nightEndHour } = state.sleepSettings;
      if (nightStartHour > nightEndHour) {
        return h >= nightStartHour || h < nightEndHour;
      } else {
        return h >= nightStartHour && h < nightEndHour;
      }
    };

    if (isInNightWindow(lastSession.endTime!) && isInNightWindow(now)) {
      return {
        id: lastSession.endTime!.toString(),
        startTime: lastSession.endTime!,
        endTime: now,
        durationMs: gapMs
      };
    }

    return null;
  }, [state.sessions, state.activeSessionId, state.sleepSettings, state.dismissedSuggestionId, state.isPro]);

  const isSuggested = (cat: Category) => {
    if (!state.isPro || !cat.refinements) return false;
    const { windowStart, windowEnd } = cat.refinements;
    if (!windowStart || !windowEnd) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (windowStart < windowEnd) {
      return currentTime >= windowStart && currentTime <= windowEnd;
    } else {
      return currentTime >= windowStart || currentTime <= windowEnd;
    }
  };

  const toggleTimer = (categoryId: string) => {
    try { localStorage.setItem("timesplit_has_started_once", "1"); } catch { }
    setHasStartedOnce(true);
    setState(prev => {
      const now = Date.now();
      const resetHour = prev.dailyResetHour ?? DEFAULT_RESET_HOUR;
      const todayStr = getTrackingDay(now, resetHour);

      let newSessions = [...prev.sessions];
      let newActiveSessionId = prev.activeSessionId;
      let newCategories = [...prev.categories];

      if (prev.activeSessionId) {
        const currentActive = prev.sessions.find(s => s.id === prev.activeSessionId);
        if (currentActive) {
          const duration = now - currentActive.startTime;
          newSessions = newSessions.map(s =>
            s.id === prev.activeSessionId ? { ...s, endTime: now } : s
          );

          newCategories = newCategories.map(cat => {
            if (cat.id === currentActive.categoryId) {
              const isSameTrackingDay = cat.lastResetDate === todayStr;
              const baseAccumulated = isSameTrackingDay ? (cat.totalTimeToday || 0) : 0;
              return {
                ...cat,
                totalTimeToday: baseAccumulated + duration,
                lastResetDate: todayStr
              };
            }
            return cat;
          });

          if (currentActive.categoryId === categoryId) {
            return {
              ...prev,
              sessions: newSessions,
              activeSessionId: null,
              categories: newCategories
            };
          }
        }
      }

      newCategories = newCategories.map(cat => {
        if (cat.id === categoryId && cat.lastResetDate !== todayStr) {
          return { ...cat, totalTimeToday: 0, lastResetDate: todayStr };
        }
        return cat;
      });

      const newSession: Session = {
        id: `sess-${now}`,
        categoryId,
        startTime: now
      };
      newSessions.push(newSession);
      newActiveSessionId = newSession.id;

      return {
        ...prev,
        sessions: newSessions,
        activeSessionId: newActiveSessionId,
        categories: newCategories
      };
    });
  };

  const acceptSleepSuggestion = (suggestion: SleepSuggestion) => {
    const sleepSession: Session = {
      id: `sess-sleep-${suggestion.id}`,
      categoryId: 'cat-sleep',
      startTime: suggestion.startTime,
      endTime: suggestion.endTime
    };
    setState(prev => ({
      ...prev,
      sessions: [...prev.sessions, sleepSession],
      dismissedSuggestionId: suggestion.id
    }));
  };

  const ignoreSleepSuggestion = (id: string) => {
    setState(prev => ({
      ...prev,
      dismissedSuggestionId: id
    }));
  };

  const deleteSession = (id: string) => {
    setState(prev => ({
      ...prev,
      sessions: prev.sessions.filter(s => s.id !== id),
      activeSessionId: prev.activeSessionId === id ? null : prev.activeSessionId
    }));
  };

  const saveCategory = (catData: Partial<Category>) => {
    setState(prev => {
      const validatedEmoji = validateSingleEmoji(catData.emoji || catData.icon || '✨');
      if (editingCategory) {
        return {
          ...prev,
          categories: prev.categories.map(c => c.id === editingCategory.id ? { ...c, ...catData, emoji: validatedEmoji } : c)
        };
      } else {
        const newCat: Category = {
          id: `cat-${Date.now()}`,
          name: catData.name || 'New activity',
          icon: validatedEmoji,
          emoji: validatedEmoji,
          color: catData.color || '#F1F3F5',
          isCustom: true
        };
        return {
          ...prev,
          categories: [...prev.categories, newCat]
        };
      }
    });
    setIsCategoryModalOpen(false);
    setEditingCategory(undefined);
  };

  const reorderCategory = (id: string, direction: 'up' | 'down') => {
    setState(prev => {
      const idx = prev.categories.findIndex(c => c.id === id);
      if (idx === -1) return prev;

      const newCategories = [...prev.categories];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;

      if (targetIdx >= 0 && targetIdx < newCategories.length) {
        [newCategories[idx], newCategories[targetIdx]] = [newCategories[targetIdx], newCategories[idx]];
      }

      return { ...prev, categories: newCategories };
    });
  };

  const refineCategory = (id: string, refinements: CategoryRefinement) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === id ? { ...c, refinements } : c)
    }));
  };

  const deleteCategory = (id: string) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id),
    }));
    setIsCategoryModalOpen(false);
    setEditingCategory(undefined);
  };

  const upgradeToPro = () => {
    setState(prev => ({ ...prev, isPro: true }));
  };

  const updateSleepSettings = (sleepSettings: SleepSettings) => {
    setState(prev => ({ ...prev, sleepSettings }));
  };

  const renderView = () => {
    switch (currentView) {
      case View.HOME:
        return (
          <div className="space-y-6 pb-32 px-4">
            <TimeHeader language={language} />
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <h1 className="text-2xl font-semibold text-slate-800 leading-tight">TimeSplit</h1>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.1em]">Mindful Tracking</p>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => toggleTimer('cat-sleep')}
                    className={`p-3 rounded-full active:scale-95 transition-all shadow-sm ${isSleepActive
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-50 shadow-indigo-100'
                      : 'bg-white text-indigo-400 border border-slate-100'
                      }`}
                  >
                    <span className="text-xl">🌙</span>
                  </button>
                  <CategoryDailyTime
                    isActive={isSleepActive}
                    activeStartTime={activeSession?.startTime}
                    totalTimeToday={state.categories.find(c => c.id === 'cat-sleep')?.totalTimeToday}
                  />
                </div>
              </div>
              {state.isPro && (
                <div className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-emerald-100">
                  Pro
                </div>
              )}
            </header>

            {!betaNoticeDismissed && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center rounded-full border border-emerald-200 bg-white/70 px-2 py-1 text-[11px] font-extrabold tracking-widest text-emerald-800">
                      TEST VERSION
                    </div>

                    <div className="mt-2 text-sm font-semibold text-slate-900">
                      All features are free during testing.
                    </div>

                    <div className="mt-1 text-xs text-slate-700">
                      Try everything. Pro is enabled for testers.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={dismissBetaNotice}
                    className="h-9 w-9 rounded-xl border border-emerald-200 bg-white/70 text-emerald-800"
                    aria-label="Close"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                {latest && (
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-white/60 p-3">
                    <div className="text-xs font-bold tracking-widest text-emerald-800 uppercase">
                      Latest update
                    </div>

                    <div className="mt-1 text-sm font-semibold text-slate-900">
                      {latest.title}
                    </div>

                    <div className="mt-1 text-xs text-slate-600">
                      v{latest.version} · {latest.date}
                    </div>

                    <ul className="mt-3 list-disc pl-5 text-xs text-slate-700 space-y-1">
                      {latest.changes.slice(0, 4).map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>

                    <div className="mt-3 text-xs text-slate-600">
                      Full history: Dev log in Menu.
                    </div>
                  </div>
                )}
              </div>
            )}

            {!hasStartedOnce && (
              <div className="mt-2 flex justify-center">
                <div
                  className="max-w-[320px] rounded-full px-4 py-2 text-center text-xs flex items-center gap-1"
                  style={{
                    color: THEME.COLORS.MUTED,
                    border: `1px solid ${THEME.COLORS.BORDER}`,
                    backgroundColor: "rgba(255,255,255,0.6)" // subtle transparent white
                  }}
                >
                  {language === 'de' ? "Tippe auf eine Aktion, um zu starten." : "Tap one action to start the counter."}
                  <span className="text-[10px] opacity-70">➜</span>
                </div>
              </div>
            )}

            {activeSession && activeCategory && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <TimerDisplay
                  startTime={activeSession.startTime}
                  categoryName={activeCategory.name}
                  categoryEmoji={activeCategory.emoji || activeCategory.icon}
                  typicalDurationMinutes={activeCategory.refinements?.typicalDurationMinutes}
                  accumulatedMs={activeCategory.totalTimeToday || 0}
                  onStop={() => toggleTimer(activeCategory.id)}
                  language={language}
                />
              </div>
            )}

            {!activeSession && sleepSuggestion && (
              <SleepSuggestionCard
                suggestion={sleepSuggestion}
                onAccept={() => acceptSleepSuggestion(sleepSuggestion)}
                onIgnore={() => ignoreSleepSuggestion(sleepSuggestion.id)}
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              {state.categories.filter(cat => cat.id !== 'cat-sleep').map(cat => {
                const isActive = activeSession?.categoryId === cat.id;
                const suggestionActive = isSuggested(cat);
                return (
                  <div key={cat.id} className="relative group">
                    <button
                      onClick={() => toggleTimer(cat.id)}
                      className={`w-full p-6 rounded-[28px] flex flex-col items-center justify-center transition-all active:scale-[0.97] border ${isActive
                        ? 'bg-slate-800 text-white border-slate-800 shadow-xl shadow-slate-200'
                        : suggestionActive
                          ? 'bg-white text-emerald-600 border-emerald-200 shadow-sm animate-pulse'
                          : 'bg-white text-slate-600 border-slate-100 shadow-sm hover:border-slate-200'
                        }`}
                    >
                      <span className="text-3xl mb-2">{cat.emoji || cat.icon}</span>
                      <span className="font-semibold text-xs truncate w-full text-center px-1 tracking-tight">{cat.name}</span>
                      <CategoryDailyTime
                        isActive={isActive}
                        activeStartTime={activeSession?.startTime}
                        totalTimeToday={cat.totalTimeToday}
                        lightMode={isActive}
                      />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingCategory(cat); setIsCategoryModalOpen(true); }}
                      className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                  </div>
                );
              })}
              <button
                onClick={() => { setEditingCategory(undefined); setIsCategoryModalOpen(true); }}
                className="p-6 rounded-[28px] flex flex-col items-center justify-center transition-all border border-dashed border-slate-200 text-slate-300 hover:border-slate-300 hover:bg-slate-50 group active:scale-[0.97]"
              >
                <div className="text-2xl mb-1 group-hover:text-slate-400 transition-colors">⊕</div>
                <span className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Add</span>
              </button>
            </div>

            {!state.isPro && (
              <div className="pt-8 pb-4 text-center">
                <button
                  onClick={() => setCurrentView(View.SETTINGS)}
                  className="text-[10px] text-slate-300 hover:text-slate-500 transition-colors uppercase tracking-[0.2em] font-bold"
                >
                  Unlock Lifetime Pro · €0.99
                </button>
              </div>
            )}
          </div>
        );
      case View.TIMELINE:
        return <Timeline sessions={state.sessions} categories={state.categories} onDeleteSession={deleteSession} language={language} />;
      case View.STATS:
        return <Stats sessions={state.sessions} categories={state.categories} isPro={state.isPro} language={language} />;
      case View.SETTINGS:
        return (
          <Settings
            isPro={state.isPro}
            onUpgrade={upgradeToPro}
            sleepSettings={state.sleepSettings}
            onUpdateSleepSettings={updateSleepSettings}
            categories={state.categories}
            onRefineCategory={refineCategory}
            onEditCategory={(cat) => { setEditingCategory(cat); setIsCategoryModalOpen(true); }}
            onReorderCategory={reorderCategory}
            language={language}
            onChangeLanguage={handleLanguageChoice}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="max-w-md mx-auto min-h-screen pb-safe-area-bottom font-sans selection:bg-emerald-100 transition-colors duration-500 relative overflow-hidden flex flex-col"
      style={{ backgroundColor: THEME.COLORS.BG, color: THEME.COLORS.TEXT }}
    >
      <main className="flex-1 overflow-y-auto hide-scrollbar pt-4">
        {renderView()}
      </main>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        category={editingCategory}
        onClose={() => { setIsCategoryModalOpen(false); setEditingCategory(undefined); }}
        onSave={saveCategory}
        onDelete={deleteCategory}
        language={language}
      />

      {/* 1. Language Modal (highest priority) */}
      {!languageLocked && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div
            className="w-full max-w-sm flex flex-col items-center p-8 transition-all"
            style={{
              backgroundColor: THEME.COLORS.SURFACE,
              borderRadius: "32px",
              boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)"
            }}
          >
            <h2 className="text-xl font-bold mb-6" style={{ color: THEME.COLORS.NAVY }}>Welcome to TimeSplit</h2>
            <p className="mb-8 text-center text-sm" style={{ color: THEME.COLORS.MUTED }}>Please choose your language to start.</p>
            <div className="flex gap-4 w-full justify-center">
              <button
                onClick={() => handleLanguageChoice("de")}
                className="px-8 py-3 rounded-full text-sm font-bold border transition-all active:scale-95 duration-200"
                style={{
                  backgroundColor: THEME.COLORS.SURFACE,
                  color: THEME.COLORS.NAVY,
                  borderColor: THEME.COLORS.BORDER
                }}
              >
                DE
              </button>
              <button
                onClick={() => handleLanguageChoice("en")}
                className="px-8 py-3 rounded-full text-sm font-bold border transition-all active:scale-95 duration-200"
                style={{
                  backgroundColor: THEME.COLORS.SURFACE,
                  color: THEME.COLORS.NAVY,
                  borderColor: THEME.COLORS.BORDER
                }}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Intro Video REMOVED as per request */}

      {/* 3. Tutorial Overlay (active if tutorialOpen) */}
      {tutorialOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <button className="absolute inset-0 w-full h-full cursor-default" onClick={closeTutorial} aria-label="Close tutorial" />
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Steps & Labels */}
            <div className="flex flex-col gap-4">
              {getTutorialSteps(language)[tutorialStep].label && (
                <div className="self-start inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold tracking-widest text-slate-600">
                  {getTutorialSteps(language)[tutorialStep].label}
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {getTutorialSteps(language)[tutorialStep].title}
                </h3>
                <p className="mt-2 text-slate-600 leading-relaxed text-sm">
                  {getTutorialSteps(language)[tutorialStep].body}
                </p>
                {(getTutorialSteps(language)[tutorialStep] as any).tip && (
                  <p className="mt-3 text-xs font-semibold text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                    {(getTutorialSteps(language)[tutorialStep] as any).tip}
                  </p>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={closeTutorial}
                className="text-slate-400 font-semibold text-sm hover:text-slate-600 px-2"
              >
                {/* Simple skip, keeping it English or simple icon for now as it wasn't strictly requested to translate buttons, but Steps were. */}
                Skip
              </button>

              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-300 tracking-widest">
                  {tutorialStep + 1}/{getTutorialSteps(language).length}
                </span>
                <button
                  onClick={() => {
                    const next = tutorialStep + 1;
                    if (next < getTutorialSteps(language).length) {
                      setTutorialStep(next);
                    } else {
                      closeTutorial();
                    }
                  }}
                  className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-200"
                >
                  {tutorialStep === getTutorialSteps(language).length - 1 ? "Done" : "Next"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex justify-between items-center z-50 max-w-md mx-auto rounded-t-[32px] shadow-[0_-8px_30px_rgb(0,0,0,0.02)]">
        <NavButton active={currentView === View.HOME} onClick={() => setCurrentView(View.HOME)} label="Track" icon={<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>} />
        <NavButton active={currentView === View.TIMELINE} onClick={() => setCurrentView(View.TIMELINE)} label="History" icon={<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" /></svg>} />
        <NavButton active={currentView === View.STATS} onClick={() => setCurrentView(View.STATS)} label="Stats" icon={<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>} />
        <NavButton active={currentView === View.SETTINGS} onClick={() => setCurrentView(View.SETTINGS)} label="Menu" icon={<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>} />
      </nav>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, label, icon }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-slate-900' : 'text-slate-300'}`}>
    <div className={`transition-all duration-300 ${active ? 'scale-110' : 'scale-100'}`}>
      {icon}
    </div>
    <span className={`text-[9px] font-bold uppercase tracking-[0.1em] transition-opacity ${active ? 'opacity-100' : 'opacity-40'}`}>{label}</span>
  </button>
);

export default App;
