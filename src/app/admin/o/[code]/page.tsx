import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { getOrderByCode } from '@/lib/orders';
import { db, PHOTO_BUCKET } from '@/lib/supabase';
import { PRODUCT_NAME, RESULT_TTL_DAYS, SITE_URL, waLink } from '@/lib/config';
import { prettyWa, wibStamp } from '@/lib/format';
import { AdminShell, Badge, Panel } from '../../ui';
import { ResultForm } from './ResultForm';
import { OrderActions } from './OrderActions';

export const dynamic = 'force-dynamic';

export default async function AdminOrder({ params }: { params: Promise<{ code: string }> }) {
  await requireAdmin();
  const { code } = await params;
  const order = await getOrderByCode(decodeURIComponent(code).toUpperCase());
  if (!order) notFound();

  let photoUrl: string | null = null;
  if (order.photo_path && !order.photo_deleted_at) {
    const { data } = await db().storage.from(PHOTO_BUCKET).createSignedUrl(order.photo_path, 600);
    photoUrl = data?.signedUrl ?? null;
  }

  const resultUrl = order.result_token ? `${SITE_URL}/b/${order.result_token}` : null;
  const waText = resultUrl
    ? [
        `Halo ${order.nickname}, bacaan ${PRODUCT_NAME[order.product]}-mu sudah siap.`,
        '',
        `Buka di sini: ${resultUrl}`,
        '',
        `Link-nya bisa kamu buka lagi kapan saja selama ${RESULT_TTL_DAYS} hari. Kode aksesmu: ${order.code}`,
        '',
        'Ruang Senja untuk hiburan dan refleksi diri, bukan pengganti nasihat profesional.',
      ].join('\n')
    : null;

  const facts: Array<[string, React.ReactNode]> = [
    ['Produk', PRODUCT_NAME[order.product]],
    ['Status', <Badge key="s" status={order.status} />],
    ['Nama', order.nickname],
    ['WhatsApp', order.wa_number && <a key="wa" href={waLink(undefined, order.wa_number)} target="_blank" rel="noreferrer">{prettyWa(order.wa_number)}</a>],
    ['Fokus', order.focus],
    ['Pertanyaan', order.question],
    ['Tangan', order.hand],
    ['Email Lynk', order.buyer_email],
    ['Ref Lynk', order.lynk_ref],
    ['Catatan', order.note],
    ['Dibuat', wibStamp(order.created_at)],
    ['Data masuk', order.submitted_at && wibStamp(order.submitted_at)],
    ['Dikirim', order.delivered_at && wibStamp(order.delivered_at)],
    ['WA terkirim', order.wa_sent_at && wibStamp(order.wa_sent_at)],
    ['Link aktif sampai', order.expires_at && wibStamp(order.expires_at)],
  ];

  return (
    <AdminShell back>
      <div className="flex flex-wrap items-baseline gap-4">
        <h1 className="m-0 font-serif text-4xl font-semibold tracking-[.04em]">{order.code}</h1>
        <Badge status={order.status} />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Panel title="Data pembeli">
          <dl className="m-0 grid grid-cols-[130px_1fr] gap-x-4 gap-y-2 text-[15px]">
            {facts.filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-mist-300">{k}</dt>
                <dd className="m-0 break-words font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <OrderActions code={order.code} status={order.status} hasPhoto={!!photoUrl} />
        </Panel>

        {order.product !== 'tarot' && (
          <Panel title="Foto">
            {photoUrl ? (
              <a href={photoUrl} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl} alt="Foto dari pembeli" className="w-full rounded-tile" />
              </a>
            ) : (
              <p className="m-0 text-sm text-mist-300">{order.photo_deleted_at ? 'Foto sudah dihapus.' : 'Belum ada foto.'}</p>
            )}
            {photoUrl && <p className="m-0 text-xs text-mist-300">Link foto berlaku 10 menit. HEIC mungkin hanya bisa dibuka di Safari; klik untuk mengunduh.</p>}
          </Panel>
        )}
      </div>

      {order.status !== 'unused' && order.status !== 'expired' && (
        <Panel title={order.status === 'ready' ? 'Hasil bacaan (sudah terbit, edit tetap bisa)' : 'Tulis hasil bacaan'}>
          <ResultForm code={order.code} kind={order.product} initial={order.result_draft ?? order.result ?? null} focus={order.focus} />
        </Panel>
      )}

      {resultUrl && waText && order.wa_number && (
        <Panel title="Kirim ke WhatsApp">
          <p className="m-0 break-all text-sm"><a href={resultUrl} target="_blank" rel="noreferrer">{resultUrl}</a></p>
          <pre className="m-0 whitespace-pre-wrap rounded-tile bg-night-900 p-4 font-sans text-sm leading-[1.6]">{waText}</pre>
          <OrderActions code={order.code} status={order.status} waHref={waLink(waText, order.wa_number)} waSent={!!order.wa_sent_at} />
        </Panel>
      )}
    </AdminShell>
  );
}
