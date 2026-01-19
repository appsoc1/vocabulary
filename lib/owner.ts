import { cookies } from "next/headers";

const ALLOWED_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function getOwnerId(): Promise<string> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;

  if (sessionId === ALLOWED_USER_ID) {
    return ALLOWED_USER_ID;
  }

  throw new Error("Not authenticated");
}
