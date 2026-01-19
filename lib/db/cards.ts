import { createClient } from "@/lib/supabase/server";
import type { Card, CardType, Progress } from "@/types";

export type CreateCardInput = {
  folder_id: string;
  type: CardType;
  english: string;
  meaning_1: string;
  meaning_2?: string | null;
  video_url?: string | null;
  keyword?: string | null;
};

export async function listCards(ownerId: string, folderIds: string[]): Promise<Card[]> {
  if (folderIds.length === 0) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("owner_id", ownerId)
    .in("folder_id", folderIds)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createCard(ownerId: string, input: CreateCardInput): Promise<Card> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cards")
    .insert({
      id: crypto.randomUUID(),
      owner_id: ownerId,
      ...input,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createCardsBulk(ownerId: string, inputs: CreateCardInput[]) {
  const supabase = await createClient();
  if (inputs.length === 0) return { inserted: 0, skipped: 0 };

  // 1. Get all existing english words for this user to check duplicates
  // Optimization: If inputs is small, check efficiently. If huge, might limit. 
  // For now, let's fetch all english words for the user (assuming < 10k is fine for simple app)
  // or better, filter by only the words we are trying to insert using .in().

  const candidateWords = inputs.map(i => i.english.trim());

  // NOTE: .in() might fail if too many items. Batching is safer but for now < 1000 rows is fine.
  const { data: existing, error: fetchError } = await supabase
    .from("cards")
    .select("english")
    .eq("owner_id", ownerId)
    .in("english", candidateWords);

  if (fetchError) throw fetchError;

  const existingSet = new Set(existing?.map((e: { english: string }) => e.english) || []);

  // 2. Filter out duplicates
  const toInsert = inputs.filter(i => !existingSet.has(i.english.trim()));

  if (toInsert.length === 0) {
    return { inserted: 0, skipped: inputs.length };
  }

  // 3. Insert new
  const { error: insertError } = await supabase
    .from("cards")
    .insert(
      toInsert.map(i => ({
        id: crypto.randomUUID(),
        owner_id: ownerId,
        ...i
      }))
    );

  if (insertError) throw insertError;

  return { inserted: toInsert.length, skipped: inputs.length - toInsert.length };
}

export async function deleteCard(ownerId: string, cardId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("cards")
    .delete()
    .eq("id", cardId)
    .eq("owner_id", ownerId);

  if (error) throw error;
}

export type CardWithProgress = Card & { progress: Progress | null };

export async function listCardsWithProgress(ownerId: string, folderIds: string[]): Promise<CardWithProgress[]> {
  if (folderIds.length === 0) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cards")
    .select("*, progress(*)")
    .eq("owner_id", ownerId)
    .in("folder_id", folderIds)
    .order("created_at", { ascending: true });

  if (error) throw error;

  // Supabase returns progress as an array (relation) or object. 
  // Since unique(card_id), it might be an array of 1 or null depending on definition.
  // Actually, usually 1-to-1 relationships are queried as object if defined correctly, or array if not.
  // We'll map it to enforce our type.
  return (data as any[]).map(item => ({
    ...item,
    progress: Array.isArray(item.progress) ? item.progress[0] || null : item.progress || null
  }));
}
