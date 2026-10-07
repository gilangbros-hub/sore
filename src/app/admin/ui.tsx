import Link from 'next/link';
import type { ReactNode } from 'react';
import { logout } from './actions';

export function AdminShell({ children, back }: { children: ReactNode; back?: boolean }) {
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6 px-5 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="font-serif text-2xl font-semibold text-ivory-50 no-underline hover:text-ivory-50">Admin Ruang Senja</Link>
          {back && <Link href="/admin" className="flink text-sm font-semibold">← Kembali ke antrean</Link>}
        </div>
        <form action={logout}><button className="btn btn-secondary btn-sm">Keluar</button></form>
      </header>
      {children}
    </div>
  );
}

export function Panel({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="card-block flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 text-lg font-bold">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export const STATUS_BADGE: Record<string, string> = {
  stock: 'bg-night-700 text-mist-300',
  sold: 'bg-coral-300/20 text-coral-300',
  reading: 'bg-amber-400 text-night-950',
  ready: 'bg-gold-300/20 text-gold-300',
  expired: 'bg-night-700 text-mist-400',
};

export const STATUS_TEXT: Record<string, string> = {
  stock: 'Stok', sold: 'Menunggu data', reading: 'Perlu dibaca', ready: 'Terbit', expired: 'Kedaluwarsa',
};

export function Badge({ status }: { status: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_BADGE[status]}`}>{STATUS_TEXT[status]}</span>;
}
