import { randomBytes, randomInt } from 'node:crypto';

// No I, O, 0 or 1: they get misread when typed off a phone screen.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function pick(n: number): string {
  let s = '';
  for (let i = 0; i < n; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return s;
}

/** Access code like RS7K-29QM. */
export function newCode(): string {
  return `RS${pick(2)}-${pick(4)}`;
}

/** Result token: random, unguessable, unrelated to the code. */
export function newToken(): string {
  return randomBytes(18).toString('base64url');
}

export const CODE_RE = /^RS[A-Z0-9]{2}-[A-Z0-9]{4}$/;

/** Uppercase, strip spaces, and add the dash if someone left it out. */
export function normalizeCode(input: string): string {
  const c = input.toUpperCase().replace(/[\s_–—]/g, '').replace(/-+/g, '-');
  if (/^RS[A-Z0-9]{6}$/.test(c)) return `${c.slice(0, 4)}-${c.slice(4)}`;
  return c;
}

/** Indonesian mobile number to wa.me format (628…). Returns null if it does not look valid. */
export function normalizeWa(input: string): string | null {
  let d = input.replace(/\D/g, '');
  if (d.startsWith('62')) d = d.slice(2);
  if (d.startsWith('0')) d = d.slice(1);
  if (!/^8\d{7,12}$/.test(d)) return null;
  return `62${d}`;
}
