import { NextResponse } from "next/server";
import { getOwnerId } from "@/lib/owner";
import { listCardsWithProgress } from "@/lib/db/cards";

// Force Node.js runtime for SQLite compatibility
export const runtime = 'nodejs';

export async function GET(req: Request) {
    try {
        const ownerId = await getOwnerId();
        const { searchParams } = new URL(req.url);

        const folderIdsParam = searchParams.get("folderIds") ?? "";
        const folderIds = folderIdsParam.split(",").map(s => s.trim()).filter(Boolean);

        if (folderIds.length === 0) {
            return NextResponse.json({ cards: [] });
        }

        const cards = await listCardsWithProgress(ownerId, folderIds);
        return NextResponse.json({ cards });
    } catch (error: any) {
        console.error("GET /api/review/session error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
