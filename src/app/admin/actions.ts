'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { checkPassword, endSession, requireAdmin, startSession } from '@/lib/admin-auth';
import { db } from '@/lib/supabase';
import { assignCode, generateStock, getOrderByCode } from '@/lib/orders';
import { newToken, normalizeWa } from '@/lib/codes';
import { RESULT_SCHEMA } from '@/lib/results';
import { FOCUS_OPTIONS, RESULT_TTL_DAYS, type ProductKind } from '@/lib/config';

export async function login(_prev: string | null, form: FormData): Promise<string | null> {
  if (!checkPassword(String(form.get('password') ?? ''))) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    return 'Password salah.';
  }
  await startSession();
  redirect('/admin');
}

export async function logout() {
  await endSession();
  redirect('/admin/login');
}

const productsOf = (p: string): ProductKind[] => (p === 'bundle' ? ['tarot', 'palm', 'aura'] : [p as ProductKind]);

const stockSchema = z.object({ product: z.enum(['tarot', 'palm', 'aura', 'bundle']), count: z.coerce.number().int().min(1).max(50) });

export async function addStock(_prev: unknown, form: FormData): Promise<{ error?: string; codes?: string[] }> {
  await requireAdmin();
  const p = stockSchema.safeParse({ product: form.get('product'), count: form.get('count') });
  if (!p.success) return { error: 'Jumlah 1–50.' };
  const codes: string[] = [];
  for (const product of productsOf(p.data.product)) codes.push(...(await generateStock(product, p.data.count)));
  revalidatePath('/admin');
  return { codes };
}

const sellSchema = z.object({
  product: z.enum(['tarot', 'palm', 'aura', 'bundle']),
  name: z.string().trim().max(80),
  phone: z.string().trim(),
  email: z.union([z.literal(''), z.email()]),
  note: z.string().trim().max(200),
});

/** Sale outside the webhook (paid by transfer, or the webhook missed it). */
export async function sellManual(_prev: unknown, form: FormData): Promise<{ error?: string; code?: string }> {
  await requireAdmin();
  const p = sellSchema.safeParse({
    product: form.get('product'), name: form.get('name') ?? '', phone: form.get('phone') ?? '',
    email: String(form.get('email') ?? '').trim(), note: form.get('note') ?? '',
  });
  if (!p.success) return { error: 'Cek lagi isian. Email harus valid kalau diisi.' };
  const phone = p.data.phone ? normalizeWa(p.data.phone) : null;
  if (p.data.phone && !phone) return { error: 'Nomor WhatsApp belum valid.' };
  const ref = `manual-${randomBytes(5).toString('hex')}`;
  let first = '';
  for (const product of productsOf(p.data.product)) {
    const o = await assignCode({
      product, source: 'manual', lynkRef: ref, name: p.data.name || null, email: p.data.email || null, phone, note: p.data.note || null,
    });
    first ||= o.code;
  }
  revalidatePath('/admin');
  redirect(`/admin/o/${first}`);
}

async function editable(code: string) {
  await requireAdmin();
  const order = await getOrderByCode(code);
  if (!order) throw new Error('Pesanan tidak ditemukan');
  return order;
}

function touch(code: string) {
  revalidatePath('/admin');
  revalidatePath(`/admin/o/${code}`);
}

/** Marks every code in the same purchase as sent, since one WhatsApp message carries all of them. */
export async function markCodeSent(code: string) {
  const o = await editable(code);
  const q = db().from('orders').update({ code_sent_at: new Date().toISOString() });
  await (o.lynk_ref ? q.eq('lynk_ref', o.lynk_ref) : q.eq('id', o.id));
  touch(code);
}

export async function updateBuyerPhone(code: string, raw: string): Promise<string | null> {
  const o = await editable(code);
  const phone = normalizeWa(raw);
  if (!phone) return 'Nomor WhatsApp belum valid.';
  const q = db().from('orders').update({ buyer_phone: phone });
  await (o.lynk_ref ? q.eq('lynk_ref', o.lynk_ref) : q.eq('id', o.id));
  touch(code);
  return null;
}

const metaSchema = z.object({
  nickname: z.string().trim().max(40),
  focus: z.union([z.literal(''), z.enum(FOCUS_OPTIONS)]),
  hand: z.union([z.literal(''), z.enum(['kanan', 'kiri'])]),
});
export type ReadingMeta = z.infer<typeof metaSchema>;

function metaUpdate(meta: ReadingMeta) {
  const m = metaSchema.parse(meta);
  return { nickname: m.nickname || null, focus: m.focus || null, hand: m.hand || null };
}

/** The buyer sent their data on WhatsApp: their progress page moves to "sedang disiapkan". */
export async function markDataReceived(code: string, meta: ReadingMeta) {
  const o = await editable(code);
  if (o.status !== 'sold') return;
  await db().from('orders').update({ ...metaUpdate(meta), status: 'reading', data_received_at: new Date().toISOString() }).eq('id', o.id);
  touch(code);
}

export async function saveDraft(code: string, meta: ReadingMeta, draft: unknown): Promise<{ ok: boolean; error?: string }> {
  const o = await editable(code);
  const { error } = await db().from('orders').update({ ...metaUpdate(meta), result_draft: draft }).eq('id', o.id);
  if (error) return { ok: false, error: error.message };
  touch(code);
  return { ok: true };
}

export async function publishResult(code: string, meta: ReadingMeta, draft: unknown): Promise<{ ok: boolean; error?: string }> {
  const o = await editable(code);
  if (o.status === 'stock' || o.status === 'expired') return { ok: false, error: 'Kode ini belum terjual atau sudah kedaluwarsa.' };
  const m = metaUpdate(meta);
  if (!m.nickname) return { ok: false, error: 'Isi nama panggilan untuk judul bacaan.' };
  if (o.product === 'tarot' && !m.focus) return { ok: false, error: 'Pilih fokus tarot.' };
  if (o.product === 'palm' && !m.hand) return { ok: false, error: 'Pilih tangan yang difoto.' };
  const parsed = RESULT_SCHEMA[o.product].safeParse(draft);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { ok: false, error: `${i.path.join(' › ') || 'Isian'}: ${i.message}` };
  }
  const now = new Date();
  const first = !o.delivered_at;
  const { error } = await db()
    .from('orders')
    .update({
      ...m,
      result: parsed.data,
      result_draft: parsed.data,
      result_token: o.result_token ?? newToken(),
      status: 'ready',
      data_received_at: o.data_received_at ?? now.toISOString(),
      // Editing a published reading keeps the original delivery time and expiry.
      delivered_at: first ? now.toISOString() : o.delivered_at,
      expires_at: first ? new Date(now.getTime() + RESULT_TTL_DAYS * 86400_000).toISOString() : o.expires_at,
    })
    .eq('id', o.id);
  if (error) return { ok: false, error: error.message };
  touch(code);
  return { ok: true };
}

export async function markWaSent(code: string) {
  const o = await editable(code);
  await db().from('orders').update({ wa_sent_at: new Date().toISOString() }).eq('id', o.id);
  touch(code);
}
