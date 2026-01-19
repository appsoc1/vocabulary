"use client";

import { useMemo, useState } from "react";
import { useFolders } from "@/hooks/useFolders";
import { FolderSelector } from "@/components/FolderSelector";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";

export default function HomePage() {
  const { folders, loading } = useFolders();
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const canStart = useMemo(() => selected.length > 0, [selected]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-muted-foreground mt-1">Select folders to start your review session.</p>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6 flex flex-col gap-1.5 border-b">
          <h3 className="text-lg font-semibold leading-none tracking-tight">Start Review</h3>
          <p className="text-sm text-muted-foreground">Choose the folders you want to review today.</p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8 text-muted-foreground">Loading...</div>
          ) : folders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No folders found. Create one in the Folders tab.
            </div>
          ) : (
            <FolderSelector folders={folders} selected={selected} onToggle={toggle} />
          )}
        </div>

        <div className="p-6 pt-0 flex justify-end">
          <button
            disabled={!canStart}
            onClick={() => router.push(`/review?folders=${encodeURIComponent(selected.join(","))}`)}
            className={`
              inline-flex items-center justify-center rounded-lg px-8 py-3 text-sm font-medium transition-all shadow-lg
              ${canStart
                ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95"
                : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
              }
            `}
          >
            <Play className="mr-2 size-4 fill-current" />
            Start Review
          </button>
        </div>
      </div>
    </div>
  );
}
