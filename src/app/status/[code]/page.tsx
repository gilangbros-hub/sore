import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ChatIcon, Header, MoonIcon, Page, Stars } from '@/components/Chrome';
import { CopyButton } from '@/components/CopyButton';
import { PALM_PATH } from '@/components/Art';
import { getOrderByCode } from '@/lib/orders';
import { CODE_RE, normalizeCode } from '@/lib/codes';
import { maskWa, wibStamp, wibTime } from '@/lib/format';
import { HOURS, PRODUCT_NAME, waLink, type ProductKind } from '@/lib/config';

export const metadata: Metadata = { title: 'Status pesanan', robots: { index: false } };

function Waiting({ kind }: { kind: ProductKind }) {
  return (
    <div aria-hidden="true" className="relative grid h-[170px] w-[200px] place-items-center">
      <div
        className="absolute -inset-2.5 rounded-full motion-safe:animate-breath"
        style={{ background: 'radial-gradient(closest-side, rgba(240,176,103,.22), rgba(107,78,143,.14) 60%, rgba(21,18,46,0))' }}
      />
      {kind === 'tarot' && (
        <div className="relative h-[120px] w-[200px] motion-safe:animate-sway">
          {[
            { left: 30, top: 18, rot: -10, moon: false },
            { left: 74, top: 6, rot: 0, moon: true },
            { left: 118, top: 18, rot: 10, moon: false },
          ].map((c, i) => (
            <div
              key={i}
              className="absolute grid h-[84px] w-[52px] place-items-center rounded-lg bg-night-800 shadow-[inset_0_0_0_1.5px_#E3C584,0_10px_24px_-12px_rgba(0,0,0,.6)]"
              style={{ left: c.left, top: c.top, transform: `rotate(${c.rot}deg)` }}
            >
              {c.moon ? (
                <svg width="26" height="26" viewBox="0 0 34 34"><path d="M20 9a8 8 0 1 0 0 16a10 10 0 0 1 0-16z" fill="#E3C584" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 20 20"><path d="M10 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#E3C584" /></svg>
              )}
            </div>
          ))}
        </div>
      )}
      {kind === 'palm' && (
        <svg width="120" height="170" viewBox="0 0 160 240" className="relative">
          <path d={PALM_PATH} fill="#1E1940" stroke="rgba(227,197,132,.55)" strokeWidth="2.5" strokeLinejoin="round" />
          {[
            ['M72 150C92 140 110 142 128 150', '#F0B067', '0s'],
            ['M62 168C86 162 105 170 124 178', '#E3C584', '.8s'],
            ['M62 150C52 175 58 205 72 226', '#F6C98F', '1.6s'],
          ].map(([d, c, delay]) => (
            <path key={d} className="motion-safe:animate-trace-loop" pathLength={200} style={{ strokeDasharray: 200, animationDelay: delay }} d={d} fill="none" stroke={c} strokeWidth="4" strokeLinecap="round" />
          ))}
        </svg>
      )}
      {kind === 'aura' && (
        <div
          className="relative h-[150px] w-[150px] rounded-full motion-safe:animate-orb-wait"
          style={{ background: 'radial-gradient(circle at 42% 38%, #FBE3C2 0%, #F6C98F 18%, #F0B067 42%, #C9835A 62%, #7A5FA8 86%, rgba(122,95,168,0) 100%)' }}
        />
      )}
    </div>
  );
}

type Step = { title: string; sub: string; state: 'done' | 'now' | 'todo' };

function Timeline({ steps }: { steps: Step[] }) {
  return (
    <ol aria-label="Status pesanan" className="card-block m-0 flex list-none flex-col p-5">
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        const lineDone = s.state === 'done' && steps[i + 1]?.state !== 'todo';
        return (
          <li key={s.title} aria-current={s.state === 'now' ? 'step' : undefined} className="grid grid-cols-[28px_1fr] gap-3.5">
            <div className="flex flex-col items-center">
              {s.state === 'done' && (
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gold-300">
                  <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7" fill="none" stroke="#0F0C24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              )}
              {s.state === 'now' && (
                <span className="grid h-7 w-7 place-items-center rounded-full bg-night-700 shadow-[inset_0_0_0_2px_#F0B067] motion-safe:animate-now">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                </span>
              )}
              {s.state === 'todo' && <span className="h-7 w-7 rounded-full shadow-[inset_0_0_0_2px_rgba(246,239,227,.25)]" />}
              {!last && <span className={`min-h-[22px] w-0.5 flex-1 ${lineDone ? 'bg-gold-300' : 'bg-ivory-50/[.16]'}`} />}
            </div>
            <div className={last ? 'pt-[3px]' : 'pb-[18px] pt-[3px]'}>
              <p className={`m-0 font-semibold ${s.state === 'now' ? 'text-amber-400' : s.state === 'todo' ? 'text-mist-300' : ''}`}>{s.title}</p>
              <p className="m-0 mt-0.5 text-[13px] text-mist-300">{s.sub}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default async function StatusPage({ params }: { params: Promise<{ code: string }> }) {
  const code = normalizeCode(decodeURIComponent((await params).code));
  if (!CODE_RE.test(code)) notFound();
  const order = await getOrderByCode(code);
  if (!order) redirect(`/kode?c=${code}`);
  if (order.status === 'unused') redirect(`/isi/${code}`);
  if (order.status === 'expired') redirect(`/kode?c=${code}`);

  const ready = order.status === 'ready';
  const submitted = new Date(order.submitted_at!);
  const eta = new Date(submitted.getTime() + 3 * 3600_000);
  const productLine =
    order.product === 'tarot' ? `${PRODUCT_NAME.tarot} · ${order.focus}`
    : order.product === 'palm' ? `${PRODUCT_NAME.palm} · ${order.hand === 'kiri' ? 'Kiri' : 'Kanan'}`
    : PRODUCT_NAME.aura;
  const waText = `Halo Ruang Senja, aku mau tanya soal pesananku. Kode: ${code}`;

  const steps: Step[] = [
    { title: 'Pesanan diterima', sub: wibStamp(submitted), state: 'done' },
    ready
      ? { title: 'Bacaan sudah siap', sub: wibStamp(order.delivered_at!), state: 'done' }
      : { title: 'Bacaan sedang disiapkan', sub: `Estimasi selesai sebelum ${wibTime(eta)} WIB`, state: 'now' },
    { title: 'Dikirim ke WhatsApp', sub: 'Link bisa dibuka berkali-kali', state: ready ? 'done' : 'todo' },
  ];

  return (
    <Page
      className="relative overflow-hidden"
      header={<Header right={<a href={waLink(waText)} className="btn btn-secondary btn-sm px-4">Bantuan</a>} />}
    >
      <Stars positions={[[10, 6, 0, 3], [84, 5, 1.4, 3], [72, 18, 2.6, 2], [16, 22, 0.8, 2]]} />
      <main className="relative flex-1 px-5 pb-14 pt-4">
        <div className="mx-auto flex max-w-[520px] flex-col gap-7">
          <div className="flex flex-col items-center gap-[18px] text-center">
            <Waiting kind={order.product} />
            {ready ? (
              <>
                <h1 className="text-balance m-0 font-serif text-4xl font-semibold leading-[1.1]">Bacaanmu sudah siap</h1>
                <p className="text-pretty m-0 text-base leading-[1.65] text-mist-300">
                  Link-nya juga sudah kami kirim ke WhatsApp{' '}
                  <strong className="whitespace-nowrap font-semibold text-ivory-50">{maskWa(order.wa_number)}</strong>. Kamu bisa membukanya lagi sesering yang kamu mau.
                </p>
                <Link href={`/b/${order.result_token}`} className="btn btn-primary w-full">Lihat bacaanku</Link>
              </>
            ) : (
              <>
                <h1 className="text-balance m-0 font-serif text-4xl font-semibold leading-[1.1]">Pesananmu sudah kami terima</h1>
                <p className="text-pretty m-0 text-base leading-[1.65] text-mist-300">
                  Bacaanmu sedang disiapkan dengan tenang. Dalam 1–3 jam, link-nya kami kirim ke WhatsApp{' '}
                  <strong className="whitespace-nowrap font-semibold text-ivory-50">{maskWa(order.wa_number)}</strong>.
                </p>
              </>
            )}
          </div>

          <Timeline steps={steps} />

          <section aria-labelledby="ringkas-pesanan" className="flex flex-col gap-3.5 rounded-card p-5 shadow-[inset_0_0_0_1px_rgba(246,239,227,.14)]">
            <h2 id="ringkas-pesanan" className="m-0 text-base font-bold">Detail pesanan</h2>
            <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-[15px]">
              <dt className="text-mist-300">Bacaan</dt><dd className="m-0 font-semibold">{productLine}</dd>
              <dt className="text-mist-300">Untuk</dt><dd className="m-0 font-semibold">{order.nickname}</dd>
              <dt className="text-mist-300">Kode</dt>
              <dd className="m-0 flex flex-wrap items-center gap-2.5">
                <span className="font-bold tracking-[.12em]">{code}</span>
                <CopyButton text={code} />
              </dd>
            </dl>
            <p className="m-0 text-sm leading-[1.6] text-mist-300">
              Simpan kode ini. Kamu bisa cek status atau membuka bacaanmu lagi lewat <Link href="/kode" className="font-semibold">Punya kode?</Link>
            </p>
          </section>

          {!ready && (
            <p className="m-0 flex items-start gap-2.5 text-sm leading-[1.6] text-mist-300">
              <MoonIcon size={18} />
              <span>
                Kamu boleh menutup halaman ini. Pesanan yang masuk setelah <span className="text-gold-300">{HOURS.close}</span> WIB dikirim mulai{' '}
                <span className="text-gold-300">{HOURS.open}</span> WIB keesokan harinya.
              </span>
            </p>
          )}

          <section aria-labelledby="bantuan-title" className="flex flex-col gap-3 rounded-card bg-night-700 p-5">
            <h2 id="bantuan-title" className="m-0 text-base font-bold">Butuh bantuan?</h2>
            <p className="m-0 text-sm leading-[1.6]">
              Salah isi data, atau sudah lewat 3 jam tapi belum ada kabar? Chat kami langsung, kodemu sudah otomatis tertulis di pesan.
            </p>
            <a href={waLink(waText)} className={`btn w-full ${ready ? 'btn-secondary' : 'btn-primary'}`}>
              <ChatIcon />
              Chat via WhatsApp
            </a>
          </section>

          <Link href="/" className="flink self-center font-semibold">Kembali ke beranda</Link>
        </div>
      </main>
    </Page>
  );
}
