// src/lib/srs/queue.ts
import type { Card, Progress } from "@/types";

type ProgressMap = Record<string, Progress | undefined>;

// Build queue with ALL cards from selected folders (not just due ones)
// Cards are sorted by priority: learning > due review > new > not-due review
export function buildQueue(cards: Card[], progressMap: ProgressMap, now = new Date()): string[] {
  const nowMs = now.getTime();

  const learningDue: { id: string; dueMs: number }[] = [];
  const reviewDue: { id: string; dueMs: number }[] = [];
  const reviewNotDue: { id: string; dueMs: number }[] = [];
  const news: string[] = [];

  for (const c of cards) {
    const p = progressMap[c.id];
    if (!p) {
      // No progress = new card
      news.push(c.id);
      continue;
    }

    const dueMs = new Date(p.due_at).getTime();
    const isDue = dueMs <= nowMs;

    if (p.state === "learning") {
      learningDue.push({ id: c.id, dueMs });
    } else if (p.state === "review") {
      if (isDue) {
        reviewDue.push({ id: c.id, dueMs });
      } else {
        // Include not-due cards too, they'll just be at the end
        reviewNotDue.push({ id: c.id, dueMs });
      }
    } else {
      news.push(c.id);
    }
  }

  // Sort by due date (earliest first)
  learningDue.sort((a, b) => a.dueMs - b.dueMs);
  reviewDue.sort((a, b) => a.dueMs - b.dueMs);
  reviewNotDue.sort((a, b) => a.dueMs - b.dueMs);

  // Priority: learning (urgent) > due reviews > new > not-due (for practice)
  return [
    ...learningDue.map(x => x.id),
    ...reviewDue.map(x => x.id),
    ...news,
    ...reviewNotDue.map(x => x.id), // Include these so user can always practice
  ];
}
