import { PALM_PATH } from './Art';

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

export function PalmGuide() {
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

export function AuraGuide() {
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

