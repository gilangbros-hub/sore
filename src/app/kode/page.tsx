import type { Metadata } from 'next';
import Link from 'next/link';
import { Page } from '@/components/Chrome';
import { RedeemForm } from './RedeemForm';
import { waLink } from '@/lib/config';
import { NO_CODE_TEXT } from '@/lib/wa';

export const metadata: Metadata = { title: 'Buka bacaanmu' };

export default async function KodePage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  return (
    <Page>
      <main className="flex-1 px-5 pb-14 pt-8">
        <div className="mx-auto flex max-w-[440px] flex-col gap-7">
          <div className="relative flex flex-col items-center gap-4 text-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-[-40px] h-[200px] w-[260px] motion-safe:animate-glow"
              style={{ background: 'radial-gradient(closest-side, rgba(240,176,103,.28), rgba(21,18,46,0))' }}
            />
            <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true" className="relative">
              <circle cx="36" cy="36" r="30" fill="#2A2353" />
              <path d="M44 16a20 20 0 1 0 0 40a24 24 0 0 1 0-40z" fill="#F0B067" />
              <circle cx="40" cy="33" r="4.5" fill="#15122E" /><path d="M38 36h4l1.5 9h-7z" fill="#15122E" />
              <circle cx="56" cy="20" r="1.6" fill="#E3C584" /><circle cx="60" cy="32" r="1" fill="#E3C584" />
            </svg>
            <h1 className="relative m-0 font-serif text-4xl font-semibold leading-[1.1]">Buka bacaanmu</h1>
            <p className="text-pretty relative m-0 text-base leading-[1.6] text-mist-300">
              Kode akses dikirim ke WhatsApp-mu setelah pembayaranmu di Lynk.id berhasil. Pakai kode yang sama untuk cek progres atau membuka bacaanmu lagi.
            </p>
          </div>

          <RedeemForm initial={c?.toUpperCase().slice(0, 12) ?? ''} />

          <div className="flex flex-col gap-1 border-t border-ivory-50/10 pt-5">
            <p className="m-0 text-[15px] font-semibold">Belum punya kode?</p>
            <Link href="/#bacaan" className="flink text-[15px] font-semibold">Pilih bacaan dulu di beranda</Link>
            <p className="m-0 mt-3 text-[15px] font-semibold">Sudah bayar tapi kode belum masuk?</p>
            <a href={waLink(NO_CODE_TEXT)} className="flink text-[15px] font-semibold">
              Chat kami di WhatsApp
            </a>
          </div>
        </div>
      </main>
    </Page>
  );
}
