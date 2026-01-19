import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Hardcoded single user - NO SIGN UP ALLOWED
const ALLOWED_USER = {
    email: "tranbaotrung01@gmail.com",
    password: "Baotrung123!",
    id: "00000000-0000-0000-0000-000000000001"
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email và mật khẩu không được để trống" }, { status: 400 });
        }

        // Check against hardcoded credentials
        if (email !== ALLOWED_USER.email || password !== ALLOWED_USER.password) {
            return NextResponse.json({ error: "Email hoặc mật khẩu không đúng" }, { status: 401 });
        }

        // Set session cookie
        const cookieStore = await cookies();
        cookieStore.set("session_id", ALLOWED_USER.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/",
        });

        return NextResponse.json({ user: { id: ALLOWED_USER.id, email: ALLOWED_USER.email } });
    } catch (error: any) {
        console.error("POST /api/auth error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
