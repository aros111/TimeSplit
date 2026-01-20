
import React, { useState } from 'react';
import { Category, CategoryRefinement } from '../types';

interface CategoryRefinementModalProps {
  category: Category;
  isOpen: boolean;
  onClose: () => void;
  onSave: (refinements: CategoryRefinement) => void;
}

export const CategoryRefinementModal: React.FC<CategoryRefinementModalProps> = ({ category, isOpen, onClose, onSave }) => {
  const [refinements, setRefinements] = useState<CategoryRefinement>(category.refinements || {});

  if (!isOpen) return null;

  const updateField = (field: keyof CategoryRefinement, value: any) => {
    setRefinements(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{category.emoji || category.icon}</span>
            <h3 className="text-lg font-semibold text-slate-800">{category.name} Refinement</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto hide-scrollbar pb-4">
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Configure soft guidance for this activity. These are optional and do not track automatically.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-2">Time Window</label>
              <div className="flex items-center gap-2">
                <input 
                  type="time" 
                  value={refinements.windowStart || ""} 
                  onChange={e => updateField('windowStart', e.target.value)}
                  className="flex-1 bg-slate-50 rounded-xl p-3 text-sm border-none focus:ring-2 focus:ring-slate-100"
                />
                <span className="text-slate-300">to</span>
                <input 
                  type="time" 
                  value={refinements.windowEnd || ""} 
                  onChange={e => updateField('windowEnd', e.target.value)}
                  className="flex-1 bg-slate-50 rounded-xl p-3 text-sm border-none focus:ring-2 focus:ring-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-2">Typical Duration (Mins)</label>
              <input 
                type="number" 
                placeholder="e.g. 45"
                value={refinements.typicalDurationMinutes || ""} 
                onChange={e => updateField('typicalDurationMinutes', parseInt(e.target.value))}
                className="w-full bg-slate-50 rounded-xl p-3 text-sm border-none focus:ring-2 focus:ring-slate-100"
              />
              <p className="text-[9px] text-slate-400 mt-1">We'll gently check in if you exceed this.</p>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest block mb-2">Daily Target (Mins)</label>
              <input 
                type="number" 
                placeholder="e.g. 120"
                value={refinements.targetMinutes || ""} 
                onChange={e => updateField('targetMinutes', parseInt(e.target.value))}
                className="w-full bg-slate-50 rounded-xl p-3 text-sm border-none focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button 
            onClick={() => onSave(refinements)}
            className="w-full py-4 bg-slate-800 text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-all"
          >
            Save Changes
          </button>
          <button 
            onClick={() => onSave({})}
            className="w-full py-3 text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em] mt-2"
          >
            Reset Refinements
          </button>
        </div>
      </div>
    </div>
  );
};
