"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import type { Card, Progress } from "@/types";
import { buildQueue } from "@/lib/srs/queue";
import { applyForget, applyRemember } from "@/lib/srs/algorithm";

type ProgressMap = Record<string, Progress | undefined>;

async function fetchProgress(cardIds: string[]) {
  if (cardIds.length === 0) return [];
  const qs = `?cardIds=${encodeURIComponent(cardIds.join(","))}`;
  const res = await fetch(`/api/progress${qs}`);
  const data = await res.json();
  return (data.progress ?? []) as Progress[];
}

async function saveProgress(patch: {
  card_id: string;
  due_at: string;
  interval_days: number;
  ease: number;
  reps: number;
  lapses: number;
  state: "new" | "learning" | "review";
}) {
  const res = await fetch("/api/progress", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Save progress failed");
  const data = await res.json();
  return data.progress as Progress;
}

export function useReview(cards: Card[]) {
  const [progressMap, setProgressMap] = useState<ProgressMap>({});
  const [queue, setQueue] = useState<string[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);

  const cardById = useMemo(() => {
    const m: Record<string, Card> = {};
    for (const c of cards) m[c.id] = c;
    return m;
  }, [cards]);

  const currentId = queue[queueIndex] ?? null;
  const currentCard = currentId ? cardById[currentId] : null;
  const currentProgress = currentId ? progressMap[currentId] : undefined;

  // init progress + queue
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const ids = cards.map(c => c.id);
        const prog = await fetchProgress(ids);
        const map: ProgressMap = {};
        for (const p of prog) map[p.card_id] = p;

        setProgressMap(map);

        const q = buildQueue(cards, map, new Date());
        console.log("[DEBUG] Cards:", cards.length, "Queue:", q.length, q);
        setQueue(q);
        setQueueIndex(0);
        setRevealed(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [cards]);

  const reveal = useCallback(() => setRevealed(true), []);

  const answerRemember = useCallback(async () => {
    if (!currentId) return;
    const now = new Date();

    const patch = applyRemember({ card_id: currentId, ...(currentProgress ?? {}) }, now);
    const saved = await saveProgress(patch);

    setProgressMap(prev => ({ ...prev, [currentId]: saved }));
    setRevealed(false);
    setQueueIndex(prev => prev + 1);
  }, [currentId, currentProgress]);

  const answerForget = useCallback(async () => {
    if (!currentId) return;
    const now = new Date();

    const patch = applyForget({ card_id: currentId, ...(currentProgress ?? {}) }, now);
    const saved = await saveProgress(patch);

    setProgressMap(prev => ({ ...prev, [currentId]: saved }));
    setRevealed(false);

    // Add current card back to end of queue for repeat
    setQueue(prev => [...prev, currentId]);
    setQueueIndex(prev => prev + 1);
  }, [currentId, currentProgress]);

  const stats = useMemo(() => {
    return {
      total: queue.length,
      consumedBase: queueIndex,
      repeatCount: Math.max(0, queue.length - queueIndex - 1),
      position: queueIndex,
    };
  }, [queue.length, queueIndex]);

  return {
    loading,
    currentCard,
    revealed,
    reveal,
    answerRemember,
    answerForget,
    stats,
  };
}
