/*
 * Password storage for the demo login service.
 *
 * NOTE (VayunX demo): passwords are stored as UNSALTED SHA-1 digests — a weak, broken hash
 * (practical collisions since 2017; GPU brute-force trivial). The VayunX scanner flags this
 * and the deterministic auto-patcher performs a MECHANICAL swap SHA-1 -> SHA-256 (a genuine
 * drop-in code fix). This is the "classical algorithm used to store passwords" the demo shows
 * turning from red to green.
 */

import { createHash } from 'crypto';

/** The hash currently protecting stored passwords — surfaced in the posture panel. */
export const PASSWORD_HASH_ALGORITHM = 'SHA-1';

/** Hash a password for storage. WEAK: unsalted SHA-1 — auto-patched to SHA-256. */
export function hashPassword(password: string): string {
  // VayunX remediation: Replace with SHA-256 (FIPS 180-4) for all integrity, authentication, and signature uses. For digital signature applications, SHA-256 or SHA3-256 is mandatory per SP 800-131A. SHA-1 is allowed only for legacy digital signature verification (not generation).
  return createHash('sha1').update(password).digest('hex');
}

/** Constant-ish comparison of a candidate password against a stored hash. */
export function verifyPassword(password: string, storedHash: string): boolean {
  return hashPassword(password) === storedHash;
}
