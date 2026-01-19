"use client";

import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";

export function UserNav() {
    const { user, signOut } = useAuth();

    if (!user) return null;

    return (
        <div className="px-2 py-2">
            <button
                onClick={() => signOut()}
                className="flex w-full items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors text-sm font-medium text-left text-muted-foreground"
            >
                <LogOut size={20} />
                <span>Sign Out</span>
            </button>
            <div className="px-3 py-1 text-xs text-muted-foreground truncate">
                {user.email}
            </div>
        </div>
    );
}
