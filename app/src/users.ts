/*
 * In-memory user store. Passwords are hashed with the ACTIVE hasher at boot so the demo's
 * stored digests match the live SECURITY_PROFILE (SHA-1 classical / SHA-256 pqc).
 */

import { getPasswordHasher } from './passwordPolicy';

export interface User {
  username: string;
  displayName: string;
  passwordHash: string;
}

const DEMO_PASSWORD = 'password123';

const hasher = getPasswordHasher();

const users: Record<string, User> = {
  admin: {
    username: 'admin',
    displayName: 'Alex Morgan (Administrator)',
    passwordHash: hasher.hash(DEMO_PASSWORD),
  },
  alice: {
    username: 'alice',
    displayName: 'Alice Chen',
    passwordHash: hasher.hash(DEMO_PASSWORD),
  },
};

/** Look up a user by username. Returns undefined when not found. */
export function findUser(username: string): User | undefined {
  return users[username];
}
