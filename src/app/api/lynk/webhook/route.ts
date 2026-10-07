import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/supabase';
import { issueCodes } from '@/lib/orders';
import { parseLynk } from '@/lib/lynk';
import { safeEqual } from '@/lib/secrets';
import type { ProductKind } from '@/lib/config';

// Lynk.id → Settings → Integrations → Webhook URL:
//   https://<site>/api/lynk/webhook?key=<LYNK_WEBHOOK_SECRET>

async function log(status: string, detail: string, payload: unknown, ref?: string | null, email?: string | null) {
  await db().from('webhook_events').insert({ status, detail, payload: payload as object, lynk_ref: ref ?? null, email: email ?? null });
}

export async function POST(req: NextRequest) {
  const secret = process.env.LYNK_WEBHOOK_SECRET || '';
  const key = req.nextUrl.searchParams.get('key') || req.headers.get('x-webhook-key') || '';
  if (!secret || !safeEqual(key, secret)) return NextResponse.json({ ok: false }, { status: 401 });

  const raw = await req.text();
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    payload = Object.fromEntries(new URLSearchParams(raw));
  }

  try {
    const p = parseLynk(payload);
    if (p.failed) {
      await log('ignored', 'Status pembayaran bukan sukses', payload, p.ref, p.email);
      return NextResponse.json({ ok: true });
    }
    const mapped = p.items.filter((i) => i.product);
    if (!p.ref || !p.email || !mapped.length) {
      const missing = [!p.ref && 'nomor pesanan', !p.email && 'email', !mapped.length && 'produk yang dikenali'].filter(Boolean).join(', ');
      await log('unmatched', `Tidak ketemu: ${missing}`, payload, p.ref, p.email);
      return NextResponse.json({ ok: true });
    }

    const rows: Parameters<typeof issueCodes>[0] = [];
    p.items.forEach((item, idx) => {
      if (!item.product) return;
      const products: ProductKind[] = item.product === 'bundle' ? ['tarot', 'palm', 'aura'] : [item.product];
      for (let u = 0; u < item.qty; u++) {
        for (const product of products) {
          rows.push({ product, source: 'lynk', buyer_email: p.email, lynk_ref: p.ref, lynk_key: `${p.ref}:${idx}:${u}:${product}`, note: item.title });
        }
      }
    });

    const { created, skipped } = await issueCodes(rows);
    const unknown = p.items.filter((i) => !i.product).map((i) => i.title);
    const detail = [
      created.length && `${created.length} kode dibuat (${created.map((o) => o.code).join(', ')})`,
      skipped && `${skipped} sudah ada`,
      unknown.length && `produk tidak dikenali: ${unknown.join(', ')}`,
    ].filter(Boolean).join(' · ');
    await log(created.length ? 'issued' : 'duplicate', detail, payload, p.ref, p.email);
    return NextResponse.json({ ok: true, created: created.length });
  } catch (e) {
    await log('error', (e as Error).message?.slice(0, 500) ?? 'error', payload).catch(() => {});
    // 500 so Lynk retries; the lynk_key makes retries safe.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
