import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { db } from '@/lib/supabase';
import type { Order } from '@/lib/orders';
import { PRODUCT_NAME, SITE_URL, type ProductKind } from '@/lib/config';
import { prettyWa, wibStamp } from '@/lib/format';
import { AdminShell, Badge, Panel } from './ui';
import { SellForm, StockForm } from './Forms';

export const dynamic = 'force-dynamic';

type Ev = { id: number; received_at: string; status: string; lynk_ref: string | null; detail: string | null; payload: unknown };

function ago(iso: string) {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  return h < 48 ? `${h} jam ${m % 60} menit lalu` : `${Math.floor(h / 24)} hari lalu`;
}

function Row({ o, since, lateAfterH }: { o: Order; since?: string | null; lateAfterH?: number }) {
  const late = since && lateAfterH && Date.now() - new Date(since).getTime() > lateAfterH * 3600_000;
  return (
    <li>
      <Link href={`/admin/o/${o.code}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-tile bg-night-900 px-4 py-3 text-ivory-50 no-underline hover:bg-night-700 hover:text-ivory-50">
        <span className="font-bold tracking-[.1em]">{o.code}</span>
        <span className="text-sm">{PRODUCT_NAME[o.product]}</span>
        {(o.nickname || o.buyer_name) && <span className="text-sm text-mist-300">{o.nickname || o.buyer_name}</span>}
        {o.buyer_phone && <span className="text-sm text-mist-300">{prettyWa(o.buyer_phone)}</span>}
        <span className="ml-auto flex items-center gap-3 text-xs text-mist-300">
          {since && <span className={late ? 'font-bold text-coral-300' : ''}>{ago(since)}</span>}
          {o.status === 'ready' && !o.wa_sent_at && <span className="font-bold text-coral-300">Link belum dikirim</span>}
          <Badge status={o.status} />
        </span>
      </Link>
    </li>
  );
}

const List = ({ rows, empty, ...rest }: { rows: Order[] | null; empty: string; since?: (o: Order) => string | null; lateAfterH?: number }) =>
  rows?.length ? (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {rows.map((o) => <Row key={o.id} o={o} since={rest.since?.(o)} lateAfterH={rest.lateAfterH} />)}
    </ul>
  ) : (
    <p className="m-0 text-mist-300">{empty}</p>
  );

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const { q } = await searchParams;
  const supa = db();
  const term = q?.trim();
  const safe = term?.replace(/[%,()*\\]/g, '');

  const [search, toSend, waiting, reading, ready, stock, events] = await Promise.all([
    safe
      ? supa.from('orders').select('*').or(`code.ilike.%${safe}%,buyer_email.ilike.%${safe}%,buyer_name.ilike.%${safe}%,nickname.ilike.%${safe}%,buyer_phone.ilike.%${safe}%`).order('created_at', { ascending: false }).limit(30)
      : null,
    supa.from('orders').select('*').eq('status', 'sold').is('code_sent_at', null).order('sold_at', { ascending: true }).limit(100),
    supa.from('orders').select('*').eq('status', 'sold').not('code_sent_at', 'is', null).order('sold_at', { ascending: true }).limit(100),
    supa.from('orders').select('*').eq('status', 'reading').order('data_received_at', { ascending: true }).limit(100),
    supa.from('orders').select('*').eq('status', 'ready').order('delivered_at', { ascending: false }).limit(15),
    supa.from('orders').select('product').eq('status', 'stock'),
    supa.from('webhook_events').select('*').order('received_at', { ascending: false }).limit(15),
  ]);

  const counts: Record<ProductKind, number> = { tarot: 0, palm: 0, aura: 0 };
  for (const r of (stock.data ?? []) as Array<{ product: ProductKind }>) counts[r.product]++;

  return (
    <AdminShell>
      <form className="flex gap-2" role="search">
        <label htmlFor="q" className="sr-only">Cari</label>
        <input id="q" name="q" defaultValue={term} placeholder="Cari kode, nama, email, atau nomor" className="field" />
        <button className="btn btn-secondary">Cari</button>
      </form>

      {search && (
        <Panel title={`Hasil pencarian “${term}”`}>
          <List rows={search.data as Order[]} empty="Tidak ada yang cocok." />
        </Panel>
      )}

      <Panel title={`1 · Kirim kode ke pembeli (${toSend.data?.length ?? 0})`} aside={<span className="text-sm text-mist-300">Sudah bayar, kode belum dikirim via WA.</span>}>
        <List rows={toSend.data as Order[]} empty="Semua kode sudah dikirim." since={(o) => o.sold_at} lateAfterH={1} />
      </Panel>

      <Panel title={`2 · Sedang dibaca (${reading.data?.length ?? 0})`} aside={<span className="text-sm text-mist-300">Merah = lewat 3 jam sejak data diterima.</span>}>
        <List rows={reading.data as Order[]} empty="Tidak ada yang menunggu dibaca." since={(o) => o.data_received_at} lateAfterH={3} />
      </Panel>

      <Panel title={`Menunggu data dari pembeli (${waiting.data?.length ?? 0})`}>
        <List rows={waiting.data as Order[]} empty="Tidak ada." since={(o) => o.sold_at} />
      </Panel>

      <Panel title="Baru terbit">
        <List rows={ready.data as Order[]} empty="Belum ada." />
      </Panel>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Panel title="Stok kode">
          <dl className="m-0 grid grid-cols-3 gap-3 text-center">
            {(Object.keys(counts) as ProductKind[]).map((p) => (
              <div key={p} className={`rounded-tile bg-night-900 p-3 ${counts[p] < 5 ? 'shadow-[inset_0_0_0_1px_rgba(244,162,140,.5)]' : ''}`}>
                <dt className="text-xs text-mist-300">{PRODUCT_NAME[p]}</dt>
                <dd className="m-0 text-2xl font-bold">{counts[p]}</dd>
              </div>
            ))}
          </dl>
          <StockForm />
          <p className="m-0 text-xs text-mist-300">Kalau stok habis, webhook tetap membuat kode baru, jadi pesanan tidak pernah gagal.</p>
        </Panel>
        <Panel title="Jual manual">
          <SellForm />
        </Panel>
      </div>

      <Panel title="Webhook Lynk.id" aside={<code className="text-xs text-mist-300">{SITE_URL}/api/lynk/webhook</code>}>
        {events.data?.length ? (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {(events.data as Ev[]).map((e) => (
              <li key={e.id} className="rounded-tile bg-night-900 px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${e.status === 'assigned' ? 'bg-gold-300/20 text-gold-300' : ['unmatched', 'error', 'rejected'].includes(e.status) ? 'bg-coral-300/20 text-coral-300' : 'bg-night-700 text-mist-300'}`}>{e.status}</span>
                  <span className="text-mist-300">{wibStamp(e.received_at)}</span>
                  {e.lynk_ref && <span>ref {e.lynk_ref}</span>}
                </div>
                {e.detail && <p className="m-0 mt-1.5">{e.detail}</p>}
                {e.payload != null && (
                  <details className="mt-1.5">
                    <summary className="cursor-pointer text-xs text-mist-300">Payload mentah</summary>
                    <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-night-950 p-3 text-xs">{JSON.stringify(e.payload, null, 2)}</pre>
                  </details>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 text-mist-300">Belum ada webhook masuk.</p>
        )}
      </Panel>
    </AdminShell>
  );
}
