import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Verifikasi session user saat ini.
 * Kembalikan session jika valid, null jika tidak.
 */
export async function getAuthSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

/**
 * Response 401 Unauthorized standar.
 */
export function unauthorizedResponse() {
  return Response.json(
    { error: "Unauthorized — silakan login terlebih dahulu" },
    { status: 401 }
  );
}
