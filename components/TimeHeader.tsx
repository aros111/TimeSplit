import React, { useState, useEffect } from 'react';
import { Language } from '../translations';

const getISOWeek = (date: Date) => {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
};

const getSeason = (date: Date) => {
  const month = date.getMonth(); // 0-indexed
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
};

const headerTranslations = {
  en: { cw: 'CW', winter: 'Winter', spring: 'Spring', summer: 'Summer', autumn: 'Autumn' },
  de: { cw: 'KW', winter: 'Winter', spring: 'Frühling', summer: 'Sommer', autumn: 'Herbst' }
};

interface TimeHeaderProps {
  language: Language;
}

export const TimeHeader: React.FC<TimeHeaderProps> = ({ language }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const t = headerTranslations[language] || headerTranslations.en;
  const locale = language === 'de' ? 'de-DE' : 'en-US';

  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString(locale, {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const cw = getISOWeek(now);
  const seasonKey = getSeason(now) as keyof typeof t;
  const seasonLabel = t[seasonKey];

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 py-2 border-b border-slate-50">
      <div className="flex items-center gap-1.5 shrink-0 text-slate-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
        <span className="tabular-nums">{timeStr}</span>
      </div>
      <span className="opacity-20">•</span>
      <span className="truncate">{dateStr}</span>
      <span className="opacity-20">•</span>
      <span className="shrink-0">{t.cw} {cw.toString().padStart(2, '0')}</span>
      <span className="opacity-20">•</span>
      <span className="shrink-0">{seasonLabel}</span>
    </div>
  );
};
