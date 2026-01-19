"use client";

import { useCallback, useState } from "react";
import type { Card, CardType } from "@/types";

export type CreateCardPayload = {
  folder_id: string;
  type: CardType;
  english: string;
  meaning_1: string;
  meaning_2?: string | null;
  video_url?: string | null;
  keyword?: string | null;
};

export function useCards() {
  const [loading, setLoading] = useState(false);

  const listByFolders = useCallback(async (folderIds: string[]): Promise<Card[]> => {
    setLoading(true);
    try {
      const qs = folderIds.length ? `?folderIds=${encodeURIComponent(folderIds.join(","))}` : "";
      const res = await fetch(`/api/cards${qs}`);
      const data = await res.json();
      return data.cards ?? [];
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: CreateCardPayload) => {
    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error ?? "Create card failed");
    }
    return (await res.json()).card as Card;
  }, []);

  return { loading, listByFolders, create };
}
