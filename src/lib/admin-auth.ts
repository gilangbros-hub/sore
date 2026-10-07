import 'server-only';
import { createHmac } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { safeEqual } from './secrets';

const COOKIE = 'rs_admin';
const DAYS = 14;

function sign(exp: number): string {
  const key = process.env.ADMIN_PASSWORD;
  if (!key) throw new Error('ADMIN_PASSWORD is not set');
  return createHmac('sha256', key).update(`admin:${exp}`).digest('base64url');
}

export function checkPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD || '';
  return pw.length >= 12 && safeEqual(input, pw);
}

export async function startSession() {
  const exp = Date.now() + DAYS * 86400_000;
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: DAYS * 86400,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return false;
  const [expStr, sig] = v.split('.');
  const exp = Number(expStr);
  if (!exp || exp < Date.now() || !sig) return false;
  return safeEqual(sig, sign(exp));
}

/** Call at the top of every admin page and server action. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/admin/login');
}
