import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, Check, Header, Page, Stars } from '@/components/Chrome';
import { PALM_PATH } from '@/components/Art';
import { LYNK_URL, PRICES, rupiah, type CatalogItem } from '@/lib/config';

const bundleSaving = PRICES.tarot + PRICES.palm + PRICES.aura - PRICES.bundle;

function ProductCard({
  item, title, desc, cta, art,
}: { item: CatalogItem; title: string; desc: string; cta: string; art: ReactNode }) {
  const price = rupiah(PRICES[item]);
  return (
    <article className="card-block flex flex-col gap-4 p-5 transition-[box-shadow] duration-200 hover:shadow-[inset_0_0_0_1px_rgba(227,197,132,.55),0_18px_40px_-24px_rgba(240,176,103,.45)]">
      <div className="flex items-start gap-4">
        {art}
        <div className="flex min-w-0 flex-col gap-1.5">
          <h3 className="m-0 font-serif text-[26px] font-semibold leading-[1.1]">{title}</h3>
          <p className="m-0 text-[15px] leading-[1.55] text-mist-300">{desc}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 text-[22px] font-bold tracking-[-.01em]">{price}</p>
        <a href={LYNK_URL[item]} className="btn btn-primary" aria-label={`Pilih ${title}, ${price}, bayar di Lynk.id`}>
          {cta}
        </a>
      </div>
    </article>
  );
}

const Tile = ({ children }: { children: ReactNode }) => (
  <svg width="76" height="76" viewBox="0 0 76 76" aria-hidden="true" className="flex-none">
    <rect width="76" height="76" rx="16" fill="#2A2353" />
    {children}
  </svg>
);

const STEPS = [
  ['Pilih bacaan', 'Tarot, garis tangan, aura, atau ketiganya.'],
  ['Bayar via Lynk.id', 'Pembayaran diproses di halaman Lynk.id.'],
  ['Masukkan kode & kirim data', 'Kode dikirim ke WhatsApp-mu. Data dan foto cukup dikirim lewat chat.'],
  ['Terima bacaan di WhatsApp', 'Dalam 1–3 jam. Link-nya bisa kamu buka lagi kapan saja.'],
];

export default function Home() {
  return (
    <Page
      header={
        <Header right={<Link href="/kode" className="btn btn-secondary btn-sm">Punya kode?</Link>} />
      }
    >
      <main className="flex-1">
        <section aria-labelledby="hero-title" className="relative overflow-hidden px-5 pb-14 pt-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[-140px] h-[520px] w-[720px] -translate-x-1/2 motion-safe:animate-glow"
            style={{ background: 'radial-gradient(closest-side, rgba(240,176,103,.30), rgba(107,78,143,.22) 55%, rgba(21,18,46,0) 100%)' }}
          />
          <Stars />
          <div className="relative mx-auto flex max-w-[720px] flex-col items-center gap-[18px] text-center">
            <svg width="132" height="22" viewBox="0 0 132 22" aria-hidden="true">
              <circle cx="11" cy="11" r="7" fill="none" stroke="#E3C584" strokeWidth="1.4" />
              <path d="M42 4a7 7 0 0 1 0 14a7 7 0 0 0 0-14z" fill="#E3C584" /><circle cx="42" cy="11" r="7" fill="none" stroke="#E3C584" strokeWidth="1.4" />
              <circle cx="66" cy="11" r="7" fill="#F0B067" />
              <path d="M90 4a7 7 0 0 0 0 14a7 7 0 0 1 0-14z" fill="#E3C584" /><circle cx="90" cy="11" r="7" fill="none" stroke="#E3C584" strokeWidth="1.4" />
              <circle cx="121" cy="11" r="7" fill="none" stroke="#E3C584" strokeWidth="1.4" />
            </svg>
            <h1 id="hero-title" className="text-balance m-0 font-serif text-[clamp(40px,6vw,64px)] font-semibold leading-[1.05] tracking-[-.01em]">
              Tanya kartu, telapak tangan, atau <em className="font-medium italic text-amber-400">auramu</em> malam ini.
            </h1>
            <p className="text-pretty m-0 max-w-[30ch] text-lg leading-[1.6] text-mist-300">
              Bacaan personal, dikirim ke WhatsApp-mu dalam 1–3 jam.
            </p>
            <p className="m-0 mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-sm text-mist-300">
              <span className="inline-flex items-center gap-1.5"><Check />Tanpa akun</span>
              <span className="inline-flex items-center gap-1.5"><Check />Boleh pakai nama panggilan</span>
              <span className="inline-flex items-center gap-1.5"><Check />Dibaca langsung, bukan otomatis</span>
            </p>
          </div>
        </section>

        <section id="bacaan" aria-labelledby="pilih-title" className="scroll-mt-4 px-5 pb-14">
          <div className="mx-auto flex max-w-[1040px] flex-col gap-5">
            <h2 id="pilih-title" className="m-0 font-serif text-[32px] font-semibold leading-[1.15]">Pilih bacaanmu</h2>
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(420px,100%),1fr))]">
              <ProductCard
                item="tarot"
                title="Tarot 5 Kartu"
                desc="Menjawab pertanyaan kamu. Lima kartu dibaca satu per satu, sesuai fokusmu."
                cta="Pilih tarot"
                art={
                  <Tile>
                    <g transform="rotate(-12 24 40)"><rect x="12" y="20" width="22" height="36" rx="4" fill="#15122E" stroke="#E3C584" strokeWidth="1.2" /><path d="M23 32a5 5 0 1 0 0 10a6 6 0 0 1 0-10z" fill="#E3C584" /></g>
                    <rect x="27" y="16" width="22" height="36" rx="4" fill="#15122E" stroke="#E3C584" strokeWidth="1.2" /><path d="M38 27l1.6 3.6 3.9.4-2.9 2.6.8 3.8-3.4-2-3.4 2 .8-3.8-2.9-2.6 3.9-.4z" fill="#E3C584" />
                    <g transform="rotate(12 52 40)"><rect x="42" y="20" width="22" height="36" rx="4" fill="#15122E" stroke="#E3C584" strokeWidth="1.2" /><circle cx="53" cy="37" r="4" fill="#F0B067" /><path d="M53 29v2.5M53 42.5V45M45 37h2.5M58.5 37H61" stroke="#F0B067" strokeWidth="1.2" strokeLinecap="round" /></g>
                  </Tile>
                }
              />
              <ProductCard
                item="palm"
                title="Baca Garis Tangan"
                desc="Kirim foto telapak tanganmu. Empat garis utama dibaca satu per satu."
                cta="Pilih garis tangan"
                art={
                  <Tile>
                    <g transform="translate(14 8) scale(.24)">
                      <path d={PALM_PATH} fill="#15122E" stroke="#E3C584" strokeWidth="5" strokeLinejoin="round" />
                      <path d="M72 150C92 140 110 142 128 150" fill="none" stroke="#F0B067" strokeWidth="6" strokeLinecap="round" />
                      <path d="M62 168C86 162 105 170 124 178" fill="none" stroke="#E3C584" strokeWidth="6" strokeLinecap="round" />
                      <path d="M62 150C52 175 58 205 72 226" fill="none" stroke="#E3C584" strokeWidth="6" strokeLinecap="round" />
                    </g>
                  </Tile>
                }
              />
              <ProductCard
                item="aura"
                title="Baca Aura"
                desc="Kirim foto wajahmu. Kenali warna aura dominan dan pesannya untukmu."
                cta="Pilih aura"
                art={
                  <Tile>
                    <defs>
                      <radialGradient id="home-aura" cx="45%" cy="40%" r="60%">
                        <stop offset="0" stopColor="#F6C98F" /><stop offset=".45" stopColor="#F0B067" /><stop offset=".8" stopColor="#7A5FA8" stopOpacity=".7" /><stop offset="1" stopColor="#2A2353" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <circle cx="38" cy="38" r="28" fill="url(#home-aura)" />
                  </Tile>
                }
              />

              <article className="relative flex flex-col gap-4 rounded-card bg-night-700 p-5 shadow-[inset_0_0_0_1.5px_#F0B067]">
                <p className="m-0 self-start rounded-full bg-amber-400 px-3 py-1.5 text-[13px] font-bold uppercase tracking-[.04em] text-night-950">Paling hemat</p>
                <div className="flex flex-col gap-1.5">
                  <h3 className="m-0 font-serif text-[28px] font-semibold leading-[1.1]">Paket Lengkap</h3>
                  <p className="m-0 text-[15px] leading-[1.55] text-mist-300">Tarot, garis tangan, dan aura. Satu pembayaran, tiga kode akses.</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <p className="m-0 text-[22px] font-bold tracking-[-.01em]">{rupiah(PRICES.bundle)}</p>
                    <p className="m-0 text-[13px] text-gold-300">Hemat {rupiah(bundleSaving)} dari harga satuan</p>
                  </div>
                  <a href={LYNK_URL.bundle} className="btn btn-primary" aria-label={`Pilih Paket Lengkap, ${rupiah(PRICES.bundle)}, bayar di Lynk.id`}>
                    Pilih paket
                  </a>
                </div>
              </article>
            </div>
            <p className="m-0 text-sm leading-[1.6] text-mist-300">
              Pembayaran diproses di Lynk.id. Setelah bayar, kode akses dikirim ke WhatsApp-mu untuk memantau progres dan membuka bacaanmu di sini.
            </p>
          </div>
        </section>

        <section aria-labelledby="cara-title" className="px-5 pb-16">
          <div className="mx-auto flex max-w-[1040px] flex-col gap-5">
            <h2 id="cara-title" className="m-0 font-serif text-[32px] font-semibold leading-[1.15]">Cara kerjanya</h2>
            <ol className="m-0 grid list-none gap-3 p-0 [grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr))]">
              {STEPS.map(([t, d], i) => (
                <li key={t} className="flex items-start gap-3.5 rounded-tile bg-night-800/60 p-4">
                  <span
                    className={`grid h-9 w-9 flex-none place-items-center rounded-full font-serif text-xl font-semibold ${
                      i === 3 ? 'bg-amber-400 text-night-950' : 'text-gold-300 shadow-[inset_0_0_0_1.5px_#E3C584]'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex flex-col gap-1">
                    <p className="m-0 text-base font-semibold">{t}</p>
                    <p className="m-0 text-sm leading-[1.55] text-mist-300">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/kode" className="inline-flex min-h-[44px] items-center gap-2 self-start font-semibold no-underline">
              Sudah punya kode? Cek progres atau buka bacaanmu
              <ArrowRight />
            </Link>
          </div>
        </section>
      </main>
    </Page>
  );
}
