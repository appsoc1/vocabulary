"use client";

import { useState } from "react";
import Link from "next/link";
import { useFolders } from "@/hooks/useFolders";
import { PlayCircle, Trash2 } from "lucide-react";

export default function FoldersPage() {
  const { folders, create, remove, loading } = useFolders();
  const [name, setName] = useState("");

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manage Folders</h2>
        <p className="text-muted-foreground">Organize your vocabulary into collections.</p>
      </div>

      <div className="flex gap-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New folder name..."
          className="flex-1 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          disabled={!name.trim()}
          onClick={async () => {
            await create(name.trim());
            setName("");
          }}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          Create Folder
        </button>
      </div>

      {loading && <div className="text-center text-muted-foreground py-4">Loading folders...</div>}

      <div className="grid gap-3">
        {folders.map(f => (
          <div key={f.id} className="flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
            <div className="font-medium">{f.name}</div>
            <div className="flex items-center gap-2">
              <Link
                href={`/review?folders=${f.id}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                <PlayCircle size={16} />
                Learn
              </Link>
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete "${f.name}"?`)) {
                    remove(f.id);
                  }
                }}
                className="inline-flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80 font-medium px-3 py-1.5 rounded-md hover:bg-destructive/10 transition-colors"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
        {!loading && folders.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            No folders yet. Create your first one above!
          </div>
        )}
      </div>
    </div>
  );
}
