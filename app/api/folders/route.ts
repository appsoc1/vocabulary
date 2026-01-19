import { NextResponse } from "next/server";
import { getOwnerId } from "@/lib/owner";
import { createFolder, deleteFolder, listFolders } from "@/lib/db/folders";

// Force Node.js runtime for SQLite compatibility
export const runtime = 'nodejs';

export async function GET() {
  try {
    const ownerId = await getOwnerId();
    const folders = await listFolders(ownerId);
    return NextResponse.json({ folders });
  } catch (error: any) {
    console.error("GET /api/folders error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const ownerId = await getOwnerId();
    const body = await req.json().catch(() => ({}));
    const name = String(body?.name ?? "").trim();
    if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });

    const folder = await createFolder(ownerId, name);
    return NextResponse.json({ folder });
  } catch (error: any) {
    console.error("POST /api/folders error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const ownerId = await getOwnerId();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await deleteFolder(ownerId, id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("DELETE /api/folders error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
