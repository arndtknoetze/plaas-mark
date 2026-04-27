/**
 * When `DISABLE_PHONE_OTP=true`, APIs skip SMS/OTP verification tokens.
 * Use only for local/dev — never ship to production with this enabled.
 */
export function isPhoneOtpDisabled(): boolean {
  return process.env.DISABLE_PHONE_OTP === "true";
}
