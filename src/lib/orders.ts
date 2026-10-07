import 'server-only';
import { db } from './supabase';
import { newCode } from './codes';
import type { ProductKind } from './config';

export type OrderStatus = 'unused' | 'submitted' | 'ready' | 'expired';

export type Order = {
  id: string;
  code: string;
  product: ProductKind;
  status: OrderStatus;
  source: 'manual' | 'lynk';
  buyer_email: string | null;
  lynk_ref: string | null;
  note: string | null;
  nickname: string | null;
  wa_number: string | null;
  focus: string | null;
  question: string | null;
  hand: 'kanan' | 'kiri' | null;
  photo_path: string | null;
  photo_delete_at: string | null;
  photo_deleted_at: string | null;
  submitted_at: string | null;
  result_token: string | null;
  result_draft: unknown;
  result: unknown;
  delivered_at: string | null;
  wa_sent_at: string | null;
  expires_at: string | null;
  created_at: string;
};

export async function getOrderByCode(code: string): Promise<Order | null> {
  const { data, error } = await db().from('orders').select('*').eq('code', code).maybeSingle();
  if (error) throw error;
  return data as Order | null;
}

export async function getOrderByToken(token: string): Promise<Order | null> {
  const { data, error } = await db().from('orders').select('*').eq('result_token', token).maybeSingle();
  if (error) throw error;
  return data as Order | null;
}

type NewCode = {
  product: ProductKind;
  source: 'manual' | 'lynk';
  buyer_email?: string | null;
  lynk_ref?: string | null;
  lynk_key?: string | null;
  note?: string | null;
};

/**
 * Insert codes, retrying on the (very unlikely) code collision.
 * Rows whose lynk_key already exists are skipped, which keeps webhook retries idempotent.
 */
export async function issueCodes(rows: NewCode[]): Promise<{ created: Order[]; skipped: number }> {
  const created: Order[] = [];
  let skipped = 0;
  for (const row of rows) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data, error } = await db()
        .from('orders')
        .insert({ ...row, buyer_email: row.buyer_email?.trim().toLowerCase() || null, code: newCode() })
        .select('*')
        .single();
      if (!error) {
        created.push(data as Order);
        break;
      }
      if (error.code === '23505' && error.message.includes('lynk_key')) {
        skipped++;
        break;
      }
      if (error.code === '23505' && attempt < 4) continue; // code collision, try another
      throw error;
    }
  }
  return { created, skipped };
}
