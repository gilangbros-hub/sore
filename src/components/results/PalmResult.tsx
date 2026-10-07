import { PalmDiagram } from '@/components/Art';
import { DeliveredPill } from '@/components/Chrome';
import { ShareSection } from './ShareSection';
import { PALM_LINES, type PalmResult as P } from '@/lib/results';

const BADGE = [
  'bg-amber-400 text-night-950',
  'bg-gold-300 text-night-950',
  'bg-ivory-50 text-night-950',
  'bg-night-900 text-ivory-50 shadow-[inset_0_0_0_1.5px_#F6EFE3]',
];
const SWATCH = ['h-[3px] bg-amber-400', 'h-[3px] bg-gold-300', 'h-[3px] bg-ivory-50', 'h-0 border-t-[3px] border-dashed border-ivory-50'];

export function PalmResult({ r, nickname, hand, deliveredAt, token }: { r: P; nickname: string; hand: string | null; deliveredAt: string; token: string | null }) {
  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-8">
      <div className="flex flex-col items-center gap-2.5 text-center">
        <p className="eyebrow">Baca Garis Tangan · Tangan {hand === 'kiri' ? 'kiri' : 'kanan'}</p>
        <h1 className="m-0 font-serif text-4xl font-semibold leading-[1.05] sm:text-[40px]">Cerita di telapak {nickname}</h1>
        <p className="m-0 max-w-[36ch] text-base leading-[1.6] text-mist-300">Empat garis utama, dibaca satu per satu. Gambar di bawah adalah ilustrasi, bukan fotomu.</p>
        <DeliveredPill at={deliveredAt} />
      </div>

      <figure className="card-block m-0 grid items-center gap-5 rounded-panel p-[22px] [grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))]">
        <PalmDiagram />
        <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
          {PALM_LINES.map((l, i) => (
            <li key={l.key} className="flex min-h-[44px] items-center gap-3">
              <span className={`grid h-7 w-7 flex-none place-items-center rounded-full text-sm font-bold ${BADGE[i]}`}>{l.n}</span>
              <span className="font-semibold">{l.name}</span>
              <span className={`ml-auto w-9 rounded-sm ${SWATCH[i]}`} />
            </li>
          ))}
        </ol>
      </figure>

      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-5">
        {PALM_LINES.map((l, i) => (
          <article key={l.key} className="card-block flex flex-col gap-3 px-5 py-[22px]">
            <div className="flex items-center gap-3">
              <span className={`grid h-8 w-8 flex-none place-items-center rounded-full font-bold ${BADGE[i]}`}>{l.n}</span>
              <h2 className="m-0 font-serif text-[28px] font-semibold leading-[1.1]">{l.name}</h2>
            </div>
            {r.lines[l.key].map((p, j) => <p key={j} className="reading">{p}</p>)}
          </article>
        ))}

        <section aria-labelledby="ringkas-title" className="closing-panel flex flex-col gap-3.5 px-[22px] py-7">
          <h2 id="ringkas-title" className="m-0 font-serif text-[32px] font-semibold leading-[1.1]">Ringkasan</h2>
          {r.summary.map((p, j) => <p key={j} className="reading">{p}</p>)}
          <p className="quote">{r.question}</p>
        </section>

        <ShareSection kind="palm" token={token} blurb="Kartu Story berisi ilustrasi garis tanganmu dan satu kalimat pilihan. Tanpa foto, tanpa isi bacaan lengkap." />
      </div>
    </div>
  );
}
