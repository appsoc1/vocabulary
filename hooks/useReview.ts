"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";

import type { Card, Progress } from "@/types";
import type { CardWithProgress } from "@/lib/db/cards";
import { buildQueue } from "@/lib/srs/queue";
import { applyForget, applyRemember } from "@/lib/srs/algorithm";

type ProgressMap = Record<string, Progress | undefined>;

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

export function useReview(cardsWithProgress: CardWithProgress[]) {
  const [progressMap, setProgressMap] = useState<ProgressMap>({});
  const [queue, setQueue] = useState<string[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // No loading state needed since data is passed in ready
  const loading = false;

  const cardById = useMemo(() => {
    const m: Record<string, Card> = {};
    for (const c of cardsWithProgress) m[c.id] = c;
    return m;
  }, [cardsWithProgress]);

  // Init queue and map from props
  useEffect(() => {
    const map: ProgressMap = {};
    for (const c of cardsWithProgress) {
      if (c.progress) map[c.id] = c.progress;
    }
    setProgressMap(map);

    const q = buildQueue(cardsWithProgress, map, new Date());
    console.log("[DEBUG] Initialized Queue with joined data:", q.length);

    setQueue(q);
    setQueueIndex(0);
    setRevealed(false);
  }, [cardsWithProgress]);


  const currentId = queue[queueIndex] ?? null;
  const currentCard = currentId ? cardById[currentId] : null;
  const currentProgress = currentId ? progressMap[currentId] : undefined;



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
