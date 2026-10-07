import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Page } from '@/components/Chrome';
import { PHOTO_TTL_HOURS, RESULT_TTL_DAYS, waLink } from '@/lib/config';

export const metadata: Metadata = { title: 'Kebijakan privasi' };

// Draft. Have it checked before launch, especially the processing location and the AI statement.
const UPDATED = '7 Oktober 2026';

function S({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="m-0 font-serif text-[28px] font-semibold leading-[1.15]">{title}</h2>
      {children}
    </section>
  );
}

const P = ({ children }: { children: ReactNode }) => <p className="m-0 text-base leading-[1.7]">{children}</p>;

export default function PrivasiPage() {
  return (
    <Page>
      <main className="flex-1 px-5 pb-14 pt-6">
        <article className="mx-auto flex max-w-[640px] flex-col gap-7">
          <div className="flex flex-col gap-2.5">
            <h1 className="m-0 font-serif text-[40px] font-semibold leading-[1.05]">Kebijakan privasi</h1>
            <p className="m-0 text-sm text-mist-300">Terakhir diperbarui: {UPDATED}</p>
          </div>

          <p className="m-0 text-[17px] leading-[1.7]">
            Singkatnya: kami minta data sesedikit mungkin, memakainya hanya untuk membuat bacaanmu, dan menghapus fotomu otomatis setelah 24 jam.
          </p>

          <S title="Data yang kami terima">
            <P>
              Nama panggilan, nomor WhatsApp, fokus dan pertanyaan tarot (kalau kamu isi), foto telapak tangan atau wajah (untuk bacaan garis tangan dan aura), dan kode akses.
              Dari Lynk.id kami menerima email dan nomor pesanan pembelianmu supaya kode akses bisa kamu ambil sendiri. Data pembayaran diproses Lynk.id, bukan oleh Ruang Senja.
            </P>
          </S>

          <S title="Cara fotomu diproses">
            <P>
              Fotomu diunggah langsung ke penyimpanan privat (Supabase Storage), tidak bisa dibuka publik, dan hanya bisa dilihat pengelola Ruang Senja lewat tautan sementara saat menyusun bacaanmu.
              Sebelum diunggah, browser-mu memperkecil foto dan membuang data lokasi (EXIF). Fotomu tidak dipakai untuk melatih model AI dan tidak pernah muncul di kartu Story.
            </P>
            <P>Situs dijalankan di Vercel dan data disimpan di server Supabase di luar Indonesia (wilayah Asia Tenggara).</P>
          </S>

          <S title="Berapa lama disimpan">
            <P>
              Foto dihapus otomatis setelah {PHOTO_TTL_HOURS} jam. Bacaanmu bisa dibuka selama {RESULT_TTL_DAYS} hari setelah dikirim. Setelah itu nama panggilan, nomor WhatsApp, pertanyaan, email, dan isi bacaan dihapus;
              yang tersisa hanya kode akses dan jenis bacaan untuk catatan transaksi.
            </P>
          </S>

          <S title="Hakmu">
            <P>
              Sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi, kamu berhak meminta salinan, perbaikan, atau penghapusan datamu kapan saja, termasuk sebelum masa simpan di atas berakhir.
              Kirim permintaanmu lewat WhatsApp dengan menyebutkan kode aksesmu. Kami proses paling lambat 3 × 24 jam.
            </P>
          </S>

          <S title="Kontak">
            <P>
              Pertanyaan soal data pribadimu bisa dikirim lewat <a href={waLink('Halo Ruang Senja, aku mau tanya soal data pribadiku.')}>WhatsApp</a>.
            </P>
          </S>
        </article>
      </main>
    </Page>
  );
}
