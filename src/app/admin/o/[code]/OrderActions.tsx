'use client';

import { useState, useTransition } from 'react';
import { markCodeSent, markWaSent, updateBuyerPhone } from '../../actions';

/** Opens WhatsApp with the prefilled message and records that it was sent. */
export function WaSendButton({ code, href, kind, sent }: { code: string; href: string; kind: 'code' | 'result'; sent: boolean }) {
  const [, start] = useTransition();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={`btn ${sent ? 'btn-secondary' : 'btn-primary'}`}
        onClick={() => start(() => (kind === 'code' ? markCodeSent(code) : markWaSent(code)))}
      >
        {sent ? 'Kirim ulang via WhatsApp' : kind === 'code' ? 'Buka WhatsApp & kirim kode' : 'Buka WhatsApp & kirim link'}
      </a>
      {sent && <span className="text-sm text-gold-300">Sudah ditandai terkirim</span>}
    </div>
  );
}

export function PhoneForm({ code, current }: { code: string; current: string | null }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => setError(await updateBuyerPhone(code, value)));
      }}
    >
      <label htmlFor="phone" className="text-sm font-semibold">{current ? 'Ganti nomor WhatsApp pembeli' : 'Nomor WhatsApp pembeli belum ada'}</label>
      <div className="flex gap-2">
        <input id="phone" className="field" inputMode="tel" placeholder="0812…" value={value} onChange={(e) => setValue(e.target.value)} />
        <button className="btn btn-secondary" disabled={pending || !value}>Simpan</button>
      </div>
      {error && <p className="m-0 text-sm font-semibold text-coral-300">{error}</p>}
    </form>
  );
}
