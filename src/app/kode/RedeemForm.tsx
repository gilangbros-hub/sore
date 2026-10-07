'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { lookupCode, type LookupResult } from './actions';
import { MoonIcon } from '@/components/Chrome';
import { waLink } from '@/lib/config';

export function RedeemForm({ initial = '' }: { initial?: string }) {
  const router = useRouter();
  const [code, setCode] = useState(initial);
  const [res, setRes] = useState<LookupResult | null>(null);
  const [pending, start] = useTransition();
  const invalid = res?.state === 'invalid';

  return (
    <form
      noValidate
      className="flex flex-col gap-3.5"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          let r: LookupResult;
          try {
            r = await lookupCode(code);
          } catch {
            r = { state: 'invalid' };
          }
          if (r.state === 'ok') router.push(`/status/${r.code}`);
          else setRes(r);
        });
      }}
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="kode" className="text-[15px] font-semibold">Masukkan kode aksesmu</label>
        <input
          id="kode"
          name="kode"
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="Contoh: RS7K-29QM"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setRes(null);
          }}
          aria-invalid={invalid}
          aria-describedby="kode-status"
          className="field min-h-[56px] px-[18px] text-xl font-semibold uppercase tracking-[.14em] placeholder:font-medium placeholder:tracking-[.08em]"
        />
      </div>

      <div id="kode-status" aria-live="polite">
        {invalid && (
          <div className="flex items-start gap-3 rounded-field bg-coral-300/10 px-4 py-3.5 shadow-[inset_0_0_0_1px_rgba(244,162,140,.35)]">
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" className="mt-0.5 flex-none">
              <circle cx="10" cy="10" r="8.5" fill="none" stroke="#F4A28C" strokeWidth="1.5" />
              <path d="M10 5.5v5.5" stroke="#F4A28C" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="10" cy="14.2" r="1.1" fill="#F4A28C" />
            </svg>
            <div className="flex flex-col gap-1">
              <p className="m-0 text-[15px] font-semibold text-coral-300">Kodenya belum cocok</p>
              <p className="m-0 text-sm leading-[1.6] text-ivory-50">
                Coba cek lagi huruf dan angkanya, termasuk tanda strip. Masih belum bisa?{' '}
                <a href={waLink('Halo Ruang Senja, kode aksesku tidak bisa dipakai.')}>Chat kami di WhatsApp</a> dan kirim bukti bayar dari Lynk.id, nanti kami bantu.
              </p>
            </div>
          </div>
        )}
        {res?.state === 'expired' && (
          <div className="flex items-start gap-3 rounded-field bg-gold-300/10 px-4 py-3.5 shadow-[inset_0_0_0_1px_rgba(227,197,132,.35)]">
            <MoonIcon />
            <div className="flex flex-col gap-1">
              <p className="m-0 text-[15px] font-semibold text-gold-300">Masa aktif bacaan ini sudah lewat</p>
              <p className="m-0 text-sm leading-[1.6] text-ivory-50">
                Bacaan bisa dibuka selama 30 hari setelah dikirim, lalu datanya kami hapus. Ada pertanyaan?{' '}
                <a href={waLink(`Halo Ruang Senja, aku mau tanya soal kode ${code}.`)}>Chat kami di WhatsApp</a>.
              </p>
            </div>
          </div>
        )}
      </div>

      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? 'Mengecek…' : 'Lanjutkan'}
      </button>
    </form>
  );
}
