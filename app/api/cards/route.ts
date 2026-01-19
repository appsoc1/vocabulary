import { NextResponse } from "next/server";
import { getOwnerId } from "@/lib/owner";
import { listCards, createCard } from "@/lib/db/cards";

// Force Node.js runtime for SQLite compatibility
export const runtime = 'nodejs';

export async function GET(req: Request) {
    try {
        const ownerId = await getOwnerId();
        const { searchParams } = new URL(req.url);
        // Support both folderIds (comma-separated) and folder_id (single)
        const folderIdsParam = searchParams.get("folderIds") ?? searchParams.get("folder_id") ?? "";
        const folderIds = folderIdsParam.split(",").filter(Boolean);

        const cards = await listCards(ownerId, folderIds);
        return NextResponse.json({ cards });
    } catch (error: any) {
        console.error("GET /api/cards error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const ownerId = await getOwnerId();
        const body = await req.json().catch(() => ({}));

        // Normalize field names (support both camelCase and snake_case)
        const normalized = {
            folder_id: body.folder_id || body.folderId,
            type: body.type || 'word',
            english: body.english,
            meaning_1: body.meaning_1 || body.meaning1,
            meaning_2: body.meaning_2 || body.meaning2 || null,
            video_url: body.video_url || body.videoUrl || null,
            keyword: body.keyword || null,
        };

        if (!normalized.folder_id || !normalized.english || !normalized.meaning_1) {
            return NextResponse.json({ error: "Missing required fields (folder_id, english, meaning_1)" }, { status: 400 });
        }

        const card = await createCard(ownerId, normalized);
        return NextResponse.json({ card });
    } catch (error: any) {
        console.error("POST /api/cards error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
