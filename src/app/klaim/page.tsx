import type { Metadata } from 'next';
import Link from 'next/link';
import { Page } from '@/components/Chrome';
import { ClaimForm } from './ClaimForm';

export const metadata: Metadata = { title: 'Ambil kode akses' };

export default function KlaimPage() {
  return (
    <Page>
      <main className="flex-1 px-5 pb-14 pt-8">
        <div className="mx-auto flex max-w-[440px] flex-col gap-7">
          <div className="flex flex-col gap-3 text-center">
            <p className="eyebrow">Sudah bayar di Lynk.id?</p>
            <h1 className="m-0 font-serif text-4xl font-semibold leading-[1.1]">Ambil kode aksesmu</h1>
            <p className="text-pretty m-0 text-base leading-[1.6] text-mist-300">
              Masukkan email yang kamu pakai saat bayar. Kode untuk setiap bacaan yang kamu beli akan muncul di sini. Simpan kodenya, karena dipakai lagi untuk cek status dan membuka bacaanmu.
            </p>
          </div>
          <ClaimForm />
          <div className="flex flex-col gap-1 border-t border-ivory-50/10 pt-5">
            <p className="m-0 text-[15px] font-semibold">Sudah punya kode?</p>
            <Link href="/kode" className="flink text-[15px] font-semibold">Masukkan kodemu di sini</Link>
          </div>
        </div>
      </main>
    </Page>
  );
}
