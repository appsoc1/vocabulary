"use client";

import { useMemo, useState } from "react";
import type { CardType, Folder } from "@/types";
import { cn } from "@/lib/utils";
import { Book, Video, Link, Check, Plus } from "lucide-react";

export function InputForm({
  type,
  folders,
  onSubmit,
}: {
  type: CardType;
  folders: Folder[];
  onSubmit: (payload: {
    folder_id: string;
    type: CardType;
    english: string;
    meaning_1: string;
    meaning_2?: string | null;
    video_url?: string | null;
    keyword?: string | null;
  }) => Promise<void>;
}) {
  const [folderId, setFolderId] = useState("");
  const [english, setEnglish] = useState("");
  const [meaning1, setMeaning1] = useState("");
  const [meaning2, setMeaning2] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    if (!folderId || !english.trim() || !meaning1.trim()) return false;
    if (type === "sentence" && !keyword.trim()) return false;
    return true;
  }, [folderId, english, meaning1, type, keyword]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    await onSubmit({
      folder_id: folderId,
      type,
      english: english.trim(),
      meaning_1: meaning1.trim(),
      meaning_2: meaning2.trim() ? meaning2.trim() : null,
      video_url: videoUrl.trim() ? videoUrl.trim() : null,
      keyword: type === "sentence" ? (keyword.trim() || null) : null,
    });

    setEnglish("");
    setMeaning1("");
    setMeaning2("");
    setVideoUrl("");
    setKeyword("");
    setIsSubmitting(false);
  };

  return (
    <div className="bg-card border rounded-xl shadow-sm p-6 space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Folder
        </label>
        <select
          value={folderId}
          onChange={(e) => setFolderId(e.target.value)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">-- Select Folder --</option>
          {folders.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">English {type === "word" ? "Word" : "Sentence"}</label>
          <div className="relative">
            <input
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
              placeholder={type === "word" ? "e.g. Epiphany" : "e.g. I had an epiphany yesterday."}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Book className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Meaning 1 (Main)</label>
          <input
            value={meaning1}
            onChange={(e) => setMeaning1(e.target.value)}
            placeholder="e.g. Khoảnh khắc giác ngộ"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Meaning 2 (Optional)</label>
          <input
            value={meaning2}
            onChange={(e) => setMeaning2(e.target.value)}
            placeholder="Secondary meaning..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Video URL (Optional)</label>
          <div className="relative">
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/..."
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <Video className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          </div>
        </div>

        {type === "sentence" && (
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-primary">Hidden Keyword (Required)</label>
            <div className="relative">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Word to hide in the sentence..."
                className="flex h-10 w-full rounded-md border-primary/50 border bg-primary/5 px-3 py-2 pl-9 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <Link className="absolute left-3 top-2.5 size-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">This part will be masked as `___` during review.</p>
          </div>
        )}
      </div>

      <div className="pt-4">
        <button
          disabled={!canSubmit || isSubmitting}
          onClick={handleSubmit}
          className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : <><Plus className="mr-2 size-4" /> Add to Collection</>}
        </button>
      </div>
    </div>
  );
}
