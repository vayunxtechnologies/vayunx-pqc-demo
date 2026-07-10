/*
 * Session tokens: base64url(payload) + '.' + base64url(signature).
 * The signature is produced by the active signer (Ed25519 classical / ML-DSA-65 pqc),
 * so the token itself is the quantum-vulnerable-or-safe asset the posture panel reports on.
 */

import { getSigner } from './signer';

interface TokenPayload {
  username: string;
  iat: number;
}

function b64url(buf: Buffer): string {
  return buf.toString('base64url');
}

/** Issue a signed session token for a username. */
export function issueToken(username: string): string {
  const payload: TokenPayload = { username, iat: Date.now() };
  const payloadBuf = Buffer.from(JSON.stringify(payload), 'utf8');
  const signature = getSigner().sign(payloadBuf);
  return `${b64url(payloadBuf)}.${b64url(signature)}`;
}

/** Verify a session token and return its payload, or null if invalid. */
export function verifyToken(token: string): { username: string } | null {
  if (typeof token !== 'string' || token.length === 0) {
    return null;
  }
  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }
  const [payloadPart, sigPart] = parts;
  try {
    const payloadBuf = Buffer.from(payloadPart, 'base64url');
    const signature = Buffer.from(sigPart, 'base64url');
    if (!getSigner().verify(payloadBuf, signature)) {
      return null;
    }
    const payload = JSON.parse(payloadBuf.toString('utf8')) as TokenPayload;
    if (typeof payload.username !== 'string') {
      return null;
    }
    return { username: payload.username };
  } catch {
    return null;
  }
}
