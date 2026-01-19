// src/types/index.ts
export type CardType = "word" | "sentence";
export type ProgressState = "new" | "learning" | "review";

export type Folder = {
  id: string;
  name: string;
  created_at: string;
};

export type Card = {
  id: string;
  folder_id: string;
  type: CardType;
  english: string;
  meaning_1: string;
  meaning_2: string | null;
  video_url: string | null;
  keyword: string | null;
  created_at: string;
};

export type Progress = {
  id: string;
  card_id: string;
  due_at: string;
  interval_days: number;
  ease: number;
  reps: number;
  lapses: number;
  state: ProgressState;
  updated_at: string;
};
