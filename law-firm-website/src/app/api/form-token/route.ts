import { NextResponse } from "next/server";
import { FORM_TOKEN_COOKIE, FORM_TOKEN_MAX_AGE_SECONDS, issueFormToken } from "@/lib/security/form-token";

export const dynamic = "force-dynamic";

/** Issues a signed form token and mirrors it in an HttpOnly cookie. */
export function GET() {
  const token = issueFormToken();
  const response = NextResponse.json({ token }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(FORM_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: FORM_TOKEN_MAX_AGE_SECONDS,
  });
  return response;
}
