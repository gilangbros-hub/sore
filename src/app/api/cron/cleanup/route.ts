import { NextResponse, type NextRequest } from 'next/server';
import { db, PHOTO_BUCKET } from '@/lib/supabase';
import { safeEqual } from '@/lib/secrets';
import { PHOTO_TTL_HOURS } from '@/lib/config';

// Called hourly by Supabase pg_cron (see supabase/schema.sql) and daily by Vercel Cron as a backup.
// Both send "Authorization: Bearer <CRON_SECRET>".

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET || '';
  const auth = req.headers.get('authorization') || '';
  if (!secret || !safeEqual(auth, `Bearer ${secret}`)) return NextResponse.json({ ok: false }, { status: 401 });

  const supa = db();
  const now = new Date();
  const cutoff = new Date(now.getTime() - PHOTO_TTL_HOURS * 3600_000);
  let photosDeleted = 0;

  // 1. Delete every stored photo older than the TTL, including orphans from abandoned uploads.
  const { data: folders } = await supa.storage.from(PHOTO_BUCKET).list('', { limit: 1000 });
  for (const folder of folders ?? []) {
    if (folder.id) continue; // a file at the root, not a folder
    const { data: files } = await supa.storage.from(PHOTO_BUCKET).list(folder.name, { limit: 100 });
    const old = (files ?? []).filter((f) => f.created_at && new Date(f.created_at) < cutoff).map((f) => `${folder.name}/${f.name}`);
    if (old.length) {
      const { error } = await supa.storage.from(PHOTO_BUCKET).remove(old);
      if (!error) photosDeleted += old.length;
    }
  }
  await supa
    .from('orders')
    .update({ photo_deleted_at: now.toISOString() })
    .lt('photo_delete_at', now.toISOString())
    .is('photo_deleted_at', null)
    .not('photo_path', 'is', null);

  // 2. Expire readings past their viewing window and scrub personal data.
  const { data: expired } = await supa
    .from('orders')
    .update({
      status: 'expired',
      nickname: null, wa_number: null, question: null, buyer_email: null,
      result: null, result_draft: null,
    })
    .eq('status', 'ready')
    .lt('expires_at', now.toISOString())
    .select('code');

  // 3. Keep the webhook log short.
  await supa.from('webhook_events').delete().lt('received_at', new Date(now.getTime() - 30 * 86400_000).toISOString());

  return NextResponse.json({ ok: true, photosDeleted, expired: expired?.length ?? 0 });
}
