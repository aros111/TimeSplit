import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Category } from "../types";
import { translations, Language } from "../translations";

type CategoryModalProps = {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: { name: string; emoji?: string; icon?: string; color: string }) => void;
  onDelete?: () => void;
  language: Language;
};

// Falls du in deiner alten Datei schon COLORS hattest: gern ersetzen.
// Sonst ist das hier safe.
const COLORS = ["#E2E8F0", "#BFDBFE", "#BBF7D0", "#FDE68A", "#FBCFE8", "#DDD6FE"];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  category,
  isOpen,
  onClose,
  onSave,
  onDelete,
  language,
}) => {
  // ✅ Hooks dürfen NIE in if/else oder nach return stehen.
  // Alles hier oben = keine React Hook Hölle mehr.

  const t = useMemo(() => {
    return (
      (translations as any)?.[language]?.modal ??
      (translations as any)?.en?.modal ?? {
        editTitle: "Edit category",
        newTitle: "New category",
        nameLabel: "Name",
        namePlaceholder: "Category name",
        emojiLabel: "Emoji / short text",
        colorLabel: "Color",
        save: "Save",
        delete: "Delete",
        cancel: "Cancel",
      }
    );
  }, [language]);

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState<string>("");
  const [color, setColor] = useState(COLORS[0]);

  const emojiInputRef = useRef<HTMLInputElement>(null);

  const isSleep = useMemo(() => {
    return category?.id === "cat-sleep" || category?.id === "sleep";
  }, [category]);

  useEffect(() => {
    if (category) {
      setName(category.name ?? "");
      // akzeptiert emoji ODER icon (dein Code nutzt beides gemischt)
      setEmoji(((category as any).emoji as string) || ((category as any).icon as string) || "");
      setColor(((category as any).color as string) || COLORS[0]);
    } else {
      setName("");
      setEmoji("");
      setColor(COLORS[0]);
    }
  }, [category, isOpen]);

  // ✅ Early return NACH Hooks
  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    // In deinem Projekt scheint es: emoji ODER short text in "icon".
    // Wir speichern beides kompatibel.
    const e = (emoji || "").trim();

    onSave({
      name: trimmed,
      emoji: e ? e : undefined,
      icon: e ? e : undefined,
      color,
    });
    onClose();
  };

  const handleDelete = () => {
    if (!onDelete) return;
    onDelete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 p-3">
      <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-800">
            {category ? (t?.editTitle ?? "Edit") : (t?.newTitle ?? "New")}
          </h3>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close">
            ✕
          </button>
        </div>

        {/* Name */}
        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
          {t?.nameLabel ?? "Name"}
        </label>
        <input
          disabled={isSleep}
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t?.namePlaceholder ?? "Category name"}
          className="w-full mt-2 p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-slate-300"
        />

        {/* Emoji / Short text */}
        <div className="mt-4">
          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
            {t?.emojiLabel ?? "Emoji / short text"}
          </label>
          <div className="flex gap-2 mt-2">
            <input
              ref={emojiInputRef}
              disabled={isSleep}
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="🙂 oder AB"
              className="flex-1 p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-slate-300"
            />
            <button
              type="button"
              disabled={isSleep}
              onClick={() => {
                try {
                  emojiInputRef.current?.focus();
                } catch { }
              }}
              className="px-4 rounded-2xl border border-slate-200 text-slate-700 font-semibold"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Colors */}
        <div className="mt-5">
          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
            {t?.colorLabel ?? "Color"}
          </label>
          <div className="mt-2 flex gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-10 w-16 rounded-2xl border ${color === c ? "border-slate-900" : "border-slate-200"}`}
                style={{ backgroundColor: c }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full rounded-2xl bg-slate-900 py-3 text-white text-sm font-semibold disabled:opacity-60"
          >
            {t?.save ?? "Save"}
          </button>

          {category && onDelete && !isSleep && (
            <button
              type="button"
              onClick={handleDelete}
              className="w-full rounded-2xl border border-red-200 bg-red-50 py-3 text-red-700 text-sm font-semibold"
            >
              {t?.delete ?? "Delete"}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-slate-900 text-sm font-semibold"
          >
            {t?.cancel ?? "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};
