import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/supabase';
import { assignCode, type Order } from '@/lib/orders';
import { mapProduct, parseAnswers, signatureDiagnostics, type LynkPayload } from '@/lib/lynk';
import { normalizeWa } from '@/lib/codes';
import type { ProductKind } from '@/lib/config';

// Lynk.id → Settings → Integrations → Webhook URL: https://<site>/api/lynk/webhook
// Then copy the merchant key Lynk shows into LYNK_MERCHANT_KEY.

async function log(status: string, detail: string, payload: unknown, ref?: string | null) {
  await db().from('webhook_events').insert({ status, detail, payload: payload as object, lynk_ref: ref ?? null });
}

export async function POST(req: NextRequest) {
  const merchantKey = process.env.LYNK_MERCHANT_KEY || '';
  const raw = await req.text();
  let payload: LynkPayload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const signature = req.headers.get('x-lynk-signature') || '';
  const diagnostics = signatureDiagnostics(payload, signature, merchantKey);
  if (!diagnostics.valid) {
    // Keep secrets and customer data out of logs; prefixes are enough to diagnose hash mismatches.
    console.warn('Lynk webhook rejected', diagnostics);
    const reason = !diagnostics.keyConfigured
      ? 'Merchant key belum terbaca oleh deployment'
      : !diagnostics.signaturePresent
        ? 'Header X-Lynk-Signature tidak dikirim'
        : 'Signature tidak cocok';
    await log('rejected', reason, null).catch(() => {});
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const md = payload.data?.message_data;
  const ref = md?.refId ?? null;
  try {
    if (payload.event !== 'payment.received' || payload.data?.message_action !== 'SUCCESS') {
      await log('ignored', `Event ${payload.event} / ${payload.data?.message_action}`, payload, ref);
      return NextResponse.json({ ok: true });
    }
    if (!ref) {
      await log('unmatched', 'refId kosong', payload, ref);
      return NextResponse.json({ ok: true });
    }

    const { count: existing } = await db().from('orders').select('id', { count: 'exact', head: true }).eq('lynk_ref', ref);
    const customer = md?.customer ?? {};
    const phone = normalizeWa(customer.phone ?? '');
    const assigned: Order[] = [];
    const unknown: string[] = [];

    for (const [idx, item] of (md?.items ?? []).entries()) {
      const title = item.title ?? '';
      const kind = mapProduct(title);
      if (!kind) {
        unknown.push(title || '(tanpa judul)');
        continue;
      }
      const products: ProductKind[] = kind === 'bundle' ? ['tarot', 'palm', 'aura'] : [kind];
      const qty = Math.max(1, Math.min(10, Number(item.qty) || 1));
      for (let u = 0; u < qty; u++) {
        for (const product of products) {
          assigned.push(
            await assignCode({
              product, source: 'lynk', lynkKey: `${ref}:${idx}:${u}:${product}`, lynkRef: ref,
              name: customer.name ?? null, email: customer.email ?? null, phone,
              answers: parseAnswers(item.questions), note: title,
            }),
          );
        }
      }
    }

    const detail = [
      assigned.length && `Kode: ${assigned.map((o) => o.code).join(', ')}`,
      !phone && 'nomor HP pembeli kosong atau tidak valid',
      unknown.length && `produk tidak dikenali: ${unknown.join(', ')}`,
    ].filter(Boolean).join(' · ');
    const status = !assigned.length ? 'unmatched' : existing ? 'duplicate' : 'assigned';
    await log(status, detail || 'Tidak ada item', payload, ref);
    return NextResponse.json({ ok: true });
  } catch (e) {
    await log('error', (e as Error).message?.slice(0, 500) ?? 'error', payload, ref).catch(() => {});
    // 500 so Lynk retries; lynk_key makes retries safe.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
