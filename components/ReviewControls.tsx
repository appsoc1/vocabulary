"use client";

import { Eye, X, Check } from "lucide-react";

export function ReviewControls({
  revealed,
  onReveal,
  onRemember,
  onForget,
}: {
  revealed: boolean;
  onReveal: () => void;
  onRemember: () => void;
  onForget: () => void;
}) {
  if (!revealed) {
    return (
      <div className="flex justify-center w-full">
        <button
          onClick={onReveal}
          className="group relative inline-flex h-12 w-full max-w-sm items-center justify-center overflow-hidden rounded-md bg-primary px-8 font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90 shadow-lg hover:shadow-xl"
        >
          <span className="mr-2"><Eye size={18} /></span>
          Reveal Answer
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto animate-in slide-in-from-bottom-2 fade-in duration-300">
      <button
        onClick={onForget}
        className="flex items-center justify-center gap-2 h-14 rounded-xl border-2 border-destructive/20 bg-destructive/10 text-destructive font-semibold hover:bg-destructive hover:text-destructive-foreground transition-all active:scale-95"
      >
        <X size={20} />
        Forget
      </button>
      <button
        onClick={onRemember}
        className="flex items-center justify-center gap-2 h-14 rounded-xl border-2 border-green-500/20 bg-green-500/10 text-green-600 font-semibold hover:bg-green-600 hover:text-white transition-all active:scale-95"
      >
        <Check size={20} />
        Remember
      </button>
    </div>
  );
}
