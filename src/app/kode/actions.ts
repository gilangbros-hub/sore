'use server';

import { CODE_RE, normalizeCode } from '@/lib/codes';
import { getOrderByCode } from '@/lib/orders';
import { wibStamp } from '@/lib/format';

export type LookupResult =
  | { state: 'invalid' }
  | { state: 'ok'; code: string }
  | { state: 'pending'; code: string; at: string }
  | { state: 'ready'; at: string; token: string }
  | { state: 'expired' };

export async function lookupCode(raw: string): Promise<LookupResult> {
  const code = normalizeCode(String(raw ?? ''));
  if (!CODE_RE.test(code)) return { state: 'invalid' };
  const order = await getOrderByCode(code);
  if (!order) return { state: 'invalid' };
  switch (order.status) {
    case 'unused':
      return { state: 'ok', code };
    case 'submitted':
      return { state: 'pending', code, at: wibStamp(order.submitted_at!) };
    case 'ready':
      return { state: 'ready', at: wibStamp(order.delivered_at!), token: order.result_token! };
    default:
      return { state: 'expired' };
  }
}
