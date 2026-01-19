// src/lib/srs/algorithm.ts
import type { Progress, ProgressState } from "@/types";

export type SrsConfig = {
  easeStart: number;
  easeMin: number;
  easeMax: number;
  easeRememberBonus: number;
  easeForgetPenalty: number;

  // Binary SRS steps
  firstIntervalDays: number;  // reps=1
  secondIntervalDays: number; // reps=2

  // When forget: schedule near-future for persistence
  forgetDelayMinutes: number;
};

export const DEFAULT_SRS_CONFIG: SrsConfig = {
  easeStart: 2.3,
  easeMin: 1.3,
  easeMax: 2.8,
  easeRememberBonus: 0.05,
  easeForgetPenalty: 0.2,

  firstIntervalDays: 1,
  secondIntervalDays: 3,

  forgetDelayMinutes: 10,
};

export type ProgressLike = Partial<Progress> & { card_id: string };

export function normalizeProgress(p: ProgressLike, cfg = DEFAULT_SRS_CONFIG) {
  return {
    card_id: p.card_id,
    due_at: p.due_at ?? new Date().toISOString(),
    interval_days: typeof p.interval_days === "number" ? p.interval_days : 0,
    ease: typeof p.ease === "number" ? p.ease : cfg.easeStart,
    reps: typeof p.reps === "number" ? p.reps : 0,
    lapses: typeof p.lapses === "number" ? p.lapses : 0,
    state: (p.state ?? "new") as ProgressState,
  };
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}
function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60_000);
}

/**
 * Nhớ/Quên (binary) tối ưu theo hướng SM-2:
 * - Nhớ: interval tăng theo ease (cấp số nhân sau 2 mốc đầu)
 * - Quên: reset reps, giảm ease, đưa về learning + due gần
 */
export function applyRemember(input: ProgressLike, now = new Date(), cfg = DEFAULT_SRS_CONFIG) {
  const p = normalizeProgress(input, cfg);

  const ease = Math.min(cfg.easeMax, p.ease + cfg.easeRememberBonus);
  const reps = p.reps + 1;

  let interval_days: number;

  if (p.state === "new" || p.state === "learning") {
    if (reps === 1) {
      interval_days = cfg.firstIntervalDays;
      // Stay in 'learning' or move from 'new' to 'learning'
      // Only 'review' implies graduated.
    } else if (reps === 2) {
      interval_days = cfg.secondIntervalDays;
    } else {
      const base = Math.max(p.interval_days, cfg.secondIntervalDays);
      interval_days = base * ease;
    }

    // Graduate to review only if we are past the fixed intervals?
    // Doc says: "NẾU reps >= 3: ... state = 'review'". This likely implies graduation.
    // If we set review earlier, we miss the reps=2 check next time.
    var newState: ProgressState = "learning";
    if (reps >= 3) {
      newState = "review";
    }
  } else {
    // Already review
    const base = Math.max(p.interval_days, 1);
    interval_days = base * ease;
    var newState: ProgressState = "review";
  }

  const due_at = addDays(now, interval_days).toISOString();

  return {
    card_id: p.card_id,
    due_at,
    interval_days,
    ease,
    reps,
    lapses: p.lapses,
    state: newState,
  };
}

export function applyForget(input: ProgressLike, now = new Date(), cfg = DEFAULT_SRS_CONFIG) {
  const p = normalizeProgress(input, cfg);

  const ease = Math.max(cfg.easeMin, p.ease - cfg.easeForgetPenalty);
  const due_at = addMinutes(now, cfg.forgetDelayMinutes).toISOString();

  return {
    card_id: p.card_id,
    due_at,
    interval_days: 0,
    ease,
    reps: 0,
    lapses: p.lapses + 1,
    state: "learning" as ProgressState,
  };
}
