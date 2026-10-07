'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { checkPassword, endSession, requireAdmin, startSession } from '@/lib/admin-auth';
import { db, PHOTO_BUCKET } from '@/lib/supabase';
import { getOrderByCode, issueCodes } from '@/lib/orders';
import { newToken } from '@/lib/codes';
import { RESULT_SCHEMA } from '@/lib/results';
import { RESULT_TTL_DAYS, type ProductKind } from '@/lib/config';

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

const genSchema = z.object({
  product: z.enum(['tarot', 'palm', 'aura', 'bundle']),
  count: z.coerce.number().int().min(1).max(20),
  email: z.union([z.literal(''), z.email()]),
  note: z.string().max(200),
});

export async function generateCodes(_prev: unknown, form: FormData): Promise<{ error?: string; codes?: Array<{ code: string; product: string }> }> {
  await requireAdmin();
  const p = genSchema.safeParse({
    product: form.get('product'), count: form.get('count'), email: String(form.get('email') ?? '').trim(), note: String(form.get('note') ?? ''),
  });
  if (!p.success) return { error: 'Cek lagi isian: jumlah 1–20, email harus valid kalau diisi.' };
  const products: ProductKind[] = p.data.product === 'bundle' ? ['tarot', 'palm', 'aura'] : [p.data.product];
  const rows = Array.from({ length: p.data.count }).flatMap(() =>
    products.map((product) => ({ product, source: 'manual' as const, buyer_email: p.data.email || null, note: p.data.note || null })),
  );
  const { created } = await issueCodes(rows);
  revalidatePath('/admin');
  return { codes: created.map((o) => ({ code: o.code, product: o.product })) };
}

async function editableOrder(code: string) {
  await requireAdmin();
  const order = await getOrderByCode(code);
  if (!order) throw new Error('Pesanan tidak ditemukan');
  return order;
}

export async function saveDraft(code: string, draft: unknown): Promise<{ ok: boolean; error?: string }> {
  const order = await editableOrder(code);
  const { error } = await db().from('orders').update({ result_draft: draft }).eq('id', order.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function publishResult(code: string, draft: unknown): Promise<{ ok: boolean; error?: string; token?: string }> {
  const order = await editableOrder(code);
  if (order.status === 'unused') return { ok: false, error: 'Pembeli belum mengisi data.' };
  if (order.status === 'expired') return { ok: false, error: 'Pesanan ini sudah kedaluwarsa.' };
  const parsed = RESULT_SCHEMA[order.product].safeParse(draft);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { ok: false, error: `${i.path.join(' › ') || 'Isian'}: ${i.message}` };
  }
  const token = order.result_token ?? newToken();
  const now = new Date();
  const firstDelivery = !order.delivered_at;
  const { error } = await db()
    .from('orders')
    .update({
      result: parsed.data,
      result_draft: parsed.data,
      result_token: token,
      status: 'ready',
      // Editing a published reading keeps the original delivery time and expiry.
      delivered_at: firstDelivery ? now.toISOString() : order.delivered_at,
      expires_at: firstDelivery ? new Date(now.getTime() + RESULT_TTL_DAYS * 86400_000).toISOString() : order.expires_at,
    })
    .eq('id', order.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin');
  return { ok: true, token };
}

export async function markWaSent(code: string) {
  const order = await editableOrder(code);
  await db().from('orders').update({ wa_sent_at: new Date().toISOString() }).eq('id', order.id);
  revalidatePath(`/admin/o/${code}`);
  revalidatePath('/admin');
}

export async function deletePhotoNow(code: string) {
  const order = await editableOrder(code);
  if (order.photo_path) await db().storage.from(PHOTO_BUCKET).remove([order.photo_path]);
  await db().from('orders').update({ photo_deleted_at: new Date().toISOString() }).eq('id', order.id);
  revalidatePath(`/admin/o/${code}`);
}

/** Let the buyer fill the form again (wrong photo, typo in number). Keeps the code. */
export async function reopenIntake(code: string) {
  const order = await editableOrder(code);
  if (order.status !== 'submitted') return;
  if (order.photo_path) await db().storage.from(PHOTO_BUCKET).remove([order.photo_path]);
  await db()
    .from('orders')
    .update({ status: 'unused', submitted_at: null, photo_path: null, photo_delete_at: null, photo_deleted_at: null })
    .eq('id', order.id);
  revalidatePath(`/admin/o/${code}`);
  revalidatePath('/admin');
}
