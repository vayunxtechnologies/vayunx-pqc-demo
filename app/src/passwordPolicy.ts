/*
 * Runtime password hasher selection driven by SECURITY_PROFILE.
 *
 *   classical -> SHA-1 (unsalted, broken; flagged red)      via crypto/password.ts
 *   pqc       -> SHA-256 (remediated state; green)
 *
 * Note: SHA-256 is not "quantum-safe" in a Grover sense so much as it is the remediated,
 * non-broken hash the auto-patcher swaps SHA-1 for. SHA-1 is flagged as quantumSafe:false
 * because it is a weak/broken primitive the CryptoSPM posture must show as vulnerable.
 */

import { createHash } from 'crypto';
import {
  PASSWORD_HASH_ALGORITHM,
  hashPassword as sha1Hash,
  verifyPassword as sha1Verify,
} from './crypto/password';

export interface PasswordHasher {
  algorithm: string;
  quantumSafe: boolean;
  hash(pw: string): string;
  verify(pw: string, stored: string): boolean;
}

function isPqcProfile(): boolean {
  return (process.env.SECURITY_PROFILE ?? 'classical').toLowerCase() === 'pqc';
}

function createClassicalHasher(): PasswordHasher {
  return {
    algorithm: PASSWORD_HASH_ALGORITHM, // 'SHA-1'
    quantumSafe: false,
    hash: sha1Hash,
    verify: sha1Verify,
  };
}

function createPqcHasher(): PasswordHasher {
  const hash = (pw: string): string => createHash('sha256').update(pw).digest('hex');
  return {
    algorithm: 'SHA-256',
    quantumSafe: true,
    hash,
    verify: (pw: string, stored: string): boolean => hash(pw) === stored,
  };
}

let singleton: PasswordHasher | null = null;

/** Singleton password hasher for the active security profile. */
export function getPasswordHasher(): PasswordHasher {
  if (singleton === null) {
    singleton = isPqcProfile() ? createPqcHasher() : createClassicalHasher();
  }
  return singleton;
}
