/*
 * Runtime signer selection driven by SECURITY_PROFILE.
 *
 *   classical -> Ed25519 (FIPS 186-5, classical, quantum-VULNERABLE)  [red]
 *   pqc       -> ML-DSA-65 (FIPS 204, lattice, quantum-SAFE)          [green]
 *
 * The classical source files (crypto/ed25519.ts, crypto/password.ts) stay classical —
 * that is exactly what the VayunX scanner inspects and the auto-patcher rewrites. This
 * module only chooses which runtime path is live for the executive demo so the red->green
 * transition is deterministic and reliable on stage.
 */

import {
  generateSigningKeyPair,
  signMessage,
  verifyMessage,
  Ed25519KeyPair,
} from './crypto/ed25519';
import {
  generatePqcSigningKeyPair,
  pqcSign,
  pqcVerify,
  ALGORITHM as ML_DSA_ALGORITHM,
} from './crypto/mldsa';

export interface Signer {
  algorithm: string;
  fipsStandard: string;
  quantumSafe: boolean;
  sign(msg: Buffer): Buffer;
  verify(msg: Buffer, sig: Buffer): boolean;
  publicKeyPem_or_hex(): string;
}

function isPqcProfile(): boolean {
  return (process.env.SECURITY_PROFILE ?? 'classical').toLowerCase() === 'pqc';
}

function createClassicalSigner(): Signer {
  const keys: Ed25519KeyPair = generateSigningKeyPair();
  return {
    algorithm: 'Ed25519',
    fipsStandard: 'FIPS 186-5 (classical)',
    quantumSafe: false,
    sign(msg: Buffer): Buffer {
      return signMessage(keys.privateKeyObject, msg);
    },
    verify(msg: Buffer, sig: Buffer): boolean {
      return verifyMessage(keys.publicKeyObject, msg, sig);
    },
    publicKeyPem_or_hex(): string {
      return keys.publicKeyObject.export({ type: 'spki', format: 'pem' }) as string;
    },
  };
}

function createPqcSigner(): Signer {
  const { publicKey, secretKey } = generatePqcSigningKeyPair();
  return {
    algorithm: ML_DSA_ALGORITHM,
    fipsStandard: 'FIPS 204',
    quantumSafe: true,
    sign(msg: Buffer): Buffer {
      return Buffer.from(pqcSign(secretKey, new Uint8Array(msg)));
    },
    verify(msg: Buffer, sig: Buffer): boolean {
      return pqcVerify(publicKey, new Uint8Array(msg), new Uint8Array(sig));
    },
    publicKeyPem_or_hex(): string {
      return Buffer.from(publicKey).toString('hex');
    },
  };
}

let singleton: Signer | null = null;

/** Singleton signer, keypair generated once at startup. */
export function getSigner(): Signer {
  if (singleton === null) {
    singleton = isPqcProfile() ? createPqcSigner() : createClassicalSigner();
  }
  return singleton;
}
