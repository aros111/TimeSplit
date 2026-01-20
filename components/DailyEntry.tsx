import React from "react";

type DevLogEntry = {
  version: string;
  date?: string;
  title: string;
  changes: string[];
};

type DailyEntryProps = {
  latestDevLog: DevLogEntry | null;
  hasNewDevLog: boolean;
  onOpenDevlog: () => void;
  onOpenFeedback: () => void;
  onContinue: () => void;
};

export const DailyEntry: React.FC<DailyEntryProps> = ({
  latestDevLog,
  hasNewDevLog,
  onOpenDevlog,
  onOpenFeedback,
  onContinue,
}) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.25)" }}
        onClick={onContinue}
      />

      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-2xl flex items-center justify-center font-black"
            style={{
              background: "rgba(20,184,166,0.10)",
              border: "1px solid rgba(20,184,166,0.25)",
              boxShadow: "0 0 24px rgba(20,184,166,0.35)",
              color: "rgb(20,184,166)",
              letterSpacing: "-0.04em",
            }}
            title="TimeSplit"
          >
            Y
          </div>

          <div className="min-w-0">
            <div className="text-lg font-extrabold text-slate-900">
              Wie verteilst du heute deine Zeit?
            </div>
            <div className="text-sm text-slate-600">
              Neuigkeiten, Feedback, dann geht’s los.
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-bold tracking-widest text-slate-600 uppercase">
              Was ist neu?
            </div>
            {hasNewDevLog && (
              <div className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                NEW
              </div>
            )}
          </div>

          {latestDevLog ? (
            <>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                {latestDevLog.title}
              </div>

              <div className="mt-1 text-xs text-slate-500">
                v{latestDevLog.version}
                {latestDevLog.date ? ` · ${latestDevLog.date}` : ""}
              </div>

              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {(latestDevLog.changes || []).slice(0, 3).map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>

              <button
                type="button"
                onClick={onOpenDevlog}
                className="mt-3 w-full rounded-2xl border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-900"
              >
                Devlog öffnen
              </button>
            </>
          ) : (
            <div className="mt-2 text-sm text-slate-600">
              Devlog ist leer.
            </div>
          )}
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-bold tracking-widest text-slate-600 uppercase">
            Feedback
          </div>
          <div className="mt-1 text-sm text-slate-700">
            Was nervt? Was fehlt? Sag’s kurz, das landet direkt bei dir.
          </div>
          <button
            type="button"
            onClick={onOpenFeedback}
            className="mt-3 w-full rounded-2xl bg-slate-900 py-2 text-sm font-semibold text-white"
          >
            Feedback geben
          </button>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-4 w-full rounded-2xl py-3 text-sm font-semibold"
          style={{
            background: "rgba(20,184,166,0.12)",
            border: "1px solid rgba(20,184,166,0.25)",
            color: "rgb(15,118,110)",
          }}
        >
          Weiter
        </button>

        <div className="mt-3 text-center text-xs text-slate-400">
          (max. 1x pro Tag)
        </div>
      </div>
    </div>
  );
};
