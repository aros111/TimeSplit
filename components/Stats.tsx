
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Session, Category } from '../types';

interface StatsProps {
  sessions: Session[];
  categories: Category[];
  isPro: boolean;
}

import { translations, Language } from '../translations';

interface StatsProps {
  sessions: Session[];
  categories: Category[];
  isPro: boolean;
  language: Language;
}

export const Stats: React.FC<StatsProps> = ({ sessions, categories, isPro, language }) => {
  const t = translations[language].stats;
  const today = new Date().setHours(0, 0, 0, 0);
  const todaysSessions = sessions.filter(s => s.startTime >= today);

  const dataMap: Record<string, number> = {};
  let totalTracked = 0;

  todaysSessions.forEach(s => {
    const duration = (s.endTime || Date.now()) - s.startTime;
    dataMap[s.categoryId] = (dataMap[s.categoryId] || 0) + duration;
    totalTracked += duration;
  });

  const chartData = Object.entries(dataMap).map(([id, duration]) => {
    const cat = categories.find(c => c.id === id);
    return {
      name: cat?.name || 'Unknown',
      value: duration,
      color: cat?.color || '#eee',
      icon: cat?.emoji || cat?.icon || '•'
    };
  }).sort((a, b) => b.value - a.value);

  const formatDuration = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    if (mins < 60) return `${mins}m`;
    return `${(mins / 60).toFixed(1)}h`;
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="px-4">
        <h1 className="text-2xl font-semibold text-slate-800">{t.title}</h1>
        <p className="text-slate-500 text-sm">{t.subtitle}</p>
      </header>

      <div className="px-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatDuration(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300">
                {t.noData}
              </div>
            )}
          </div>
          <div className="mt-2 text-center">
            <div className="text-3xl font-light text-slate-700">{formatDuration(totalTracked)}</div>
            <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">{t.totalTracked}</div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {chartData.map((item, i) => (
          <div key={i} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-50">
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium text-slate-700">{item.name}</span>
            </div>
            <div className="text-right">
              <div className="font-medium text-slate-800">{formatDuration(item.value)}</div>
              <div className="text-xs text-slate-400">
                {((item.value / totalTracked) * 100).toFixed(0)}% {t.percentOfSplit}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isPro && (
        <div className="mx-4 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
          <p className="text-sm text-slate-500 italic">{t.upgradeText}</p>
        </div>
      )}
    </div>
  );
};
