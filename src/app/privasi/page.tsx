import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Page } from '@/components/Chrome';
import { RESULT_TTL_DAYS, waLink } from '@/lib/config';

export const metadata: Metadata = { title: 'Kebijakan privasi' };

// Draft. Have it checked before launch. The photo promises here are manual: keep them.
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
            Singkatnya: kami minta data sesedikit mungkin, memakainya hanya untuk membuat bacaanmu, dan menghapus fotomu setelah bacaan dikirim.
          </p>

          <S title="Data yang kami terima">
            <P>
              Dari Lynk.id, setelah pembayaranmu berhasil: nama, email, nomor HP, dan nomor pesanan. Ini kami pakai untuk mengirim kode akses ke WhatsApp-mu.
              Data pembayaran diproses Lynk.id, bukan oleh Senjakala Reading.
            </P>
            <P>
              Lewat WhatsApp, dari kamu: nama panggilan, fokus dan pertanyaan tarot (kalau ada), serta foto kedua telapak tangan atau wajah untuk bacaan garis tangan dan aura.
            </P>
          </S>

          <S title="Cara fotomu diproses">
            <P>
              Fotomu hanya dilihat oleh pembaca Senjakala Reading yang menyusun bacaanmu, dan dipakai hanya untuk bacaan itu. Foto tidak diunggah ke website, tidak dibagikan ke pihak lain,
              dan tidak pernah muncul di kartu Story. Setelah bacaanmu dikirim, foto kami hapus dari chat.
            </P>
          </S>

          <S title="Berapa lama disimpan">
            <P>
              Bacaanmu bisa dibuka selama {RESULT_TTL_DAYS} hari setelah dikirim. Setelah itu nama, email, nomor HP, dan isi bacaan dihapus dari sistem kami;
              yang tersisa hanya kode akses dan jenis bacaan untuk catatan transaksi. Data disimpan di Supabase (server Asia Tenggara) dan situs dijalankan di Vercel.
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
              Pertanyaan soal data pribadimu bisa dikirim lewat <a href={waLink('Halo Senjakala Reading, aku mau tanya soal data pribadiku.')}>WhatsApp</a>.
            </P>
          </S>
        </article>
      </main>
    </Page>
  );
}
