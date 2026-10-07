import { cardSvg, type TarotCard } from '@/lib/tarot';
import { AURA_BY_ID, haloGradient, orbGradient } from '@/lib/aura';

export const PALM_PATH =
  'M60 230C55 190 40 165 30 140C22 120 20 105 28 100C36 95 44 104 50 118L58 136L58 60C58 50 72 50 72 60L74 120L78 40C78 30 92 30 92 40L94 118L100 46C100 36 114 36 114 46L114 122L122 66C122 56 136 58 135 68L130 140C128 170 120 195 120 230Z';

/** Card face. The SVG string is built from our own static art, never from user input. */
export function CardFace({ card, reversed = false, className = '' }: { card: TarotCard; reversed?: boolean; className?: string }) {
  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      viewBox="0 0 100 168"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: cardSvg(card, { reversed }) }}
    />
  );
}

export function CardBackArt() {
  return (
    <svg width="80%" viewBox="0 0 80 140" aria-hidden="true">
      <rect x="4" y="4" width="72" height="132" rx="6" fill="none" stroke="rgba(227,197,132,.45)" strokeWidth="1" />
      <circle cx="40" cy="70" r="20" fill="none" stroke="#E3C584" strokeWidth="1.2" />
      <path d="M44 56a14 14 0 1 0 0 28a17 17 0 0 1 0-28z" fill="#E3C584" />
      <circle cx="40" cy="22" r="3" fill="none" stroke="#E3C584" />
      <circle cx="40" cy="118" r="3" fill="#E3C584" />
      <path d="M40 32v8M40 100v8" stroke="#E3C584" strokeWidth="1" />
      <circle cx="16" cy="16" r="1.2" fill="#E3C584" />
      <circle cx="64" cy="16" r="1.2" fill="#E3C584" />
      <circle cx="16" cy="124" r="1.2" fill="#E3C584" />
      <circle cx="64" cy="124" r="1.2" fill="#E3C584" />
    </svg>
  );
}

/** Annotated palm used on the result page. */
export function PalmDiagram() {
  return (
    <svg viewBox="0 0 160 240" role="img" aria-labelledby="palm-alt" className="w-full max-w-[260px] justify-self-center">
      <title id="palm-alt">Ilustrasi telapak tangan dengan empat garis bernomor: 1 garis hati, 2 garis kepala, 3 garis kehidupan, 4 garis takdir.</title>
      <path d={PALM_PATH} fill="#2A2353" stroke="rgba(227,197,132,.5)" strokeWidth="1.6" strokeLinejoin="round" />
      <path className="motion-safe:animate-trace" style={{ strokeDasharray: 200 }} pathLength={200} d="M72 150C92 140 110 142 128 150" fill="none" stroke="#F0B067" strokeWidth="3.4" strokeLinecap="round" />
      <path className="motion-safe:animate-trace" style={{ strokeDasharray: 200, animationDelay: '.3s' }} pathLength={200} d="M62 168C86 162 105 170 124 178" fill="none" stroke="#E3C584" strokeWidth="3" strokeLinecap="round" />
      <path className="motion-safe:animate-trace" style={{ strokeDasharray: 200, animationDelay: '.6s' }} pathLength={200} d="M62 150C52 175 58 205 72 226" fill="none" stroke="#F6EFE3" strokeWidth="3" strokeLinecap="round" />
      <path d="M98 226C96 204 96 184 99 160" fill="none" stroke="#F6EFE3" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="4 5" />
      <g fontFamily="Plus Jakarta Sans, system-ui, sans-serif" fontSize="8" fontWeight="700" textAnchor="middle">
        <circle cx="136" cy="146" r="7" fill="#F0B067" /><text x="136" y="149" fill="#0F0C24">1</text>
        <circle cx="132" cy="182" r="7" fill="#E3C584" /><text x="132" y="185" fill="#0F0C24">2</text>
        <circle cx="44" cy="190" r="7" fill="#F6EFE3" /><text x="44" y="193" fill="#0F0C24">3</text>
        <circle cx="98" cy="150" r="7" fill="#15122E" stroke="#F6EFE3" strokeWidth="1.2" /><text x="98" y="153" fill="#F6EFE3">4</text>
      </g>
    </svg>
  );
}

export function AuraOrb({ dominant, secondary, size = 280 }: { dominant: string; secondary: string; size?: number }) {
  const dom = AURA_BY_ID[dominant];
  const sec = AURA_BY_ID[secondary];
  const s = size / 280;
  return (
    <div
      role="img"
      aria-label={`Bola aura: ${dom.name.toLowerCase()} di tengah, ${sec.name.toLowerCase()} di tepinya.`}
      className="relative"
      style={{ width: size, height: size }}
    >
      <div className="absolute rounded-full motion-safe:animate-halo" style={{ inset: -30 * s, background: haloGradient(sec) }} />
      <div className="absolute rounded-full motion-safe:animate-orb" style={{ inset: 20 * s, background: orbGradient(dom, sec) }} />
      <div
        className="absolute rounded-full"
        style={{
          left: 92 * s, top: 74 * s, width: 60 * s, height: 36 * s, transform: 'rotate(-24deg)',
          background: 'radial-gradient(closest-side, rgba(255,250,240,.7), rgba(255,250,240,0))',
        }}
      />
    </div>
  );
}
