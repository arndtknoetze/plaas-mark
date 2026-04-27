import { NextResponse } from "next/server";
import { isPhoneOtpDisabled } from "@/lib/phone-otp";

/** Client-readable feature flags from server env (no secrets). */
export async function GET() {
  return NextResponse.json({
    disablePhoneOtp: isPhoneOtpDisabled(),
  });
}
