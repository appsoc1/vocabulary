import { createClient } from "@/lib/supabase/server";
import type { Folder } from "@/types";

export async function listFolders(ownerId: string): Promise<(Folder & { count: number })[]> {
  const supabase = await createClient();

  // Join with cards to get count
  // Note: Supabase doesn't support simple join+count in one easy query without view or function if using standard library purely typesafe, 
  // but we can use .select('*, cards(count)') roughly. 
  // Actually simplest is to fetch folders and their card counts.

  const { data, error } = await supabase
    .from("folders")
    .select("*, cards(count)")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((f: any) => ({
    id: f.id,
    owner_id: f.owner_id,
    name: f.name,
    created_at: f.created_at,
    count: f.cards ? f.cards[0].count : 0,
  }));
}

export async function createFolder(ownerId: string, name: string): Promise<Folder> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("folders")
    .insert({
      id: crypto.randomUUID(),
      owner_id: ownerId,
      name,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteFolder(ownerId: string, folderId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("folders")
    .delete()
    .eq("id", folderId)
    .eq("owner_id", ownerId); // Extra safety, though RLS handles it

  if (error) throw error;
}
