"use client";

import { useMemo } from "react";
import type { Card } from "@/types";
import { Youtube, ExternalLink } from "lucide-react";
import { maskWord } from "@/lib/srs/masking";

export function CardDisplay({
  card,
  revealed,
}: {
  card: Card;
  revealed: boolean;
}) {
  const masked = useMemo(() => maskWord(card.english), [card.english]);

  return (
    <div className="min-h-[280px] flex flex-col items-center justify-center p-8 rounded-2xl border bg-card shadow-sm text-center">

      {/* Question - just the masked word, big and clear */}
      {!revealed && (
        <div className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-wide text-foreground">
          {masked}
        </div>
      )}

      {/* Answer revealed - word AND meaning */}
      {revealed && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Full Word */}
          <div className="text-5xl md:text-6xl font-bold text-primary">
            {card.english}
          </div>

          {/* Divider */}
          <div className="w-24 h-1 bg-primary/30 mx-auto rounded" />

          {/* Meaning - prominent */}
          <div className="text-2xl md:text-3xl font-medium text-foreground">
            {card.meaning_1}
          </div>

          {card.meaning_2 && (
            <div className="text-xl text-muted-foreground">{card.meaning_2}</div>
          )}

          {/* Link */}
          {card.video_url && (
            <a
              href={card.video_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-500 hover:underline mt-4"
            >
              <Youtube size={16} />
              <span>Watch</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
