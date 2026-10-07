'use client';

import { useActionState } from 'react';
import { generateCodes } from './actions';
import { CopyButton } from '@/components/CopyButton';

export function GenerateForm() {
  const [state, action, pending] = useActionState(generateCodes, {});
  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="grid grid-cols-[1fr_96px] gap-3">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Produk
          <select name="product" className="field" defaultValue="tarot">
            <option value="tarot">Tarot 3 Kartu</option>
            <option value="palm">Baca Garis Tangan</option>
            <option value="aura">Baca Aura</option>
            <option value="bundle">Paket Lengkap (3 kode)</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Jumlah
          <input name="count" type="number" min={1} max={20} defaultValue={1} className="field" />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Email pembeli (opsional, supaya bisa diklaim di /klaim)
        <input name="email" type="email" className="field" placeholder="nama@email.com" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Catatan (opsional)
        <input name="note" className="field" placeholder="Misalnya: ref Lynk 12345, transfer manual" />
      </label>
      <button className="btn btn-primary" disabled={pending}>{pending ? 'Membuat…' : 'Buat kode'}</button>
      {state.error && <p className="m-0 text-sm font-semibold text-coral-300">{state.error}</p>}
      {state.codes && (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {state.codes.map((c) => (
            <li key={c.code} className="flex items-center gap-3 rounded-tile bg-night-900 px-4 py-2.5">
              <span className="font-bold tracking-[.1em]">{c.code}</span>
              <span className="text-sm text-mist-300">{c.product}</span>
              <span className="ml-auto"><CopyButton text={c.code} /></span>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
