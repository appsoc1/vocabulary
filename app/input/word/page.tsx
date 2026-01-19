"use client";

import { useState } from "react";
import { useFolders } from "@/hooks/useFolders";
import { useCards } from "@/hooks/useCards";
import { Save, Loader2 } from "lucide-react";

export default function InputWordPage() {
  const { folders } = useFolders();
  const { create } = useCards();

  const [folderId, setFolderId] = useState("");
  const [english, setEnglish] = useState("");
  const [vietnamese, setVietnamese] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderId || !english || !vietnamese) {
      setMessage("Please fill in all required fields!");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await create({
        folder_id: folderId,
        type: "word",
        english: english.trim(),
        meaning_1: vietnamese.trim(),
        video_url: link.trim() || null,
      });

      // Clear form on success
      setEnglish("");
      setVietnamese("");
      setLink("");
      setMessage("Word added successfully!");
    } catch (err: any) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add New Word</h2>
        <p className="text-muted-foreground">Add vocabulary to your collection.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Folder Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Folder</label>
          <select
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          >
            <option value="">-- Select folder --</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        {/* English Word */}
        <div className="space-y-2">
          <label className="text-sm font-medium">English Word</label>
          <input
            type="text"
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            placeholder="e.g. Hello"
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>

        {/* Vietnamese Meaning */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Meaning</label>
          <input
            type="text"
            value={vietnamese}
            onChange={(e) => setVietnamese(e.target.value)}
            placeholder="e.g. Xin chào"
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>

        {/* Link (optional) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Link (optional)</label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://..."
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* Message */}
        {message && (
          <div className={`text-sm text-center font-medium ${message.includes("successfully") ? "text-green-600" : "text-destructive"}`}>
            {message}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Add Word
        </button>
      </form>
    </div>
  );
}
