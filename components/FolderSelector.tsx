"use client";

import type { Folder } from "@/types";
import { Check, Folder as FolderIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function FolderSelector({
  folders,
  selected,
  onToggle,
}: {
  folders: Folder[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {folders.map(f => {
        const isSelected = selected.includes(f.id);
        return (
          <div
            key={f.id}
            onClick={() => onToggle(f.id)}
            className={cn(
              "cursor-pointer group relative flex items-center gap-3 rounded-lg border p-4 transition-all hover:shadow-md",
              isSelected
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "bg-card hover:border-primary/50"
            )}
          >
            <div className={cn(
              "flex size-10 items-center justify-center rounded-full transition-colors",
              isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
            )}>
              {isSelected ? <Check size={18} /> : <FolderIcon size={18} />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{f.name}</div>
              <div className="text-xs text-muted-foreground">{(f as any).count ?? 0} cards</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
