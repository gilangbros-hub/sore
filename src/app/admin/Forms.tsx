'use client';

import { useActionState } from 'react';
import { addStock, sellManual } from './actions';

const PRODUCTS = (
  <>
    <option value="tarot">Tarot 5 Kartu - Menjawab Pertanyaan Kamu</option>
    <option value="palm">Baca Garis Tangan</option>
    <option value="aura">Baca Aura</option>
    <option value="bundle">Paket Lengkap (3 kode)</option>
  </>
);
const label = 'flex flex-col gap-1.5 text-sm font-semibold';

export function StockForm() {
  const [state, action, pending] = useActionState(addStock, {});
  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="grid grid-cols-[1fr_96px] gap-3">
        <label className={label}>Produk<select name="product" className="field" defaultValue="tarot">{PRODUCTS}</select></label>
        <label className={label}>Jumlah<input name="count" type="number" min={1} max={50} defaultValue={10} className="field" /></label>
      </div>
      <button className="btn btn-secondary" disabled={pending}>{pending ? 'Membuat…' : 'Tambah stok kode'}</button>
      {state.error && <p className="m-0 text-sm font-semibold text-coral-300">{state.error}</p>}
      {state.codes && <p className="m-0 text-sm text-gold-300">{state.codes.length} kode ditambahkan ke stok.</p>}
    </form>
  );
}

export function SellForm() {
  const [state, action, pending] = useActionState(sellManual, {});
  return (
    <form action={action} className="flex flex-col gap-3">
      <p className="m-0 text-sm text-mist-300">Untuk pembayaran di luar Lynk, atau kalau webhook tidak masuk. Mengambil kode dari stok.</p>
      <label className={label}>Produk<select name="product" className="field" defaultValue="tarot">{PRODUCTS}</select></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={label}>Nama pembeli<input name="name" className="field" /></label>
        <label className={label}>Nomor WhatsApp<input name="phone" className="field" inputMode="tel" placeholder="0812…" /></label>
      </div>
      <label className={label}>Email (opsional)<input name="email" type="email" className="field" /></label>
      <label className={label}>Catatan (opsional)<input name="note" className="field" placeholder="Misalnya: transfer BCA, ref Lynk 13f8…" /></label>
      <button className="btn btn-primary" disabled={pending}>{pending ? 'Memproses…' : 'Ambil kode untuk pembeli ini'}</button>
      {state.error && <p className="m-0 text-sm font-semibold text-coral-300">{state.error}</p>}
    </form>
  );
}
