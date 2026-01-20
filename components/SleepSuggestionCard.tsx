
import React from 'react';
import { SleepSuggestion } from '../types';

interface SleepSuggestionCardProps {
  suggestion: SleepSuggestion;
  onAccept: () => void;
  onIgnore: () => void;
}

export const SleepSuggestionCard: React.FC<SleepSuggestionCardProps> = ({ suggestion, onAccept, onIgnore }) => {
  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-xl">🌙</div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Sleep Suggestion</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Based on app inactivity</p>
        </div>
      </div>
      
      <div className="bg-slate-50 rounded-2xl p-4 mb-6">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-2xl font-light text-slate-800">
              {formatTime(suggestion.startTime)} – {formatTime(suggestion.endTime)}
            </div>
            <div className="text-xs text-indigo-500 font-medium mt-1">
              Total rest: {formatDuration(suggestion.durationMs)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={onIgnore}
          className="py-3 px-4 rounded-xl text-xs font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-colors"
        >
          Ignore
        </button>
        <button 
          onClick={onAccept}
          className="py-3 px-4 bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest active:scale-95 transition-all"
        >
          Accept
        </button>
      </div>
    </div>
  );
};
