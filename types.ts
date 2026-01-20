
export type CategoryRefinement = {
  windowStart?: string; // "HH:mm"
  windowEnd?: string;   // "HH:mm"
  typicalDurationMinutes?: number;
  targetMinutes?: number;
  daysOfWeek?: number[]; // 0-6
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  isCustom?: boolean;
  refinements?: CategoryRefinement;
};

export type Session = {
  id: string;
  categoryId: string;
  startTime: number;
  endTime?: number;
};

export type SleepSettings = {
  nightStartHour: number; // 0-23
  nightEndHour: number;   // 0-23
  minGapHours: number;    // minimum inactivity to suggest sleep
};

export type AppState = {
  activeSessionId: string | null;
  sessions: Session[];
  categories: Category[];
  isPro: boolean;
  sleepSettings: SleepSettings;
  dismissedSuggestionId?: string; 
};

export type SleepSuggestion = {
  id: string;
  startTime: number;
  endTime: number;
  durationMs: number;
};

export enum View {
  HOME = 'home',
  TIMELINE = 'timeline',
  STATS = 'stats',
  SETTINGS = 'settings'
}
