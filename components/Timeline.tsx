
import React from 'react';
import { Session, Category } from '../types';

interface TimelineProps {
  sessions: Session[];
  categories: Category[];
  onDeleteSession: (id: string) => void;
}

import { translations, Language } from '../translations';

interface TimelineProps {
  sessions: Session[];
  categories: Category[];
  onDeleteSession: (id: string) => void;
  language: Language;
}

export const Timeline: React.FC<TimelineProps> = ({ sessions, categories, onDeleteSession, language }) => {
  const t = translations[language].timeline;
  const locale = language === 'de' ? 'de-DE' : 'en-US';

  const today = new Date().setHours(0, 0, 0, 0);
  const todaysSessions = [...sessions]
    .filter(s => s.startTime >= today)
    .sort((a, b) => b.startTime - a.startTime);

  const getCategory = (id: string) => categories.find(c => c.id === id);

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  };

  const getDuration = (start: number, end?: number) => {
    const duration = (end || Date.now()) - start;
    const mins = Math.floor(duration / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = (mins / 60).toFixed(1);
    return `${hrs}h`;
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="px-4">
        <h1 className="text-2xl font-semibold text-slate-800">{t.title}</h1>
        <p className="text-slate-500 text-sm">{t.subtitle}</p>
      </header>

      <div className="space-y-4 px-4">
        {todaysSessions.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p>{t.noActivity}</p>
          </div>
        ) : (
          todaysSessions.map((session) => {
            const cat = getCategory(session.categoryId);

            return (
              <div key={session.id} className="relative">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                      style={{ backgroundColor: cat?.color || '#eee' }}
                    >
                      {cat?.emoji || cat?.icon || '•'}
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-800">{cat?.name || t.deletedCategory}</h3>
                      <div className="text-xs text-slate-400">
                        {formatTime(session.startTime)} {session.endTime ? `- ${formatTime(session.endTime)}` : t.active}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-500">
                      {getDuration(session.startTime, session.endTime)}
                    </span>
                    <button
                      onClick={() => onDeleteSession(session.id)}
                      className="p-2 text-slate-300 hover:text-red-400 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
