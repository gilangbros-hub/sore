import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, Page } from '@/components/Chrome';
import { HOURS, RESULT_TTL_DAYS, waLink } from '@/lib/config';

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
            <QA q="Berapa lama bacaanku jadi?">
              <p className="m-0">Biasanya 1–3 jam setelah datamu terkirim. Link bacaan dikirim ke WhatsApp-mu, dan bisa kamu buka berkali-kali selama {RESULT_TTL_DAYS} hari.</p>
              <p className="m-0">
                Pesanan yang masuk setelah {HOURS.close} WIB dikirim mulai {HOURS.open} WIB keesokan harinya. Cek status kapan saja lewat <Link href="/kode">Punya kode?</Link>
              </p>
            </QA>
            <QA q="Bagaimana foto saya dipakai?">
              <p className="m-0">Fotomu hanya dipakai untuk membuat bacaan ini dan dihapus otomatis setelah 24 jam. Foto tidak pernah muncul di kartu Story.</p>
              <p className="m-0">Penjelasan lengkapnya ada di halaman <Link href="/privasi">Privasi</Link>.</p>
            </QA>
            <QA q="Kode akses hilang?">
              <p className="m-0">
                Masukkan email yang kamu pakai di Lynk.id di halaman <Link href="/klaim">ambil kode</Link>, kodemu akan muncul lagi. Kalau tetap tidak ketemu,{' '}
                <a href={waLink('Halo Ruang Senja, kode aksesku hilang.')}>chat kami di WhatsApp</a> dengan bukti pembayaran, nanti kodenya kami kirim ulang. Kalau bacaanmu sudah jadi, link-nya juga ada di chat WhatsApp dari kami.
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
