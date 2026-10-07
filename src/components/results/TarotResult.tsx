'use client';

import { useState } from 'react';
import { CardBackArt, CardFace } from '@/components/Art';
import { DeliveredPill } from '@/components/Chrome';
import { ShareSection } from './ShareSection';
import { TAROT_BY_ID, TAROT_POSITIONS } from '@/lib/tarot';
import type { TarotResult as T } from '@/lib/results';

export function TarotResult({ r, nickname, focus, deliveredAt, token, discussHref }: { r: T; nickname: string; focus: string | null; deliveredAt: string; token: string | null; discussHref: string | null }) {
  const [open, setOpen] = useState([false, false, false]);
  const all = open.every(Boolean);

  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-8">
      <div className="flex flex-col items-center gap-2.5 text-center">
        <p className="eyebrow">Tarot 3 Kartu{focus ? ` · Fokus: ${focus}` : ''}</p>
        <h1 className="m-0 font-serif text-4xl font-semibold leading-[1.05] sm:text-[40px]">Bacaan untuk {nickname}</h1>
        <p className="m-0 max-w-[34ch] text-base leading-[1.6] text-mist-300">Ketuk setiap kartu untuk membukanya, satu per satu. Ambil waktumu.</p>
        <DeliveredPill at={deliveredAt} />
      </div>

      <div className="mx-auto grid w-full max-w-[540px] grid-cols-3 gap-3">
        {r.cards.map((c, i) => {
          const card = TAROT_BY_ID[c.card];
          const label = TAROT_POSITIONS[i];
          const isOpen = open[i];
          return (
            <div key={i} className="flex flex-col items-center gap-2.5">
              <p className="m-0 text-center text-[13px] font-semibold text-mist-300">{label}</p>
              <button
                type="button"
                className={`tcard block aspect-[100/168] w-full cursor-pointer rounded-xl border-0 bg-transparent p-0 [perspective:1100px] ${isOpen ? 'is-open cursor-default' : ''}`}
                aria-label={isOpen ? `${label}: ${card.name}, ${c.reversed ? 'terbalik' : 'tegak'}` : `Buka kartu ${label}`}
                aria-pressed={isOpen}
                onClick={() => !isOpen && setOpen((o) => o.map((v, j) => (j === i ? true : v)))}
              >
                <span className="inner relative block h-full w-full">
                  <span className="face-back backface-hidden absolute inset-0 grid place-items-center overflow-hidden rounded-xl bg-night-800 shadow-[inset_0_0_0_1.5px_#E3C584,0_12px_30px_-16px_rgba(0,0,0,.7)]">
                    <CardBackArt />
                  </span>
                  <span className="backface-hidden absolute inset-0 overflow-hidden rounded-xl bg-card-face shadow-[0_0_0_1px_rgba(227,197,132,.6),0_16px_40px_-14px_rgba(240,176,103,.55)] [transform:rotateY(180deg)]">
                    <CardFace card={card} reversed={c.reversed} />
                  </span>
                </span>
              </button>
              {!isOpen && <p className="m-0 text-xs text-gold-300 motion-safe:animate-pulse" aria-hidden="true">Ketuk</p>}
            </div>
          );
        })}
      </div>

      <div aria-live="polite" className="flex flex-col gap-5">
        {r.cards.map((c, i) =>
          open[i] ? (
            <article key={i} className="card-block flex flex-col gap-3.5 px-5 py-[22px] motion-safe:animate-rise">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                <p className="m-0 w-full text-[13px] font-semibold text-gold-300">{i + 1} · {TAROT_POSITIONS[i]}</p>
                <h2 className="m-0 font-serif text-[30px] font-semibold leading-[1.1]">{TAROT_BY_ID[c.card].name}</h2>
                {c.reversed ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-night-600 px-2.5 py-1 text-[13px] font-semibold">
                    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 2v8M3 7l3 3 3-3" fill="none" stroke="#F6EFE3" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    Terbalik
                  </span>
                ) : (
                  <span className="rounded-full bg-night-700 px-2.5 py-1 text-[13px] font-semibold">Tegak</span>
                )}
              </div>
              {c.paragraphs.map((p, j) => <p key={j} className="reading">{p}</p>)}
            </article>
          ) : null,
        )}

        {all ? (
          <section aria-labelledby="pesan-title" className="closing-panel flex flex-col gap-3.5 px-[22px] py-7 motion-safe:animate-rise">
            <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><path d="M24 6a14 14 0 1 0 0 28a17 17 0 0 1 0-28z" fill="#F0B067" /><circle cx="32" cy="10" r="1.6" fill="#E3C584" /></svg>
            <h2 id="pesan-title" className="m-0 font-serif text-[32px] font-semibold leading-[1.1]">Pesan untukmu</h2>
            {r.message.map((p, j) => <p key={j} className="reading">{p}</p>)}
            <p className="quote">{r.question}</p>
          </section>
        ) : (
          <p className="m-0 text-center text-sm text-mist-300">Buka ketiga kartu untuk membaca pesan penutup.</p>
        )}
      </div>

      <ShareSection discussHref={discussHref}
        kind="tarot"
        token={token}
        blurb="Kartu Story berisi tiga kartumu dan satu kalimat pilihan. Tanpa nama, tanpa isi bacaan lengkap."
        preview={
          <div aria-hidden="true" className="flex h-[117px] w-[66px] flex-none flex-col items-center justify-center gap-1.5 rounded-[10px] shadow-[inset_0_0_0_1px_rgba(227,197,132,.5)]" style={{ background: 'linear-gradient(180deg, #15122E 0%, #3A2E5E 55%, #C9835A 100%)' }}>
            <div className="flex gap-[3px]">{[0, 1, 2].map((k) => <span key={k} className="h-5 w-3 rounded-sm bg-card-face" />)}</div>
            <span className="h-[3px] w-10 rounded-sm bg-ivory-50/70" />
            <span className="h-[3px] w-[30px] rounded-sm bg-ivory-50/50" />
          </div>
        }
      />
    </div>
  );
}
