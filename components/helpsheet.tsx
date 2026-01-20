// src/components/HelpSheet.tsx
import React, { useEffect } from "react";

export type HelpSheetItem = {
  title: string;
  body: string;
};

type HelpSheetProps = {
  open: boolean;
  title: string;
  body?: string;
  items?: HelpSheetItem[];
  onClose: () => void;
};

export const HelpSheet: React.FC<HelpSheetProps> = ({
  open,
  title,
  body,
  items,
  onClose,
}) => {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* Sheet */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto max-w-xl rounded-t-3xl bg-white shadow-xl border border-slate-200 overflow-hidden">
          <div className="relative px-4 pt-3 pb-2">
            <div className="h-1.5 w-12 rounded-full bg-slate-200 mx-auto" />

            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-3 h-9 w-9 rounded-xl border border-slate-200 text-slate-700 bg-white"
              aria-label="Close"
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* IMPORTANT:
              Extra bottom padding so the sheet content is NEVER covered
              by the bottom navigation bar.
           */}
          <div
            className="px-5 pb-6"
            style={{
              paddingBottom:
                "calc(env(safe-area-inset-bottom, 0px) + 96px)",
            }}
          >
            <div className="text-sm font-bold tracking-widest text-slate-500 uppercase">
              Help
            </div>

            <div className="mt-1 text-lg font-extrabold text-slate-900">
              {title}
            </div>

            {body && (
              <div className="mt-2 text-sm text-slate-700 whitespace-pre-line">
                {body}
              </div>
            )}

            {items && items.length > 0 && (
              <div className="mt-4 space-y-3">
                {items.map((it, idx) => (
                  <div
                    key={`${idx}-${it.title}`}
                    className="rounded-2xl border border-slate-200 p-3"
                  >
                    <div className="text-sm font-semibold text-slate-900">
                      {it.title}
                    </div>
                    <div className="mt-1 text-sm text-slate-700 whitespace-pre-line">
                      {it.body}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-2xl bg-slate-900 py-3 text-white text-sm font-semibold"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

type HelpIconProps = {
  label?: string;
  onClick: () => void;
};

export const HelpIcon: React.FC<HelpIconProps> = ({ label, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label ?? "Help"}
      title={label ?? "Help"}
      className="h-9 w-9 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center justify-center font-extrabold"
    >
      ?
    </button>
  );
};
