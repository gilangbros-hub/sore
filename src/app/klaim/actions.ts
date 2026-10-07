'use server';

import { z } from 'zod';
import { db } from '@/lib/supabase';
import { PRODUCT_NAME, type ProductKind } from '@/lib/config';

export type ClaimItem = { code: string; product: string; status: 'unused' | 'submitted' | 'ready'; token: string | null };
export type ClaimResult = { state: 'invalid' } | { state: 'none' } | { state: 'found'; items: ClaimItem[] };

export async function claimByEmail(raw: string): Promise<ClaimResult> {
  const parsed = z.email().safeParse(String(raw ?? '').trim().toLowerCase());
  if (!parsed.success) return { state: 'invalid' };
  const { data, error } = await db()
    .from('orders')
    .select('code, product, status, result_token')
    .eq('buyer_email', parsed.data)
    .neq('status', 'expired')
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  if (!data?.length) return { state: 'none' };
  return {
    state: 'found',
    items: data.map((o) => ({
      code: o.code,
      product: PRODUCT_NAME[o.product as ProductKind],
      status: o.status,
      token: o.result_token,
    })),
  };
}
