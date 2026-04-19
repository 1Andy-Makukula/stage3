/** Normalize OTP input to 8 alphanumeric characters (drops separators). */
export function normalizeHandshakeCode(raw: string): string {
  return raw.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

export function isValidHandshakeLength(normalized: string): boolean {
  return normalized.length === 8;
}
