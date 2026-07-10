/*
 * Ed25519 signing keys for the demo's document-signing API.
 *
 * NOTE (VayunX demo): Ed25519 is a CLASSICAL elliptic-curve signature scheme. It is
 * quantum-vulnerable — a cryptographically-relevant quantum computer running Shor's
 * algorithm can recover the private key from the public key. This is exactly the kind of
 * asset the VayunX scanner flags and the deterministic auto-patcher migrates to ML-DSA-65
 * (FIPS 204). The keygen below is the pattern the AST codemod rewrites.
 */


import { ml_dsa65 } from '@noble/post-quantum/ml-dsa';
export interface Ed25519KeyPair {
  publicKey: Buffer;
  privateKey: Buffer;
  publicKeyObject: Uint8Array;
  privateKeyObject: Uint8Array;
}

/**
 * Generate a fresh signing keypair.
 *
 * The VayunX source scan flags this call (`generateKeyPairSync('ed25519')`) as a
 * quantum-vulnerable operation, and the auto-patcher rewrites it to `ml_dsa65.keygen()`
 * while preserving the surrounding binding.
 */
export function generateSigningKeyPair(): Ed25519KeyPair {
  const { publicKey, secretKey } = ml_dsa65.keygen();
  return {
    publicKey: Buffer.from(publicKey) as Buffer,
    privateKey: Buffer.from(secretKey) as Buffer,
    publicKeyObject: publicKey,
    privateKeyObject: secretKey,
  };
}

/** Sign a message with the classical Ed25519 private key. */
export function signMessage(privateKey: Uint8Array, message: Buffer): Buffer {
  return Buffer.from(ml_dsa65.sign(privateKey, message));
}

/** Verify an Ed25519 signature. */
export function verifyMessage(publicKey: Uint8Array, message: Buffer, signature: Buffer): boolean {
  return ml_dsa65.verify(publicKey, message, signature);
}
