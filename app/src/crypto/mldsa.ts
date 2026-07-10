/*
 * ML-DSA-65 (FIPS 204) signing keys — the QUANTUM-SAFE target the VayunX auto-patcher
 * migrates the classical Ed25519 signer to. ML-DSA (formerly CRYSTALS-Dilithium) is a
 * lattice-based signature scheme standardised by NIST in FIPS 204 and is not broken by
 * Shor's algorithm. This is the "green" state of the demo's document-signing asset.
 */

import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';

export const ALGORITHM = 'ML-DSA-65';

export interface PqcKeyPair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}

/** Generate a fresh ML-DSA-65 keypair. */
export function generatePqcSigningKeyPair(): PqcKeyPair {
  const { publicKey, secretKey } = ml_dsa65.keygen();
  return { publicKey, secretKey };
}

/** Sign a message with the ML-DSA-65 secret key. */
export function pqcSign(secretKey: Uint8Array, msg: Uint8Array): Uint8Array {
  // noble v0.6 order: sign(msg, secretKey)
  return ml_dsa65.sign(msg, secretKey);
}

/** Verify an ML-DSA-65 signature. */
export function pqcVerify(publicKey: Uint8Array, msg: Uint8Array, sig: Uint8Array): boolean {
  // noble v0.6 order: verify(sig, msg, publicKey)
  return ml_dsa65.verify(sig, msg, publicKey);
}
