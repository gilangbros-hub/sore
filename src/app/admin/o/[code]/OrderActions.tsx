'use client';

import { useTransition } from 'react';
import { deletePhotoNow, markWaSent, reopenIntake } from '../../actions';

export function OrderActions({ code, status, hasPhoto, waHref, waSent }: { code: string; status: string; hasPhoto?: boolean; waHref?: string; waSent?: boolean }) {
  const [pending, start] = useTransition();

  if (waHref) {
    return (
      <div className="flex flex-wrap gap-3">
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary"
          onClick={() => start(() => markWaSent(code))}
        >
          {waSent ? 'Kirim ulang via WhatsApp' : 'Buka WhatsApp & kirim'}
        </a>
        {waSent && <span className="self-center text-sm text-gold-300">Sudah ditandai terkirim</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {status === 'submitted' && (
        <button
          className="btn btn-secondary btn-sm"
          disabled={pending}
          onClick={() => confirm('Buka lagi form isi data untuk kode ini? Foto yang lama akan dihapus.') && start(() => reopenIntake(code))}
        >
          Minta isi ulang data
        </button>
      )}
      {hasPhoto && (
        <button
          className="btn btn-secondary btn-sm"
          disabled={pending}
          onClick={() => confirm('Hapus foto sekarang? Tidak bisa dibatalkan.') && start(() => deletePhotoNow(code))}
        >
          Hapus foto sekarang
        </button>
      )}
    </div>
  );
}
