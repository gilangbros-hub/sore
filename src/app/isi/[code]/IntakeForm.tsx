'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { createPhotoUpload, submitIntake } from './actions';
import { PALM_PATH } from '@/components/Art';
import { FOCUS_OPTIONS, type ProductKind } from '@/lib/config';

const COPY: Record<ProductKind, { title: string; lede: string }> = {
  tarot: { title: 'Sebelum kartunya dibuka', lede: 'Ceritakan sedikit tentang apa yang sedang kamu pikirkan. Kartu akan dibaca sesuai fokusmu.' },
  palm: { title: 'Siapkan telapak tanganmu', lede: 'Satu foto yang jelas sudah cukup. Ikuti panduan singkat di bawah supaya garisnya terbaca.' },
  aura: { title: 'Biar auramu terbaca jelas', lede: 'Foto wajah yang natural membantu bacaan lebih pas. Tidak perlu dandan, cukup apa adanya.' },
};

const MAX_BYTES = 10 * 1024 * 1024;

type Photo = { blob: Blob; mime: string; name: string; size: number; preview: string | null };

/**
 * Downscale to 2000px JPEG in the browser. This keeps uploads small and drops EXIF (including GPS).
 * Browsers that cannot decode the file (HEIC outside Safari) upload the original instead.
 */
async function preparePhoto(file: File): Promise<Photo> {
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.88));
    if (blob) return { blob, mime: 'image/jpeg', name: file.name, size: file.size, preview: URL.createObjectURL(blob) };
  } catch {
    /* fall through to the original file */
  }
  const mime = file.type || (/\.hei[cf]$/i.test(file.name) ? 'image/heic' : '');
  return { blob: file, mime, name: file.name, size: file.size, preview: mime === 'image/heic' || mime === 'image/heif' ? null : URL.createObjectURL(file) };
}

function mb(n: number) {
  if (n < 1024 * 1024) return Math.max(1, Math.round(n / 1024)) + ' KB';
  return (n / 1024 / 1024).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' MB';
}

const Hand = ({ fill, stroke, t }: { fill: string; stroke: string; t: string }) => (
  <g transform={t}>
    <path d={PALM_PATH} fill={fill} stroke={stroke} strokeWidth="7" strokeLinejoin="round" />
  </g>
);

function GuideItem({ icon, title, desc, row = false }: { icon: React.ReactNode; title: string; desc: string; row?: boolean }) {
  return (
    <li className={`flex gap-2 rounded-field bg-night-900 p-3 ${row ? 'items-center gap-3.5' : 'flex-col'}`}>
      {icon}
      <p className="m-0 text-sm leading-[1.45]">
        <strong className="font-semibold">{title}</strong>
        <br />
        <span className="text-mist-300">{desc}</span>
      </p>
    </li>
  );
}

function PalmGuide() {
  return (
    <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0">
      <GuideItem
        title="Telapak rata" desc="Jangan ditekuk atau dikepal."
        icon={<svg width="64" height="56" viewBox="0 0 64 56" aria-hidden="true"><rect x="2" y="40" width="60" height="10" rx="3" fill="#2A2353" /><Hand t="translate(14 0) scale(.17)" fill="#2A2353" stroke="#E3C584" /></svg>}
      />
      <GuideItem
        title="Cahaya terang" desc="Dekat jendela, tanpa bayangan."
        icon={<svg width="64" height="56" viewBox="0 0 64 56" aria-hidden="true"><circle cx="48" cy="12" r="6" fill="#F0B067" /><path d="M48 1v3M48 20v3M37 12h3M56 12h3M40 4l2 2M54 18l2 2M56 4l-2 2" stroke="#F0B067" strokeWidth="1.6" strokeLinecap="round" /><Hand t="translate(6 10) scale(.17)" fill="#3A3270" stroke="#F6EFE3" /></svg>}
      />
      <GuideItem
        title="Jari direnggangkan" desc="Sedikit terbuka, rileks."
        icon={<svg width="64" height="56" viewBox="0 0 64 56" aria-hidden="true"><Hand t="translate(14 2) scale(.17)" fill="#2A2353" stroke="#E3C584" /><path d="M6 14l6 4M58 14l-6 4" stroke="#F0B067" strokeWidth="1.8" strokeLinecap="round" /><path d="M4 22l6 1M60 22l-6 1" stroke="#F0B067" strokeWidth="1.8" strokeLinecap="round" /></svg>}
      />
      <GuideItem
        title="Seluruh telapak masuk" desc="Dari pergelangan sampai ujung jari."
        icon={<svg width="64" height="56" viewBox="0 0 64 56" aria-hidden="true"><path d="M8 12V4h8M48 4h8v8M56 44v8h-8M16 52H8v-8" fill="none" stroke="#F0B067" strokeWidth="2" strokeLinecap="round" /><Hand t="translate(17 6) scale(.15)" fill="#2A2353" stroke="#E3C584" /></svg>}
      />
    </ul>
  );
}

function AuraGuide() {
  return (
    <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
      <GuideItem
        row title="Menghadap depan" desc="Wajah lurus ke kamera, setinggi mata."
        icon={<svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true" className="flex-none"><circle cx="24" cy="18" r="9" fill="#2A2353" stroke="#E3C584" strokeWidth="1.6" /><path d="M8 44c2-9 9-13 16-13s14 4 16 13" fill="#2A2353" stroke="#E3C584" strokeWidth="1.6" /><path d="M24 2v4M24 2l-2 2M24 2l2 2" stroke="#F0B067" strokeWidth="1.6" strokeLinecap="round" /></svg>}
      />
      <GuideItem
        row title="Cahaya alami" desc="Menghadap jendela, bukan membelakangi."
        icon={<svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true" className="flex-none"><rect x="6" y="6" width="22" height="30" rx="2" fill="none" stroke="#E3C584" strokeWidth="1.6" /><path d="M17 6v30M6 21h22" stroke="#E3C584" strokeWidth="1.2" /><path d="M30 14l12 6M30 24l12 2M30 34l12-4" stroke="#F0B067" strokeWidth="1.6" strokeLinecap="round" /></svg>}
      />
      <GuideItem
        row title="Tanpa filter" desc="Matikan beautify dan efek kamera."
        icon={<svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true" className="flex-none"><path d="M22 8l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="none" stroke="#E3C584" strokeWidth="1.6" strokeLinejoin="round" /><path d="M36 30l1.4 3.6L41 35l-3.6 1.4L36 40l-1.4-3.6L31 35l3.6-1.4z" fill="#E3C584" /><path d="M6 42L42 6" stroke="#F4A28C" strokeWidth="2" strokeLinecap="round" /></svg>}
      />
    </ul>
  );
}

export function IntakeForm({ code, kind, product }: { code: string; kind: ProductKind; product: string }) {
  const router = useRouter();
  const copy = COPY[kind];
  const [nickname, setNickname] = useState('');
  const [wa, setWa] = useState('');
  const [focus, setFocus] = useState<(typeof FOCUS_OPTIONS)[number] | null>(null);
  const [question, setQuestion] = useState('');
  const [hand, setHand] = useState<'kanan' | 'kiri'>('kanan');
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const errRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => { if (photo?.preview) URL.revokeObjectURL(photo.preview); }, [photo]);
  useEffect(() => { if (error) errRef.current?.focus(); }, [error]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setPhotoBusy(true);
    const p = await preparePhoto(file);
    setPhotoBusy(false);
    if (p.blob.size > MAX_BYTES) return setError('Fotonya lebih dari 10 MB. Coba pilih foto lain atau ambil ulang.');
    if (!p.mime) return setError('Formatnya belum didukung. Pakai JPG, PNG, atau HEIC.');
    setPhoto(p);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      let photoPath: string | undefined;
      if (kind !== 'tarot') {
        if (!photo) return setError('Unggah fotomu dulu, ya.');
        const up = await createPhotoUpload(code, photo.mime);
        if (!up.ok) return setError(up.error);
        const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
        const { error: upErr } = await supa.storage.from('photos').uploadToSignedUrl(up.path, up.token, photo.blob, { contentType: photo.mime });
        if (upErr) return setError('Fotonya gagal terunggah. Cek koneksimu lalu coba lagi.');
        photoPath = up.path;
      }
      const res = await submitIntake({
        code, nickname, wa,
        focus: focus ?? undefined,
        question: kind === 'tarot' ? question : undefined,
        hand: kind === 'palm' ? hand : undefined,
        photoPath,
      });
      if (!res.ok) return setError(res.error);
      router.push(`/status/${res.code}`);
    });
  }

  return (
    <form onSubmit={submit} noValidate className={`mx-auto flex flex-col gap-7 ${kind === 'tarot' ? 'max-w-[560px]' : 'max-w-[880px]'}`}>
      <div className="flex flex-col gap-2.5">
        <p className="eyebrow">{product}</p>
        <h1 className="text-balance m-0 font-serif text-4xl font-semibold leading-[1.1]">{copy.title}</h1>
        <p className="text-pretty m-0 text-base leading-[1.6] text-mist-300">{copy.lede}</p>
      </div>

      <div className="flex max-w-[520px] flex-col gap-2">
        <label htmlFor="nama" className="text-[15px] font-semibold">Nama atau panggilan</label>
        <input id="nama" className="field" type="text" autoComplete="nickname" placeholder="Misalnya: Dinda" maxLength={40} value={nickname} onChange={(e) => setNickname(e.target.value)} />
        <p className="m-0 text-[13px] text-mist-300">Cukup panggilan. Nama asli tidak perlu.</p>
      </div>

      <div className="flex max-w-[520px] flex-col gap-2">
        <label htmlFor="wa" className="text-[15px] font-semibold">Nomor WhatsApp</label>
        <div className="flex gap-2">
          <span aria-hidden="true" className="flex min-h-[52px] flex-none items-center rounded-field bg-night-800 px-3.5 text-[17px] font-semibold text-mist-300 shadow-[inset_0_0_0_1.5px_rgba(246,239,227,.14)]">+62</span>
          <input id="wa" className="field" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="812 3456 7890" value={wa} onChange={(e) => setWa(e.target.value)} aria-describedby="wa-help" />
        </div>
        <p id="wa-help" className="m-0 text-[13px] leading-[1.55] text-mist-300">
          Link bacaanmu dikirim ke nomor ini. Hanya dipakai untuk mengirim bacaan dan membantu kalau ada kendala.
        </p>
      </div>

      {kind === 'tarot' && (
        <div className="flex flex-col gap-7">
          <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
            <legend className="mb-3 p-0 text-[15px] font-semibold">Mau fokus ke mana?</legend>
            <div className="flex flex-wrap gap-2.5">
              {FOCUS_OPTIONS.map((c) => (
                <button key={c} type="button" className="chip" aria-pressed={focus === c} onClick={() => setFocus(c)}>{c}</button>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="tanya" className="text-[15px] font-semibold">
                Pertanyaanmu <span className="font-normal text-mist-300">(opsional)</span>
              </label>
              <span id="tanya-count" aria-live="polite" className="text-[13px] tabular-nums text-mist-300">{question.length}/200</span>
            </div>
            <textarea
              id="tanya" className="field" maxLength={200} aria-describedby="tanya-count tanya-help"
              placeholder="Contoh: Apa yang perlu aku perhatikan soal pekerjaanku sekarang?"
              value={question} onChange={(e) => setQuestion(e.target.value.slice(0, 200))}
            />
            <p id="tanya-help" className="m-0 text-[13px] leading-[1.55] text-mist-300">
              Pertanyaan terbuka biasanya menghasilkan bacaan yang lebih berguna daripada pertanyaan ya/tidak.
            </p>
          </div>
        </div>
      )}

      {kind === 'palm' && (
        <fieldset className="m-0 max-w-[520px] border-0 p-0">
          <legend className="mb-3 p-0 text-[15px] font-semibold">Tangan yang difoto</legend>
          <div className="flex gap-1.5 rounded-tile bg-night-950 p-1 shadow-[inset_0_0_0_1px_rgba(246,239,227,.14)]">
            {(['kanan', 'kiri'] as const).map((h) => (
              <label key={h} className="relative flex flex-1">
                <input type="radio" name="tangan" value={h} checked={hand === h} onChange={() => setHand(h)} className="peer absolute h-px w-px opacity-0" />
                <span className="flex min-h-[48px] flex-1 cursor-pointer items-center justify-center rounded-xl text-[15px] font-semibold capitalize text-mist-300 peer-checked:bg-night-700 peer-checked:text-ivory-50 peer-checked:shadow-[inset_0_0_0_1.5px_#E3C584] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-300">
                  {h === 'kanan' ? 'Kanan' : 'Kiri'}
                </span>
              </label>
            ))}
          </div>
          <p className="m-0 mt-2.5 text-[13px] leading-[1.55] text-mist-300">Bingung pilih yang mana? Pakai tangan yang paling sering kamu gunakan.</p>
        </fieldset>
      )}

      {kind !== 'tarot' && (
        <div className="grid items-start gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(360px,100%),1fr))]">
          <section aria-labelledby="guide-title" className="card-block flex flex-col gap-3.5 p-[18px]">
            <h2 id="guide-title" className="m-0 text-base font-bold">{kind === 'palm' ? 'Cara memotret telapak tangan' : 'Cara memotret wajah'}</h2>
            {kind === 'palm' ? <PalmGuide /> : <AuraGuide />}
          </section>

          <div className="flex flex-col gap-3">
            <input
              ref={fileRef} id="foto" type="file" accept="image/jpeg,image/png,image/heic,image/heif,image/webp"
              // No `capture` attribute: it forces the camera on Android and hides the gallery option the copy promises.
              className="peer absolute h-px w-px opacity-0"
              onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ''; }}
            />
            {!photo ? (
              <label
                htmlFor="foto"
                className="relative flex min-h-[260px] cursor-pointer flex-col items-center justify-center gap-3 rounded-card border-[1.5px] border-dashed border-gold-300/55 bg-night-800/50 p-6 text-center peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-gold-300"
              >
                <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="27" fill="#2A2353" /><rect x="15" y="20" width="26" height="19" rx="4" fill="none" stroke="#F0B067" strokeWidth="1.8" /><path d="M22 20l2-4h8l2 4" fill="none" stroke="#F0B067" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="28" cy="29.5" r="5" fill="none" stroke="#F0B067" strokeWidth="1.8" /></svg>
                <span className="text-[17px] font-semibold">
                  {photoBusy ? 'Menyiapkan foto…' : kind === 'palm' ? 'Ambil foto atau pilih dari galeri' : 'Ambil swafoto atau pilih dari galeri'}
                </span>
                <span className="text-[13px] text-mist-300">JPG, PNG, atau HEIC · maks. 10 MB</span>
              </label>
            ) : (
              <figure className="m-0 flex flex-col gap-3">
                <div className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-card shadow-[inset_0_0_0_1px_rgba(246,239,227,.14)]" style={{ background: 'linear-gradient(160deg, #3A3270, #1E1940 70%)' }}>
                  {photo.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo.preview} alt="Pratinjau foto yang akan dikirim" className="h-full w-full object-cover" />
                  ) : (
                    <p className="m-0 px-6 text-center text-sm text-mist-300">Foto HEIC siap dikirim. Pratinjau tidak tersedia di browser ini.</p>
                  )}
                  <p className="absolute bottom-3 left-3 m-0 rounded-lg bg-night-950/80 px-2.5 py-1.5 text-xs text-ivory-50">Pratinjau foto</p>
                </div>
                <figcaption className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm text-mist-300">{photo.name} · {mb(photo.size)}</span>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setPhoto(null); fileRef.current?.click(); }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 8a5.5 5.5 0 1 0 1.8-4.1M2.5 2v3.5H6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    Ulangi foto
                  </button>
                </figcaption>
              </figure>
            )}
            <p className="m-0 flex items-start gap-2.5 text-[13px] leading-[1.55] text-mist-300">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="mt-0.5 flex-none"><rect x="3" y="7" width="10" height="7" rx="1.5" fill="none" stroke="#E3C584" strokeWidth="1.4" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="#E3C584" strokeWidth="1.4" /></svg>
              <span>Fotomu hanya dipakai untuk bacaan ini dan dihapus otomatis setelah 24 jam.</span>
            </p>
          </div>
        </div>
      )}

      <div className="flex max-w-[520px] flex-col gap-2.5">
        <div ref={errRef} tabIndex={-1} aria-live="assertive" className="outline-none">
          {error && (
            <p className="m-0 flex items-start gap-2.5 rounded-field bg-coral-300/10 px-4 py-3 text-sm font-semibold leading-[1.5] text-coral-300 shadow-[inset_0_0_0_1px_rgba(244,162,140,.35)]">
              <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" className="mt-px flex-none"><circle cx="10" cy="10" r="8.5" fill="none" stroke="#F4A28C" strokeWidth="1.5" /><path d="M10 5.5v5.5" stroke="#F4A28C" strokeWidth="1.8" strokeLinecap="round" /><circle cx="10" cy="14.2" r="1.1" fill="#F4A28C" /></svg>
              {error}
            </p>
          )}
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={pending || photoBusy}>
          {pending ? 'Mengirim…' : 'Kirim untuk dibaca'}
        </button>
        <p className="m-0 text-center text-[13px] leading-[1.55] text-mist-300">
          Bacaanmu dikirim ke WhatsApp dalam 1–3 jam. Cek lagi nomormu sebelum mengirim, ya.
        </p>
      </div>
    </form>
  );
}
