'use server';

import { z } from 'zod';
import { randomBytes } from 'node:crypto';
import { db, PHOTO_BUCKET } from '@/lib/supabase';
import { getOrderByCode } from '@/lib/orders';
import { CODE_RE, normalizeCode, normalizeWa } from '@/lib/codes';
import { FOCUS_OPTIONS, PHOTO_TTL_HOURS } from '@/lib/config';


type Fail = { ok: false; error: string };

async function unusedOrder(rawCode: string) {
  const code = normalizeCode(rawCode);
  if (!CODE_RE.test(code)) return null;
  const order = await getOrderByCode(code);
  return order && order.status === 'unused' ? order : null;
}

export async function createPhotoUpload(rawCode: string, mime: string): Promise<{ ok: true; path: string; token: string } | Fail> {
  const order = await unusedOrder(rawCode);
  if (!order || order.product === 'tarot') return { ok: false, error: 'Kode ini tidak bisa dipakai untuk unggah foto.' };
  const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic', 'image/heif': 'heif' }[mime];
  if (!ext) return { ok: false, error: 'Formatnya belum didukung. Pakai JPG, PNG, atau HEIC.' };
  const path = `${order.id}/${randomBytes(8).toString('hex')}.${ext}`;
  const { data, error } = await db().storage.from(PHOTO_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { ok: false, error: 'Gagal menyiapkan unggahan. Coba lagi sebentar.' };
  return { ok: true, path: data.path, token: data.token };
}

const intakeSchema = z.object({
  code: z.string(),
  nickname: z.string().trim().min(1, 'Isi nama atau panggilanmu dulu.').max(40, 'Panggilannya kepanjangan, maksimal 40 karakter.'),
  wa: z.string(),
  focus: z.enum(FOCUS_OPTIONS).optional(),
  question: z.string().trim().max(200).optional(),
  hand: z.enum(['kanan', 'kiri']).optional(),
  photoPath: z.string().optional(),
});

export type IntakeInput = z.input<typeof intakeSchema>;

export async function submitIntake(input: IntakeInput): Promise<{ ok: true; code: string } | Fail> {
  const parsed = intakeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Data belum lengkap.' };
  const v = parsed.data;

  const order = await unusedOrder(v.code);
  if (!order) return { ok: false, error: 'Kode ini sudah dipakai atau tidak ditemukan. Cek lagi di halaman Punya kode?' };

  const wa = normalizeWa(v.wa);
  if (!wa) return { ok: false, error: 'Nomor WhatsApp-nya belum valid. Contoh: 812 3456 7890.' };

  const update: Record<string, unknown> = {
    nickname: v.nickname,
    wa_number: wa,
    status: 'submitted',
    submitted_at: new Date().toISOString(),
  };

  if (order.product === 'tarot') {
    if (!v.focus) return { ok: false, error: 'Pilih dulu fokus bacaanmu.' };
    update.focus = v.focus;
    update.question = v.question || null;
  } else {
    if (order.product === 'palm') {
      if (!v.hand) return { ok: false, error: 'Pilih tangan yang kamu foto.' };
      update.hand = v.hand;
    }
    const path = v.photoPath ?? '';
    if (!path.startsWith(`${order.id}/`)) return { ok: false, error: 'Unggah fotomu dulu, ya.' };
    const [folder, file] = path.split('/');
    const { data: files } = await db().storage.from(PHOTO_BUCKET).list(folder, { search: file });
    if (!files?.some((f) => f.name === file)) return { ok: false, error: 'Fotonya belum terunggah. Coba pilih ulang fotomu.' };
    update.photo_path = path;
    update.photo_delete_at = new Date(Date.now() + PHOTO_TTL_HOURS * 3600_000).toISOString();
  }

  // Only flip unused -> submitted, so a double tap cannot overwrite an earlier submission.
  const { data, error } = await db().from('orders').update(update).eq('id', order.id).eq('status', 'unused').select('code');
  if (error) return { ok: false, error: 'Gagal menyimpan. Coba lagi sebentar.' };
  if (!data?.length) return { ok: false, error: 'Kode ini sudah dipakai.' };
  return { ok: true, code: order.code };
}
