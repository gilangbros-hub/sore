'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { markDataReceived, publishResult, saveDraft, type ReadingMeta } from '../../actions';
import { MAJOR_ARCANA, TAROT_POSITIONS } from '@/lib/tarot';
import { AURA_COLOURS } from '@/lib/aura';
import { PALM_LINES, riskyWords } from '@/lib/results';
import { FOCUS_OPTIONS, type ProductKind } from '@/lib/config';

// The form keeps everything as plain strings; paragraphs are separated by a blank line,
// list items by a new line. It converts to the stored JSON shape on save.

type Form = Record<string, string | boolean>;

const paras = (s: unknown) => String(s ?? '').split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean);
const lines = (s: unknown) => String(s ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
const joinP = (a: unknown) => (Array.isArray(a) ? a.join('\n\n') : '');
const joinL = (a: unknown) => (Array.isArray(a) ? a.join('\n') : '');

/* eslint-disable @typescript-eslint/no-explicit-any */
function toForm(kind: ProductKind, r: any): Form {
  if (!r) {
    return kind === 'tarot'
      ? { c0: 'bulan', c1: 'bintang', c2: 'matahari', r0: false, r1: false, r2: false }
      : kind === 'aura'
        ? { dominant: 'jingga', secondary: 'ungu' }
        : {};
  }
  if (kind === 'tarot') {
    const f: Form = { message: joinP(r.message), question: r.question ?? '', story_line: r.story_line ?? '' };
    (r.cards ?? []).forEach((c: any, i: number) => {
      f[`c${i}`] = c.card;
      f[`r${i}`] = !!c.reversed;
      f[`p${i}`] = joinP(c.paragraphs);
    });
    return f;
  }
  if (kind === 'palm') {
    const f: Form = { summary: joinP(r.summary), question: r.question ?? '', story_line: r.story_line ?? '' };
    for (const l of PALM_LINES) f[l.key] = joinP(r.lines?.[l.key]);
    return f;
  }
  return {
    dominant: r.dominant, secondary: r.secondary, meaning: joinP(r.meaning), strengths: joinL(r.strengths),
    watch: joinL(r.watch), affirmation: r.affirmation ?? '', story_line: r.story_line ?? '',
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function fromForm(kind: ProductKind, f: Form) {
  const s = (k: string) => String(f[k] ?? '').trim();
  if (kind === 'tarot') {
    return {
      cards: [0, 1, 2].map((i) => ({ card: s(`c${i}`), reversed: !!f[`r${i}`], paragraphs: paras(f[`p${i}`]) })),
      message: paras(f.message), question: s('question'), story_line: s('story_line'),
    };
  }
  if (kind === 'palm') {
    return {
      lines: Object.fromEntries(PALM_LINES.map((l) => [l.key, paras(f[l.key])])),
      summary: paras(f.summary), question: s('question'), story_line: s('story_line'),
    };
  }
  return {
    dominant: s('dominant'), secondary: s('secondary'), meaning: paras(f.meaning), strengths: lines(f.strengths),
    watch: lines(f.watch), affirmation: s('affirmation'), story_line: s('story_line'),
  };
}

const label = 'flex flex-col gap-1.5 text-sm font-semibold';
const hint = 'font-normal text-mist-300';

export function ResultForm({ code, kind, status, initial, meta: initialMeta }: { code: string; kind: ProductKind; status: string; initial: unknown; meta: ReadingMeta }) {
  const router = useRouter();
  const [f, setF] = useState<Form>(() => toForm(kind, initial));
  const [meta, setMeta] = useState<ReadingMeta>(initialMeta);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  const risky = useMemo(() => riskyWords(Object.values(f).filter((v) => typeof v === 'string').join(' ')), [f]);
  const story = String(f.story_line ?? '');

  const area = (k: string, title: string, rows = 5, help = 'Pisahkan paragraf dengan satu baris kosong. Maksimal 2–3 paragraf pendek.') => (
    <label className={label}>
      <span>{title} <span className={hint}>· {help}</span></span>
      <textarea className="field min-h-0 font-normal" rows={rows} value={String(f[k] ?? '')} onChange={set(k)} />
    </label>
  );

  function save(after?: 'preview') {
    const win = after === 'preview' ? window.open('about:blank', '_blank') : null;
    start(async () => {
      const r = await saveDraft(code, meta, fromForm(kind, f));
      setMsg(r.ok ? { ok: true, text: 'Draf tersimpan.' } : { ok: false, text: r.error ?? 'Gagal menyimpan.' });
      if (win) {
        if (r.ok) win.location.href = `/admin/o/${code}/preview`;
        else win.close();
      }
    });
  }

  function publish() {
    if (risky.length && !confirm(`Ada kata yang perlu dicek: ${risky.join(', ')}. Bacaan tidak boleh meramal kematian, penyakit, kehamilan, atau angka uang. Tetap terbitkan?`)) return;
    start(async () => {
      const r = await publishResult(code, meta, fromForm(kind, f));
      setMsg(r.ok ? { ok: true, text: 'Terbit. Sekarang kirim link-nya lewat WhatsApp di bawah.' } : { ok: false, text: r.error ?? 'Gagal menerbitkan.' });
      if (r.ok) router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 rounded-tile bg-night-900 p-4 sm:grid-cols-2">
        <p className="m-0 text-sm text-mist-300 sm:col-span-2">Isi dari data yang dikirim pembeli lewat WhatsApp.</p>
        <label className={label}>
          Nama panggilan <span className={hint}>· muncul di judul bacaan</span>
          <input className="field font-normal" maxLength={40} value={meta.nickname} onChange={(e) => setMeta((m) => ({ ...m, nickname: e.target.value }))} />
        </label>
        {kind === 'tarot' && (
          <label className={label}>
            Fokus
            <select className="field" value={meta.focus} onChange={(e) => setMeta((m) => ({ ...m, focus: e.target.value as ReadingMeta['focus'] }))}>
              <option value="">Pilih…</option>
              {FOCUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
        )}
        {kind === 'palm' && (
          <label className={label}>
            Tangan yang difoto
            <select className="field" value={meta.hand} onChange={(e) => setMeta((m) => ({ ...m, hand: e.target.value as ReadingMeta['hand'] }))}>
              <option value="">Pilih…</option>
              <option value="kanan">Kanan</option>
              <option value="kiri">Kiri</option>
            </select>
          </label>
        )}
        {status === 'sold' && (
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <button
              type="button"
              className="btn btn-secondary self-start"
              disabled={pending}
              onClick={() => start(async () => { await markDataReceived(code, meta); router.refresh(); })}
            >
              Data sudah diterima, mulai baca
            </button>
            <span className="text-xs text-mist-300">Halaman progres pembeli pindah ke “Bacaan sedang disiapkan”.</span>
          </div>
        )}
      </div>

      {kind === 'tarot' && (
        <>
          {[0, 1, 2].map((i) => (
            <fieldset key={i} className="m-0 flex flex-col gap-3 rounded-tile border-0 bg-night-900 p-4">
              <legend className="float-left mb-1 w-full p-0 text-sm font-bold text-gold-300">{i + 1} · {TAROT_POSITIONS[i]}</legend>
              <div className="flex flex-wrap items-end gap-3">
                <label className={`${label} min-w-[200px] flex-1`}>
                  Kartu
                  <select className="field" value={String(f[`c${i}`])} onChange={set(`c${i}`)}>
                    {MAJOR_ARCANA.map((c) => <option key={c.id} value={c.id}>{c.numeral} · {c.name}</option>)}
                  </select>
                </label>
                <label className="flex min-h-[52px] items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" className="h-5 w-5 accent-amber-400" checked={!!f[`r${i}`]} onChange={set(`r${i}`)} />
                  Terbalik
                </label>
              </div>
              {area(`p${i}`, 'Bacaan kartu', 5)}
            </fieldset>
          ))}
          {area('message', 'Pesan untukmu (penutup)', 4)}
          <label className={label}>
            Pertanyaan penutup
            <input className="field font-normal" value={String(f.question ?? '')} onChange={set('question')} placeholder="Langkah kecil apa yang bisa kamu ambil minggu ini…?" />
          </label>
        </>
      )}

      {kind === 'palm' && (
        <>
          {PALM_LINES.map((l) => <div key={l.key}>{area(l.key, `${l.n} · ${l.name}`, 4)}</div>)}
          {area('summary', 'Ringkasan', 3)}
          <label className={label}>
            Pertanyaan penutup
            <input className="field font-normal" value={String(f.question ?? '')} onChange={set('question')} />
          </label>
        </>
      )}

      {kind === 'aura' && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {(['dominant', 'secondary'] as const).map((k) => (
              <label key={k} className={label}>
                {k === 'dominant' ? 'Warna dominan' : 'Warna pendamping'}
                <select className="field" value={String(f[k])} onChange={set(k)}>
                  {AURA_COLOURS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
            ))}
          </div>
          {area('meaning', 'Arti warnamu', 5)}
          {area('strengths', 'Kekuatanmu', 4, 'Satu poin per baris, 2–4 poin.')}
          {area('watch', 'Yang perlu kamu jaga', 3, 'Satu poin per baris, 1–3 poin.')}
          <label className={label}>
            Afirmasi
            <input className="field font-normal" value={String(f.affirmation ?? '')} onChange={set('affirmation')} placeholder="Aku boleh bersinar tanpa harus menyenangkan semua orang." />
          </label>
        </>
      )}

      <label className={label}>
        <span className="flex flex-wrap justify-between gap-2">
          <span>Kalimat untuk Story <span className={hint}>· muncul di gambar Story, tanpa nama</span></span>
          <span className={`tabular-nums ${story.length > 70 ? 'text-coral-300' : 'text-mist-300'}`}>{story.length}/70</span>
        </span>
        <input className="field font-normal" value={story} onChange={set('story_line')} aria-invalid={story.length > 70} />
        {kind === 'aura' && !story && String(f.affirmation ?? '').length > 0 && String(f.affirmation).length <= 70 && (
          <button type="button" className="self-start text-sm font-semibold text-amber-400" onClick={() => setF((p) => ({ ...p, story_line: String(p.affirmation) }))}>
            Pakai afirmasi
          </button>
        )}
      </label>

      {risky.length > 0 && (
        <p className="m-0 rounded-field bg-coral-300/10 px-4 py-3 text-sm text-coral-300 shadow-[inset_0_0_0_1px_rgba(244,162,140,.35)]">
          Cek lagi kata ini: <strong>{risky.join(', ')}</strong>. Bacaan tidak boleh meramal kematian, penyakit, kehamilan, atau angka uang.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-secondary" disabled={pending} onClick={() => save()}>Simpan draf</button>
        <button type="button" className="btn btn-secondary" disabled={pending} onClick={() => save('preview')}>Pratinjau</button>
        <button type="button" className="btn btn-primary" disabled={pending} onClick={publish}>{pending ? 'Menyimpan…' : 'Terbitkan'}</button>
        {msg && <span role="status" className={`text-sm font-semibold ${msg.ok ? 'text-gold-300' : 'text-coral-300'}`}>{msg.text}</span>}
      </div>
    </div>
  );
}
