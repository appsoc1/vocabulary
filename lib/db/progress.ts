import { createClient } from "@/lib/supabase/server";
import type { Progress, ProgressState } from "@/types";

export type ProgressPatch = {
  card_id: string;
  due_at: string; // ISO
  interval_days: number;
  ease: number;
  reps: number;
  lapses: number;
  state: ProgressState;
};

export async function listProgressByCardIds(
  ownerId: string,
  cardIds: string[]
): Promise<Progress[]> {
  if (cardIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("progress")
    .select("*")
    .eq("owner_id", ownerId)
    .in("card_id", cardIds);

  if (error) throw error;
  return data;
}

export async function upsertProgress(ownerId: string, patch: ProgressPatch): Promise<Progress> {
  const supabase = await createClient();

  // Using upsert based on unique constraint on card_id
  const { data, error } = await supabase
    .from("progress")
    .upsert({
      id: crypto.randomUUID(),
      owner_id: ownerId,
      ...patch,
      updated_at: new Date().toISOString()
    }, { onConflict: 'card_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}
