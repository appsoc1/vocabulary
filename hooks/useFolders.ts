"use client";

import { useCallback, useEffect, useState } from "react";
import type { Folder } from "@/types";

export function useFolders() {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchFolders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/folders");
            if (res.ok) {
                const data = await res.json();
                setFolders(data.folders ?? []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFolders();
    }, [fetchFolders]);

    const create = useCallback(async (name: string) => {
        try {
            const res = await fetch("/api/folders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
            if (res.ok) fetchFolders();
        } catch (e) {
            console.error(e);
        }
    }, [fetchFolders]);

    const remove = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/folders?id=${id}`, { method: "DELETE" });
            if (res.ok) fetchFolders();
        } catch (e) {
            console.error(e);
        }
    }, [fetchFolders]);

    return { folders, loading, refresh: fetchFolders, create, remove };
}
