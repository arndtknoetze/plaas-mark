import { NextResponse } from "next/server";
import { getUserCookieName } from "@/lib/user-session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(getUserCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
