'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { claimByEmail, type ClaimResult } from './actions';
import { MoonIcon } from '@/components/Chrome';
import { waLink } from '@/lib/config';

const STATUS_LABEL = { unused: 'Belum dipakai', submitted: 'Sedang disiapkan', ready: 'Sudah siap' } as const;

export function ClaimForm() {
  const [email, setEmail] = useState('');
  const [res, setRes] = useState<ClaimResult | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-col gap-5">
      <form
        noValidate
        className="flex flex-col gap-3.5"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => setRes(await claimByEmail(email)));
        }}
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-[15px] font-semibold">Email yang kamu pakai di Lynk.id</label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setRes(null);
            }}
            aria-invalid={res?.state === 'invalid'}
            aria-describedby="klaim-status"
            className="field"
          />
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={pending}>
          {pending ? 'Mencari…' : 'Tampilkan kodeku'}
        </button>
      </form>

      <div id="klaim-status" aria-live="polite">
        {res?.state === 'invalid' && (
          <p className="m-0 text-sm font-semibold text-coral-300">Format emailnya belum benar. Coba cek lagi, ya.</p>
        )}
        {res?.state === 'none' && (
          <div className="flex items-start gap-3 rounded-field bg-gold-300/10 px-4 py-3.5 shadow-[inset_0_0_0_1px_rgba(227,197,132,.35)]">
            <MoonIcon />
            <div className="flex flex-col gap-1">
              <p className="m-0 text-[15px] font-semibold text-gold-300">Belum ada kode untuk email ini</p>
              <p className="m-0 text-sm leading-[1.6] text-ivory-50">
                Kalau baru saja bayar, tunggu satu sampai dua menit lalu coba lagi. Pastikan emailnya sama persis dengan yang dipakai di Lynk.id. Masih belum muncul?{' '}
                <a href={waLink('Halo Ruang Senja, aku sudah bayar di Lynk.id tapi kodenya belum muncul.')}>Chat kami di WhatsApp</a> dengan bukti bayar.
              </p>
            </div>
          </div>
        )}
        {res?.state === 'found' && (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {res.items.map((it) => (
              <li key={it.code} className="card-block flex flex-col gap-3 p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="m-0 font-semibold">{it.product}</p>
                  <span className="text-[13px] text-mist-300">{STATUS_LABEL[it.status]}</span>
                </div>
                <p className="m-0 text-xl font-bold tracking-[.12em]">{it.code}</p>
                {it.status === 'unused' && <Link href={`/isi/${it.code}`} className="btn btn-primary w-full">Isi data bacaan</Link>}
                {it.status === 'submitted' && <Link href={`/status/${it.code}`} className="btn btn-secondary w-full">Lihat status pesanan</Link>}
                {it.status === 'ready' && it.token && <Link href={`/b/${it.token}`} className="btn btn-primary w-full">Lihat bacaanku</Link>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
