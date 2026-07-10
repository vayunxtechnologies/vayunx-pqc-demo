/*
 * Cryptographic posture model. Drives both the dashboard posture card and the /posture
 * JSON endpoint. Everything is derived from the live signer + password hasher so the view
 * is always truthful about the running SECURITY_PROFILE.
 */

import { getSigner } from './signer';
import { getPasswordHasher } from './passwordPolicy';

export type AssetStatus = 'vulnerable' | 'safe';

export interface PostureAsset {
  name: string;
  algorithm: string;
  standard: string;
  status: AssetStatus;
  detail: string;
}

export interface Posture {
  profile: string;
  pqcReady: boolean;
  headline: string;
  assets: PostureAsset[];
}

/** Build the current cryptographic posture from the active runtime crypto. */
export function getPosture(): Posture {
  const signer = getSigner();
  const hasher = getPasswordHasher();

  const signingAsset: PostureAsset = {
    name: 'Session token signing',
    algorithm: signer.algorithm,
    standard: signer.fipsStandard,
    status: signer.quantumSafe ? 'safe' : 'vulnerable',
    detail: signer.quantumSafe
      ? 'Session tokens are signed with a NIST-standardised lattice scheme — resistant to Shor’s algorithm on a quantum computer.'
      : 'Elliptic-curve signatures are broken by Shor’s algorithm. A quantum adversary could forge session tokens and impersonate any user.',
  };

  const passwordAsset: PostureAsset = {
    name: 'Password storage',
    algorithm: hasher.algorithm,
    standard: hasher.quantumSafe ? 'FIPS 180-4 (SHA-256)' : 'Deprecated (SHA-1)',
    status: hasher.quantumSafe ? 'safe' : 'vulnerable',
    detail: hasher.quantumSafe
      ? 'Passwords are hashed with SHA-256 — no known practical collision or preimage attack.'
      : 'Unsalted SHA-1 is a broken hash: practical collisions since 2017 and trivial GPU brute-force of stored credentials.',
  };

  const assets: PostureAsset[] = [signingAsset, passwordAsset];
  const pqcReady = assets.every((a) => a.status === 'safe');

  return {
    profile: (process.env.SECURITY_PROFILE ?? 'classical').toLowerCase(),
    pqcReady,
    headline: pqcReady ? '🟢 PQC-READY' : '🔴 QUANTUM-VULNERABLE',
    assets,
  };
}
