import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ALLOWED_USER_ID = "00000000-0000-0000-0000-000000000001";
const ALLOWED_USER_EMAIL = "tranbaotrung01@gmail.com";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get("session_id")?.value;

        if (!sessionId || sessionId !== ALLOWED_USER_ID) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        return NextResponse.json({ user: { id: ALLOWED_USER_ID, email: ALLOWED_USER_EMAIL } });
    } catch (error: any) {
        console.error("GET /api/auth/session error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
