import { NextResponse } from "next/server";

import { clearRefreshCookie } from "@/lib/security/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  clearRefreshCookie(response);
  return response;
}
