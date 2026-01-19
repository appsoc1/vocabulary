import { NextResponse } from "next/server";
import { getOwnerId } from "@/lib/owner";
import { listProgressByCardIds, upsertProgress } from "@/lib/db/progress";

// Force Node.js runtime for SQLite compatibility
export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const ownerId = await getOwnerId();
    const { searchParams } = new URL(req.url);
    const cardIds = (searchParams.get("cardIds") ?? "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const progress = await listProgressByCardIds(ownerId, cardIds);
    return NextResponse.json({ progress });
  } catch (error: any) {
    console.error("GET /api/progress error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const ownerId = await getOwnerId();
  const body = await req.json().catch(() => ({}));

  const card_id = String(body?.card_id ?? "");
  if (!card_id) return NextResponse.json({ error: "Missing card_id" }, { status: 400 });

  const patch = {
    card_id,
    due_at: String(body?.due_at ?? new Date().toISOString()),
    interval_days: Number(body?.interval_days ?? 0),
    ease: Number(body?.ease ?? 2.3),
    reps: Number(body?.reps ?? 0),
    lapses: Number(body?.lapses ?? 0),
    state: body?.state,
  };

  if (!["new", "learning", "review"].includes(patch.state)) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  const saved = await upsertProgress(ownerId, patch);
  return NextResponse.json({ progress: saved });
}
