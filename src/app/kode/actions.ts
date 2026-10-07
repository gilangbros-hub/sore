'use server';

import { CODE_RE, normalizeCode } from '@/lib/codes';
import { db } from '@/lib/supabase';
import { getOrderByCode } from '@/lib/orders';

export type LookupResult = { state: 'invalid' } | { state: 'expired' } | { state: 'ok'; code: string };

export async function lookupCode(raw: string): Promise<LookupResult> {
  const code = normalizeCode(String(raw ?? ''));
  if (!CODE_RE.test(code)) return { state: 'invalid' };
  const order = await getOrderByCode(code);
  if (!order) return { state: 'invalid' };
  if (order.status === 'expired') return { state: 'expired' };
  if (order.status === 'stock') {
    // A stock code you handed out by hand: activate it on first use.
    await db().from('orders').update({ status: 'sold', source: 'manual', sold_at: new Date().toISOString() }).eq('id', order.id).eq('status', 'stock');
  }
  return { state: 'ok', code };
}
