/*
 * Ed25519 signing keys for the demo's document-signing API.
 *
 * NOTE (VayunX demo): Ed25519 is a CLASSICAL elliptic-curve signature scheme. It is
 * quantum-vulnerable — a cryptographically-relevant quantum computer running Shor's
 * algorithm can recover the private key from the public key. This is exactly the kind of
 * asset the VayunX scanner flags and the deterministic auto-patcher migrates to ML-DSA-65
 * (FIPS 204). The keygen below is the pattern the AST codemod rewrites.
 */

import {
  generateKeyPairSync,
  sign as nodeSign,
  verify as nodeVerify,
  KeyObject,
} from 'crypto';

export interface Ed25519KeyPair {
  publicKey: Buffer;
  privateKey: Buffer;
  publicKeyObject: KeyObject;
  privateKeyObject: KeyObject;
}

/**
 * Generate a fresh signing keypair.
 *
 * The VayunX source scan flags this call (`generateKeyPairSync('ed25519')`) as a
 * quantum-vulnerable operation, and the auto-patcher rewrites it to `ml_dsa65.keygen()`
 * while preserving the surrounding binding.
 */
export function generateSigningKeyPair(): Ed25519KeyPair {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  return {
    publicKey: publicKey.export({ type: 'spki', format: 'der' }) as Buffer,
    privateKey: privateKey.export({ type: 'pkcs8', format: 'der' }) as Buffer,
    publicKeyObject: publicKey,
    privateKeyObject: privateKey,
  };
}

/** Sign a message with the classical Ed25519 private key. */
export function signMessage(privateKey: KeyObject, message: Buffer): Buffer {
  return nodeSign(null, message, privateKey);
}

/** Verify an Ed25519 signature. */
export function verifyMessage(publicKey: KeyObject, message: Buffer, signature: Buffer): boolean {
  return nodeVerify(null, message, publicKey, signature);
}
