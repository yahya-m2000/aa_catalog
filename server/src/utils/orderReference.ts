import { randomBytes } from 'node:crypto';

const REFERENCE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I — avoids visual ambiguity
const REFERENCE_LENGTH = 12;

export function generateOrderReference(): string {
  const bytes = randomBytes(REFERENCE_LENGTH);
  let suffix = '';
  for (let i = 0; i < REFERENCE_LENGTH; i++) {
    suffix += REFERENCE_CHARS[bytes[i] % REFERENCE_CHARS.length];
  }
  return `ORD-${suffix}`;
}
