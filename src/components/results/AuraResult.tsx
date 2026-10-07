import { AuraOrb } from '@/components/Art';
import { DeliveredPill } from '@/components/Chrome';
import { ShareSection } from './ShareSection';
import { AURA_BY_ID, swatchGradient } from '@/lib/aura';
import type { AuraResult as A } from '@/lib/results';

function Swatch({ label, id }: { label: string; id: string }) {
  const c = AURA_BY_ID[id];
  return (
    <div className="flex items-center gap-3 rounded-tile bg-night-800 px-3.5 py-3">
      <span className="h-9 w-9 flex-none rounded-full" style={{ background: swatchGradient(c) }} />
      <span className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold uppercase tracking-[.06em] text-mist-300">{label}</span>
        <span className="font-semibold">{c.name}</span>
      </span>
    </div>
  );
}

export function AuraResult({ r, nickname, deliveredAt, token }: { r: A; nickname: string; deliveredAt: string; token: string | null }) {
  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-8">
      <div className="flex flex-col items-center gap-2.5 text-center">
        <p className="eyebrow">Baca Aura</p>
        <h1 className="m-0 font-serif text-4xl font-semibold leading-[1.05] sm:text-[40px]">Warna yang menyelimuti {nickname}</h1>
        <DeliveredPill at={deliveredAt} />
      </div>

      <figure className="m-0 flex flex-col items-center gap-[22px]">
        <AuraOrb dominant={r.dominant} secondary={r.secondary} />
        <figcaption className="grid w-full max-w-[440px] grid-cols-2 gap-3">
          <Swatch label="Dominan" id={r.dominant} />
          <Swatch label="Pendamping" id={r.secondary} />
        </figcaption>
      </figure>

      <section aria-labelledby="arti-title" className="card-block flex flex-col gap-3 px-5 py-[22px]">
        <h2 id="arti-title" className="m-0 font-serif text-[28px] font-semibold leading-[1.1]">Arti warnamu</h2>
        {r.meaning.map((p, j) => <p key={j} className="reading">{p}</p>)}
      </section>

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr))]">
        <section aria-labelledby="kuat-title" className="card-block flex flex-col gap-3 px-5 py-[22px]">
          <h2 id="kuat-title" className="m-0 font-serif text-[26px] font-semibold leading-[1.1]">Kekuatanmu</h2>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {r.strengths.map((s, j) => (
              <li key={j} className="flex gap-2.5 text-base leading-[1.6]">
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="mt-1 flex-none"><path d="M8 1l1.6 5.4L15 8l-5.4 1.6L8 15l-1.6-5.4L1 8l5.4-1.6z" fill="#F0B067" /></svg>
                {s}
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="jaga-title" className="card-block flex flex-col gap-3 px-5 py-[22px]">
          <h2 id="jaga-title" className="m-0 font-serif text-[26px] font-semibold leading-[1.1]">Yang perlu kamu jaga</h2>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {r.watch.map((s, j) => (
              <li key={j} className="flex gap-2.5 text-base leading-[1.6]">
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="mt-1 flex-none"><path d="M10 2a6 6 0 1 0 3.5 9.5A5 5 0 0 1 10 2z" fill="none" stroke="#E3C584" strokeWidth="1.4" strokeLinejoin="round" /></svg>
                {s}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="afirmasi-title" className="closing-panel flex flex-col items-center gap-3 px-6 py-8 text-center">
        <h2 id="afirmasi-title" className="eyebrow">Afirmasi untukmu</h2>
        <p className="text-balance m-0 font-serif text-[32px] font-medium italic leading-[1.2]">“{r.affirmation}”</p>
      </section>

      <ShareSection kind="aura" token={token} blurb="Kartu Story berisi warna auramu dan afirmasimu. Tanpa foto, tanpa isi bacaan lengkap." />
    </div>
  );
}
