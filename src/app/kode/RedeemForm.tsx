'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { lookupCode, type LookupResult } from './actions';
import { MoonIcon } from '@/components/Chrome';
import { waLink } from '@/lib/config';

export function RedeemForm({ initial = '' }: { initial?: string }) {
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
          try {
            setRes(await lookupCode(code));
          } catch {
            setRes({ state: 'invalid' });
          }
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
        {res?.state === 'pending' && (
          <div className="flex items-start gap-3 rounded-field bg-gold-300/10 px-4 py-3.5 shadow-[inset_0_0_0_1px_rgba(227,197,132,.35)]">
            <MoonIcon />
            <div className="flex flex-col gap-1.5">
              <p className="m-0 text-[15px] font-semibold text-gold-300">Bacaanmu sedang disiapkan</p>
              <p className="m-0 text-sm leading-[1.6] text-ivory-50">
                Datamu sudah kami terima {res.at}. Link bacaan akan dikirim ke WhatsApp-mu dalam 1–3 jam.
              </p>
              <Link href={`/status/${res.code}`} className="flink text-sm font-semibold">Lihat status pesanan</Link>
            </div>
          </div>
        )}
        {res?.state === 'ready' && (
          <div className="flex items-start gap-3 rounded-field bg-amber-400/[.12] px-4 py-3.5 shadow-[inset_0_0_0_1px_rgba(240,176,103,.45)]">
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" className="mt-0.5 flex-none">
              <path d="M10 1.5l2 6.5 6.5 2-6.5 2-2 6.5-2-6.5L1.5 10 8 8z" fill="#F0B067" />
            </svg>
            <div className="flex flex-col gap-1.5">
              <p className="m-0 text-[15px] font-semibold text-amber-400">Bacaanmu sudah siap</p>
              <p className="m-0 text-sm leading-[1.6] text-ivory-50">
                Dikirim {res.at}. Kamu bisa membukanya lagi sesering yang kamu mau.
              </p>
              <Link href={`/b/${res.token}`} className="flink text-sm font-semibold">Lihat bacaanku</Link>
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
      {res?.state === 'ok' && (
        <Link href={`/isi/${res.code}`} className="btn btn-secondary w-full">Kode cocok, lanjut isi data</Link>
      )}
    </form>
  );
}
