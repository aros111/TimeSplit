
import React, { useState, useEffect } from 'react';

import { translations, Language } from '../translations';

interface TimerDisplayProps {
  startTime: number;
  categoryName: string;
  categoryEmoji?: string;
  typicalDurationMinutes?: number;
  accumulatedMs?: number;
  onStop: () => void;
  language: Language;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  startTime,
  categoryName,
  categoryEmoji,
  typicalDurationMinutes,
  accumulatedMs = 0,
  onStop,
  language
}) => {
  const t = translations[language].timer;
  const [displayMs, setDisplayMs] = useState(accumulatedMs);

  useEffect(() => {
    const interval = setInterval(() => {
      const sessionElapsed = Date.now() - startTime;
      setDisplayMs(accumulatedMs + sessionElapsed);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, accumulatedMs]);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));

    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const isExceeding = typicalDurationMinutes ? (displayMs / 60000) > typicalDurationMinutes : false;

  return (
    <div className={`bg-white px-6 py-8 rounded-[32px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border flex flex-col items-center justify-center transition-all duration-500 ${isExceeding ? 'border-amber-200' : 'border-slate-100'}`}>
      <div className="text-3xl mb-2">{categoryEmoji}</div>
      <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">{categoryName}</h2>
      <div className="text-5xl font-light tabular-nums text-slate-800 tracking-tight">
        {formatDuration(displayMs)}
      </div>

      {isExceeding && (
        <div className="mt-6 flex flex-col items-center animate-in fade-in slide-in-from-top-2">
          <p className="text-xs text-amber-600 font-medium mb-3">{t.stillDoing} {categoryName}?</p>
          <div className="flex gap-2">
            <button
              onClick={onStop}
              className="px-4 py-2 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl"
            >
              {t.stopNow}
            </button>
            <div className="px-4 py-2 bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-xl">
              {t.continuing}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
