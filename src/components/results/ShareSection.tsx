'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { SITE_URL, type ProductKind } from '@/lib/config';

const OTHER: Record<ProductKind, string> = {
  tarot: 'garis tangan dan auramu',
  palm: 'kartu tarot dan auramu',
  aura: 'kartu tarot dan garis tanganmu',
};

export function ShareSection({ kind, token, blurb, preview, discussHref }: { kind: ProductKind; token: string | null; blurb: string; preview?: ReactNode; discussHref: string | null }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function saveStory() {
    if (!token) return;
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch(`/api/story/${token}`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const file = new File([blob], `ruang-senja-${kind}.png`, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        setNote('Gambar tersimpan. Cek folder unduhan atau galerimu.');
      }
    } catch (e) {
      if ((e as Error)?.name !== 'AbortError') setNote('Gambar gagal dibuat. Coba lagi sebentar.');
    } finally {
      setBusy(false);
    }
  }

  async function shareSite() {
    const data = { title: 'Senjakala Reading', text: 'Coba bacaan tarot, garis tangan, atau aura di Senjakala Reading.', url: SITE_URL };
    try {
      if (navigator.share) return await navigator.share(data);
      await navigator.clipboard.writeText(`${data.text} ${data.url}`);
      setNote('Link Senjakala Reading tersalin. Tempel di chat temanmu.');
    } catch {
      /* user closed the share sheet */
    }
  }

  return (
    <>
    {discussHref && (
      <section aria-labelledby="ngobrol-title" className="flex flex-col gap-3 rounded-card bg-night-700 p-5">
        <h2 id="ngobrol-title" className="m-0 text-base font-bold">Mau ngobrol soal bacaanmu?</h2>
        <p className="m-0 text-sm leading-[1.6]">Ada bagian yang ingin kamu tanyakan atau bahas lebih dalam? Chat langsung di WhatsApp, kodemu sudah otomatis tertulis di pesan.</p>
        <a href={discussHref} className="btn btn-primary w-full">
          <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5a7.5 7.5 0 0 0-6.4 11.4L2.5 17.5l3.7-1A7.5 7.5 0 1 0 10 2.5z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
          Chat via WhatsApp
        </a>
      </section>
    )}
    <section aria-labelledby="bagikan-title" className="flex flex-col gap-3.5 border-t border-ivory-50/10 pt-7">
      <h2 id="bagikan-title" className="m-0 text-base font-bold">Simpan momen ini</h2>
      {preview ? (
        <div className="flex items-center gap-4">
          {preview}
          <p className="m-0 text-sm leading-[1.6] text-mist-300">{blurb}</p>
        </div>
      ) : (
        <p className="m-0 text-sm leading-[1.6] text-mist-300">{blurb}</p>
      )}
      <button type="button" className="btn btn-primary w-full" onClick={saveStory} disabled={busy || !token}>
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M9 2v10M5 8l4 4 4-4M3 15h12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        {busy ? 'Menyiapkan gambar…' : 'Simpan untuk Story'}
      </button>
      <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr))]">
        <button type="button" className="btn btn-secondary" onClick={shareSite}>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="13.5" cy="4" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="4.5" cy="9" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="13.5" cy="14" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M6.3 8l5.4-3M6.3 10l5.4 3" stroke="currentColor" strokeWidth="1.5" /></svg>
          Kirim ke teman
        </button>
        <Link href="/#bacaan" className="btn btn-secondary">Bacaan lain</Link>
      </div>
      <p aria-live="polite" className="m-0 min-h-0 text-sm text-gold-300 empty:hidden">{note}</p>
      <p className="m-0 text-sm leading-[1.6] text-mist-300">
        Penasaran sama {OTHER[kind]} juga? <Link href="/#bacaan" className="font-semibold">Lihat pilihan bacaan</Link>
      </p>
    </section>
    </>
  );
}
