import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/supabase';
import { safeEqual } from '@/lib/secrets';

// Daily Vercel Cron (vercel.json). Sends "Authorization: Bearer <CRON_SECRET>".
// Also keeps the free Supabase project from pausing for inactivity.

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET || '';
  const auth = req.headers.get('authorization') || '';
  if (!secret || !safeEqual(auth, `Bearer ${secret}`)) return NextResponse.json({ ok: false }, { status: 401 });

  const supa = db();
  const now = new Date();

  // Expire readings past their viewing window and scrub personal data.
  const { data: expired } = await supa
    .from('orders')
    .update({
      status: 'expired',
      buyer_name: null, buyer_email: null, buyer_phone: null, lynk_answers: null,
      nickname: null, focus: null, result: null, result_draft: null,
    })
    .eq('status', 'ready')
    .lt('expires_at', now.toISOString())
    .select('code');

  // Keep the webhook log short; it holds buyer contact details.
  await supa.from('webhook_events').delete().lt('received_at', new Date(now.getTime() - 30 * 86400_000).toISOString());

  return NextResponse.json({ ok: true, expired: expired?.length ?? 0 });
}
