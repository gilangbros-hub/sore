import Link from 'next/link';
import { MoonIcon, Page } from '@/components/Chrome';

export default function NotFound() {
  return (
    <Page>
      <main className="flex-1 px-5 pb-14 pt-10">
        <div className="mx-auto flex max-w-[440px] flex-col items-center gap-4 text-center">
          <MoonIcon size={40} />
          <h1 className="m-0 font-serif text-4xl font-semibold leading-[1.1]">Halamannya tidak ketemu</h1>
          <p className="m-0 text-base leading-[1.6] text-mist-300">Mungkin link-nya terpotong. Kalau kamu punya kode akses, coba buka lewat halaman kode.</p>
          <Link href="/kode" className="btn btn-primary">Punya kode?</Link>
        </div>
      </main>
    </Page>
  );
}
