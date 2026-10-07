import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { db } from '@/lib/supabase';
import type { Order } from '@/lib/orders';
import { PRODUCT_NAME, SITE_URL } from '@/lib/config';
import { wibStamp } from '@/lib/format';
import { AdminShell, Badge, Panel } from './ui';
import { GenerateForm } from './GenerateForm';

export const dynamic = 'force-dynamic';

type Ev = { id: number; received_at: string; status: string; lynk_ref: string | null; email: string | null; detail: string | null; payload: unknown };

function ago(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  return h < 48 ? `${h} jam ${m % 60} menit lalu` : `${Math.floor(h / 24)} hari lalu`;
}

function Row({ o, showAge }: { o: Order; showAge?: boolean }) {
  const late = showAge && o.submitted_at && Date.now() - new Date(o.submitted_at).getTime() > 3 * 3600_000;
  return (
    <li>
      <Link href={`/admin/o/${o.code}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-tile bg-night-900 px-4 py-3 text-ivory-50 no-underline hover:bg-night-700 hover:text-ivory-50">
        <span className="font-bold tracking-[.1em]">{o.code}</span>
        <span className="text-sm">{PRODUCT_NAME[o.product]}</span>
        {o.nickname && <span className="text-sm text-mist-300">{o.nickname}</span>}
        {o.buyer_email && <span className="text-sm text-mist-300">{o.buyer_email}</span>}
        <span className="ml-auto flex items-center gap-3 text-xs text-mist-300">
          {showAge && o.submitted_at && <span className={late ? 'font-bold text-coral-300' : ''}>{ago(o.submitted_at)}</span>}
          {o.status === 'ready' && !o.wa_sent_at && <span className="font-bold text-coral-300">WA belum dikirim</span>}
          <Badge status={o.status} />
        </span>
      </Link>
    </li>
  );
}

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const { q } = await searchParams;
  const supa = db();

  const term = q?.trim();
  const safe = term?.replace(/[%,()*\\]/g, '');
  const search = safe
    ? await supa.from('orders').select('*').or(`code.ilike.%${safe}%,buyer_email.ilike.%${safe}%,nickname.ilike.%${safe}%`).order('created_at', { ascending: false }).limit(30)
    : null;

  const [queue, ready, unused, events] = await Promise.all([
    supa.from('orders').select('*').eq('status', 'submitted').order('submitted_at', { ascending: true }).limit(100),
    supa.from('orders').select('*').eq('status', 'ready').order('delivered_at', { ascending: false }).limit(15),
    supa.from('orders').select('*').eq('status', 'unused').order('created_at', { ascending: false }).limit(20),
    supa.from('webhook_events').select('*').order('received_at', { ascending: false }).limit(15),
  ]);

  const webhookUrl = `${SITE_URL}/api/lynk/webhook?key=…`;

  return (
    <AdminShell>
      <form className="flex gap-2" role="search">
        <label htmlFor="q" className="sr-only">Cari</label>
        <input id="q" name="q" defaultValue={term} placeholder="Cari kode, email, atau nama" className="field" />
        <button className="btn btn-secondary">Cari</button>
      </form>

      {search && (
        <Panel title={`Hasil pencarian “${term}”`}>
          {search.data?.length ? (
            <ul className="m-0 flex list-none flex-col gap-2 p-0">{(search.data as Order[]).map((o) => <Row key={o.id} o={o} />)}</ul>
          ) : (
            <p className="m-0 text-mist-300">Tidak ada yang cocok.</p>
          )}
        </Panel>
      )}

      <Panel title={`Antrean (${queue.data?.length ?? 0})`} aside={<span className="text-sm text-mist-300">Paling lama di atas. Merah = lewat 3 jam.</span>}>
        {queue.data?.length ? (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">{(queue.data as Order[]).map((o) => <Row key={o.id} o={o} showAge />)}</ul>
        ) : (
          <p className="m-0 text-mist-300">Tidak ada yang menunggu. Santai dulu.</p>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Buat kode manual">
          <GenerateForm />
        </Panel>
        <Panel title="Kode belum dipakai">
          <ul className="m-0 flex list-none flex-col gap-2 p-0">{(unused.data as Order[] | null)?.map((o) => <Row key={o.id} o={o} />)}</ul>
        </Panel>
      </div>

      <Panel title="Baru terkirim">
        <ul className="m-0 flex list-none flex-col gap-2 p-0">{(ready.data as Order[] | null)?.map((o) => <Row key={o.id} o={o} />)}</ul>
      </Panel>

      <Panel title="Webhook Lynk.id" aside={<code className="text-xs text-mist-300">{webhookUrl}</code>}>
        {events.data?.length ? (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {(events.data as Ev[]).map((e) => (
              <li key={e.id} className="rounded-tile bg-night-900 px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${e.status === 'issued' ? 'bg-gold-300/20 text-gold-300' : e.status === 'unmatched' || e.status === 'error' ? 'bg-coral-300/20 text-coral-300' : 'bg-night-700 text-mist-300'}`}>{e.status}</span>
                  <span className="text-mist-300">{wibStamp(e.received_at)}</span>
                  {e.lynk_ref && <span>ref {e.lynk_ref}</span>}
                  {e.email && <span>{e.email}</span>}
                </div>
                {e.detail && <p className="m-0 mt-1.5">{e.detail}</p>}
                <details className="mt-1.5">
                  <summary className="cursor-pointer text-xs text-mist-300">Payload mentah</summary>
                  <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-night-950 p-3 text-xs">{JSON.stringify(e.payload, null, 2)}</pre>
                </details>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 text-mist-300">Belum ada webhook masuk. Pakai tombol “Test URL” di Lynk.id untuk mengecek.</p>
        )}
      </Panel>
    </AdminShell>
  );
}
