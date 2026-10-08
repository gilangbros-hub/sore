import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { getOrderByCode, type Order } from '@/lib/orders';
import { db } from '@/lib/supabase';
import { PRODUCT_NAME, SITE_URL, waLink } from '@/lib/config';
import { prettyWa, wibStamp } from '@/lib/format';
import { codeDeliveryText, resultDeliveryText } from '@/lib/wa';
import { AdminShell, Badge, Panel } from '../../ui';
import { ResultForm } from './ResultForm';
import { PhoneForm, WaSendButton } from './OrderActions';

export const dynamic = 'force-dynamic';

export default async function AdminOrder({ params }: { params: Promise<{ code: string }> }) {
  await requireAdmin();
  const { code } = await params;
  const order = await getOrderByCode(decodeURIComponent(code).toUpperCase());
  if (!order) notFound();

  // Codes bought together (bundle, qty > 1) go out in one WhatsApp message.
  const siblings: Order[] = order.lynk_ref
    ? ((await db().from('orders').select('*').eq('lynk_ref', order.lynk_ref).order('created_at')).data as Order[]) ?? [order]
    : [order];

  const facts: Array<[string, React.ReactNode]> = [
    ['Produk', PRODUCT_NAME[order.product]],
    ['Status', <Badge key="s" status={order.status} />],
    ['Nama di Lynk', order.buyer_name],
    ['WhatsApp', order.buyer_phone && <a key="wa" href={waLink(undefined, order.buyer_phone)} target="_blank" rel="noreferrer">{prettyWa(order.buyer_phone)}</a>],
    ['Email', order.buyer_email],
    ['Sumber', order.source === 'lynk' ? 'Lynk.id' : order.source === 'manual' ? 'Manual' : null],
    ['Ref', order.lynk_ref],
    ['Produk Lynk / catatan', order.note],
    ['Kode lain di pesanan ini', siblings.length > 1 ? siblings.filter((s) => s.id !== order.id).map((s) => `${s.code} (${PRODUCT_NAME[s.product]})`).join(', ') : null],
    ['Dibayar', order.sold_at && wibStamp(order.sold_at)],
    ['Kode dikirim', order.code_sent_at && wibStamp(order.code_sent_at)],
    ['Data diterima', order.data_received_at && wibStamp(order.data_received_at)],
    ['Bacaan terbit', order.delivered_at && wibStamp(order.delivered_at)],
    ['Link dikirim', order.wa_sent_at && wibStamp(order.wa_sent_at)],
    ['Link aktif sampai', order.expires_at && wibStamp(order.expires_at)],
  ];
  const answers = Object.entries(order.lynk_answers ?? {});
  const sold = order.status !== 'stock' && order.status !== 'expired';

  return (
    <AdminShell back>
      <div className="flex flex-wrap items-baseline gap-4">
        <h1 className="m-0 font-serif text-4xl font-semibold tracking-[.04em]">{order.code}</h1>
        <Badge status={order.status} />
        <a href={`${SITE_URL}/status/${order.code}`} target="_blank" rel="noreferrer" className="text-sm font-semibold">Lihat halaman progres pembeli</a>
      </div>

      <Panel title="Pembeli">
        <dl className="m-0 grid grid-cols-[150px_1fr] gap-x-4 gap-y-2 text-[15px]">
          {facts.filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-mist-300">{k}</dt>
              <dd className="m-0 break-words font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        {answers.length > 0 && (
          <div className="flex flex-col gap-2 rounded-tile bg-night-900 p-4">
            <p className="m-0 text-sm font-bold">Jawaban di Lynk</p>
            {answers.map(([q, a]) => (
              <p key={q} className="m-0 text-sm"><span className="text-mist-300">{q}</span><br />{/^https?:\/\//.test(a) ? <a href={a} target="_blank" rel="noreferrer">{a}</a> : a}</p>
            ))}
          </div>
        )}
        {sold && <PhoneForm code={order.code} current={order.buyer_phone} />}
      </Panel>

      {order.status === 'stock' && (
        <Panel title="Kode ini masih stok">
          <p className="m-0 text-sm text-mist-300">Belum terjual. Kalau kamu berikan langsung ke pembeli, kode aktif otomatis saat pertama kali dimasukkan di website.</p>
        </Panel>
      )}

      {sold && order.buyer_phone && (
        <Panel title="1 · Kirim kode ke pembeli">
          <pre className="m-0 whitespace-pre-wrap rounded-tile bg-night-900 p-4 font-sans text-sm leading-[1.6]">{codeDeliveryText(order.buyer_name, siblings)}</pre>
          <WaSendButton code={order.code} kind="code" href={waLink(codeDeliveryText(order.buyer_name, siblings), order.buyer_phone)} sent={!!order.code_sent_at} />
        </Panel>
      )}

      {sold && (
        <Panel title={order.status === 'ready' ? '2 · Bacaan (sudah terbit, edit tetap bisa)' : '2 · Tulis bacaan'}>
          <ResultForm
            code={order.code}
            kind={order.product}
            status={order.status}
            initial={order.result_draft ?? order.result ?? null}
            meta={{ nickname: order.nickname ?? order.buyer_name?.split(' ')[0] ?? '', focus: (order.focus ?? '') as never }}
          />
        </Panel>
      )}

      {order.status === 'ready' && order.result_token && (
        <Panel title="3 · Kirim link bacaan">
          <p className="m-0 break-all text-sm"><a href={`${SITE_URL}/b/${order.result_token}`} target="_blank" rel="noreferrer">{SITE_URL}/b/{order.result_token}</a></p>
          <pre className="m-0 whitespace-pre-wrap rounded-tile bg-night-900 p-4 font-sans text-sm leading-[1.6]">{resultDeliveryText(order.nickname, order.product, order.code, order.result_token)}</pre>
          {order.buyer_phone ? (
            <WaSendButton code={order.code} kind="result" href={waLink(resultDeliveryText(order.nickname, order.product, order.code, order.result_token), order.buyer_phone)} sent={!!order.wa_sent_at} />
          ) : (
            <p className="m-0 text-sm text-coral-300">Isi nomor WhatsApp pembeli dulu di atas.</p>
          )}
        </Panel>
      )}
    </AdminShell>
  );
}
