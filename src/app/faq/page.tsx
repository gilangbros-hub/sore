import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, Page } from '@/components/Chrome';
import { HOURS, RESULT_TTL_DAYS, waLink } from '@/lib/config';
import { NO_CODE_TEXT } from '@/lib/wa';

export const metadata: Metadata = { title: 'FAQ' };

function QA({ q, children, open = false }: { q: string; children: ReactNode; open?: boolean }) {
  return (
    <details className="qa card-block rounded-[18px]" open={open}>
      <summary className="flex min-h-[60px] cursor-pointer items-center justify-between gap-4 rounded-[18px] px-5 py-3.5 text-[17px] font-semibold leading-[1.4]">
        {q}
        <svg className="chev flex-none" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 8l5 5 5-5" fill="none" stroke="#E3C584" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </summary>
      <div className="flex flex-col gap-2.5 px-5 pb-5 text-base leading-[1.7]">{children}</div>
    </details>
  );
}

export default function FaqPage() {
  return (
    <Page>
      <main className="flex-1 px-5 pb-14 pt-6">
        <div className="mx-auto flex max-w-[640px] flex-col gap-7">
          <div className="flex flex-col gap-2.5">
            <h1 className="m-0 font-serif text-[40px] font-semibold leading-[1.05]">Pertanyaan yang sering muncul</h1>
            <p className="m-0 text-base leading-[1.6] text-mist-300">
              Belum terjawab di sini? <a href={waLink()}>Chat kami di WhatsApp</a>.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <QA q="Apakah ini akurat?" open>
              <p className="m-0">Bacaan ini dibuat untuk hiburan dan bahan refleksi. Pakai sebagai cermin, bukan sebagai keputusan.</p>
            </QA>
            <QA q="Siapa yang membaca?">
              <p className="m-0">Setiap bacaan disusun langsung oleh pembaca Ruang Senja berdasarkan data dan foto yang kamu kirim, satu per satu.</p>
            </QA>
            <QA q="Berapa lama bacaanku jadi?">
              <p className="m-0">Biasanya 1–3 jam setelah datamu kami terima di WhatsApp. Link bacaan dikirim ke WhatsApp-mu, dan bisa kamu buka berkali-kali selama {RESULT_TTL_DAYS} hari.</p>
              <p className="m-0">
                Data yang masuk setelah {HOURS.close} WIB dibaca mulai {HOURS.open} WIB keesokan harinya. Cek progres kapan saja lewat <Link href="/kode">Punya kode?</Link>
              </p>
            </QA>
            <QA q="Bagaimana foto saya dipakai?">
              <p className="m-0">Foto telapak tangan atau wajah kamu kirim lewat WhatsApp, hanya dipakai untuk membuat bacaanmu, dan kami hapus setelah bacaan dikirim. Foto tidak pernah muncul di website atau di kartu Story.</p>
              <p className="m-0">Penjelasan lengkapnya ada di halaman <Link href="/privasi">Privasi</Link>.</p>
            </QA>
            <QA q="Belum dapat kode atau kodenya hilang?">
              <p className="m-0">
                Kode dikirim ke WhatsApp-mu setelah pembayaran di Lynk.id berhasil. Belum masuk atau hilang?{' '}
                <a href={waLink(NO_CODE_TEXT)}>Chat kami di WhatsApp</a> dengan nama atau email yang kamu pakai di Lynk.id, nanti kodenya kami kirim ulang.
              </p>
            </QA>
            <QA q="Bisa refund?">
              <p className="m-0">Kalau bacaan gagal dibuat karena error sistem, kode akses kamu bisa dipakai ulang atau dana dikembalikan.</p>
            </QA>
          </div>

          <Link href="/#bacaan" className="inline-flex min-h-[44px] items-center gap-2 self-start font-semibold no-underline">
            Lihat pilihan bacaan
            <ArrowRight />
          </Link>
        </div>
      </main>
    </Page>
  );
}
