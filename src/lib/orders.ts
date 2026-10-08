import 'server-only';
import { db } from './supabase';
import { newCode } from './codes';
import type { ProductKind } from './config';

export type OrderStatus = 'stock' | 'sold' | 'reading' | 'ready' | 'expired';

export type Order = {
  id: string;
  code: string;
  product: ProductKind;
  status: OrderStatus;
  source: 'lynk' | 'manual' | null;
  buyer_name: string | null;
  buyer_email: string | null;
  buyer_phone: string | null;
  lynk_ref: string | null;
  lynk_answers: Record<string, string> | null;
  note: string | null;
  sold_at: string | null;
  code_sent_at: string | null;
  data_received_at: string | null;
  nickname: string | null;
  focus: string | null;
  hand: 'kanan' | 'kiri' | null; // legacy single-hand palm orders; two-hand orders leave it null
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

/** Add codes to stock, retrying on the (very unlikely) code collision. */
export async function generateStock(product: ProductKind, count: number): Promise<string[]> {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data, error } = await db().from('orders').insert({ code: newCode(), product }).select('code').single();
      if (!error) {
        codes.push(data.code);
        break;
      }
      if (error.code !== '23505' || attempt === 4) throw error;
    }
  }
  return codes;
}

export type Sale = {
  product: ProductKind;
  source: 'lynk' | 'manual';
  lynkKey?: string | null;
  lynkRef?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  answers?: Record<string, string> | null;
  note?: string | null;
};

/** Take the oldest stock code for the product and assign it to a buyer (atomic, idempotent on lynkKey). */
export async function assignCode(s: Sale): Promise<Order> {
  const { data, error } = await db().rpc('assign_code', {
    p_product: s.product,
    p_source: s.source,
    p_lynk_key: s.lynkKey ?? null,
    p_lynk_ref: s.lynkRef ?? null,
    p_name: s.name ?? null,
    p_email: s.email ?? null,
    p_phone: s.phone ?? null,
    p_answers: s.answers ?? null,
    p_note: s.note ?? null,
  });
  if (error) throw error;
  return data as Order;
}
