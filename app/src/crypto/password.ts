/*
 * Password storage for the demo login service.
 *
 * Migrated from unsalted SHA-1 to Argon2id (RFC 9106) - the OWASP-recommended, memory-hard
 * password KDF. Argon2id salts every password automatically and resists GPU brute-force, unlike
 * a plain hash (SHA-1 or even SHA-256). NOTE: the argon2 API is async, so hashPassword /
 * verifyPassword are now async - every caller must await. The stored-hash FORMAT changed, so
 * existing SHA-1 digests will not verify; re-hash users on next successful login (or migrate).
 */

import argon2 from 'argon2';

/** The KDF now protecting stored passwords - surfaced in the posture panel. */
export const PASSWORD_HASH_ALGORITHM = 'Argon2id';

/** Hash a password for storage using Argon2id (salted + memory-hard). */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

/** Verify a candidate password against a stored Argon2id hash (salt-aware, constant-time). */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    return await argon2.verify(storedHash, password);
  } catch {
    return false;
  }
}
