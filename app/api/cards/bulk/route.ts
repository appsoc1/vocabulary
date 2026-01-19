import { NextResponse } from "next/server";
import { createCardsBulk } from "@/lib/db/cards";
import { getOwnerId } from "@/lib/owner";

export async function POST(request: Request) {
    try {
        const ownerId = await getOwnerId();
        const body = await request.json();
        const { cards } = body; // Array of { folder_id, english, meaning_1, ... }

        if (!Array.isArray(cards)) {
            return NextResponse.json({ error: "Invalid payload: cards must be an array" }, { status: 400 });
        }

        const { inserted, skipped } = await createCardsBulk(ownerId, cards);

        return NextResponse.json({ inserted, skipped });

    } catch (error: any) {
        console.error("Bulk Import Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
