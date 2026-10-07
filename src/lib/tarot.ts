// Original flat celestial card art for the 22 Major Arcana.
// Motifs are drawn on a 100×168 card; the indigo plate sits at x 12–88, y 30–134.
// XVII, XVIII and XIX are taken directly from the design files; the rest follow the same rules
// (moon, star, sun, horizon shapes; amber/gold on indigo). No published deck art.

const A = '#F0B067'; // amber-400
const A3 = '#F6C98F'; // amber-300
const G = '#E3C584'; // gold-300
const N6 = '#3A3270';
const N9 = '#15122E';

function star(cx: number, cy: number, r: number, fill = G): string {
  const k = r * 0.28;
  return `<path d="M${cx} ${cy - r}L${cx + k} ${cy - k}L${cx + r} ${cy}L${cx + k} ${cy + k}L${cx} ${cy + r}L${cx - k} ${cy + k}L${cx - r} ${cy}L${cx - k} ${cy - k}Z" fill="${fill}"/>`;
}
function dot(cx: number, cy: number, r = 1.1, fill = G): string {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
}
/** Crescent whose bright edge faces left; `top` is the upper horn. */
function crescentL(x: number, top: number, r: number, fill = A): string {
  return `<path d="M${x} ${top}a${r} ${r} 0 1 0 0 ${2 * r}a${r * 1.23} ${r * 1.23} 0 0 1 0-${2 * r}z" fill="${fill}"/>`;
}
function crescentR(x: number, top: number, r: number, fill = A): string {
  return `<path d="M${x} ${top}a${r} ${r} 0 1 1 0 ${2 * r}a${r * 1.23} ${r * 1.23} 0 0 0 0-${2 * r}z" fill="${fill}"/>`;
}
function sun(cx: number, cy: number, r: number): string {
  const rays: string[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const x1 = cx + Math.cos(a) * (r + 4);
    const y1 = cy + Math.sin(a) * (r + 4);
    const x2 = cx + Math.cos(a) * (r + 9);
    const y2 = cy + Math.sin(a) * (r + 9);
    rays.push(`M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`);
  }
  return `<g stroke="${A}" stroke-width="2" stroke-linecap="round"><path d="${rays.join('')}"/></g><circle cx="${cx}" cy="${cy}" r="${r}" fill="${A}"/><circle cx="${cx}" cy="${cy}" r="${r * 0.64}" fill="${A3}"/>`;
}
const waves = (y: number, op = 1) =>
  `<path d="M14 ${y}q9-5 18 0t18 0 18 0 18 0" fill="none" stroke="${G}" stroke-width="1.3" opacity="${op}"/>`;
const hills = `<path d="M12 118q20-14 40-2t36-6v24H12z" fill="${N6}"/><path d="M12 124q22-10 42 0t34-4v14H12z" fill="${N9}"/>`;

export type TarotCard = { id: string; numeral: string; name: string; art: string };

export const MAJOR_ARCANA: TarotCard[] = [
  {
    id: 'pengelana', numeral: '0', name: 'Pengelana',
    art: `${star(68, 46, 7, A)}${dot(30, 44)}${dot(78, 66)}<path d="M26 120C40 108 34 94 48 86S62 66 66 56" fill="none" stroke="${G}" stroke-width="1.3" stroke-dasharray="2 3"/><circle cx="26" cy="120" r="3" fill="${A3}"/>${hills}`,
  },
  {
    id: 'penyihir', numeral: 'I', name: 'Penyihir',
    art: `<path d="M50 52c-6-8-18-8-18 0s12 8 18 0 18-8 18 0-12 8-18 0z" fill="none" stroke="${A}" stroke-width="2"/><path d="M50 62v36" stroke="${G}" stroke-width="1.4"/>${star(50, 98, 5, A)}<circle cx="24" cy="116" r="5" fill="none" stroke="${G}" stroke-width="1.2"/><path d="M38 121l5-10 5 10z" fill="none" stroke="${G}" stroke-width="1.2"/><rect x="53" y="111" width="10" height="10" fill="none" stroke="${G}" stroke-width="1.2"/>${star(76, 116, 5)}`,
  },
  {
    id: 'pendeta-wanita', numeral: 'II', name: 'Pendeta Wanita',
    art: `<rect x="20" y="44" width="8" height="78" fill="${N6}"/><rect x="72" y="44" width="8" height="78" fill="${G}" opacity=".85"/>${crescentL(56, 58, 14)}${dot(40, 46)}${dot(62, 100)}${waves(122, 0.6)}`,
  },
  {
    id: 'permaisuri', numeral: 'III', name: 'Permaisuri',
    art: `${star(30, 48, 3)}${star(40, 42, 3)}${star(50, 40, 3.4, A)}${star(60, 42, 3)}${star(70, 48, 3)}<circle cx="50" cy="78" r="16" fill="${A}"/><circle cx="50" cy="78" r="10" fill="${A3}"/><path d="M50 94v22M50 106q-10-2-14-10M50 106q10-2 14-10M50 114q-8-1-12-7M50 114q8-1 12-7" fill="none" stroke="${G}" stroke-width="1.3" stroke-linecap="round"/>`,
  },
  {
    id: 'kaisar', numeral: 'IV', name: 'Kaisar',
    art: `<circle cx="70" cy="48" r="6" fill="${A}"/><path d="M14 124L38 76l14 24 12-18 22 42z" fill="${N6}"/><path d="M38 76l6 12-6-2-6 6z" fill="${G}"/><rect x="40" y="104" width="20" height="20" fill="none" stroke="${A}" stroke-width="1.6"/>${dot(24, 58)}${dot(54, 52)}`,
  },
  {
    id: 'imam', numeral: 'V', name: 'Imam',
    art: `<path d="M26 126V70a24 24 0 0 1 48 0v56" fill="none" stroke="${G}" stroke-width="1.4"/><circle cx="50" cy="66" r="7" fill="none" stroke="${A}" stroke-width="2"/><path d="M50 73v32M50 92h7M50 100h5" stroke="${A}" stroke-width="2" stroke-linecap="round"/>${dot(40, 116, 1.6)}${dot(50, 118, 1.6)}${dot(60, 116, 1.6)}`,
  },
  {
    id: 'kekasih', numeral: 'VI', name: 'Kekasih',
    art: `${star(50, 46, 7, A)}<circle cx="40" cy="86" r="16" fill="none" stroke="${G}" stroke-width="1.6"/><circle cx="60" cy="86" r="16" fill="none" stroke="${A}" stroke-width="1.6"/><path d="M50 74a16 16 0 0 1 0 24a16 16 0 0 1 0-24z" fill="${A3}"/>${dot(24, 58)}${dot(76, 60)}${waves(122, 0.6)}`,
  },
  {
    id: 'kereta', numeral: 'VII', name: 'Kereta',
    art: `${star(30, 46, 2.6)}${star(50, 42, 3.4, A)}${star(70, 46, 2.6)}<path d="M24 60h52l-6 30H30z" fill="${N6}" stroke="${G}" stroke-width="1.2"/><path d="M40 70l10 10 10-10" fill="none" stroke="${A}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="34" cy="104" r="9" fill="none" stroke="${G}" stroke-width="1.6"/><circle cx="66" cy="104" r="9" fill="none" stroke="${G}" stroke-width="1.6"/>${dot(34, 104, 2, A)}${dot(66, 104, 2, A)}<path d="M14 120h72" stroke="${G}" stroke-width="1" opacity=".6"/>`,
  },
  {
    id: 'kekuatan', numeral: 'VIII', name: 'Kekuatan',
    art: `<path d="M50 50c-6-7-16-7-16 0s10 7 16 0 16-7 16 0-10 7-16 0z" fill="none" stroke="${G}" stroke-width="1.6"/><path d="M50 66c-14 14-18 28-10 40 4 6 16 6 20 0 8-12 4-26-10-40z" fill="${A}"/><path d="M50 80c-6 8-7 16-3 22 2 3 4 3 6 0 4-6 3-14-3-22z" fill="${A3}"/>${dot(26, 92)}${dot(76, 86)}${waves(124, 0.6)}`,
  },
  {
    id: 'pertapa', numeral: 'IX', name: 'Pertapa',
    art: `${crescentR(26, 40, 7, G)}<path d="M50 48v8" stroke="${G}" stroke-width="1.4"/><path d="M42 56h16l-2 26H44z" fill="none" stroke="${G}" stroke-width="1.6"/>${star(50, 69, 6, A)}<path d="M14 126L40 96l10 10 14-18 22 38z" fill="${N6}"/>${dot(74, 52)}${dot(70, 72)}`,
  },
  {
    id: 'roda-nasib', numeral: 'X', name: 'Roda Nasib',
    art: `<circle cx="50" cy="80" r="28" fill="none" stroke="${G}" stroke-width="1.4"/><circle cx="50" cy="80" r="20" fill="none" stroke="${A}" stroke-width="1.6"/><path d="M50 52v56M22 80h56M30 60l40 40M70 60l-40 40" stroke="${G}" stroke-width="1" opacity=".8"/><circle cx="50" cy="80" r="6" fill="${A}"/>${star(20, 46, 3)}${star(80, 116, 3)}`,
  },
  {
    id: 'keadilan', numeral: 'XI', name: 'Keadilan',
    art: `${star(50, 44, 5, A)}<path d="M50 52v62M38 116h24M26 62h48" stroke="${G}" stroke-width="1.6" stroke-linecap="round"/><path d="M26 62l-8 22h16zM74 62l-8 22h16z" fill="none" stroke="${G}" stroke-width="1.2" stroke-linejoin="round"/><path d="M18 84a8 5 0 0 0 16 0zM66 84a8 5 0 0 0 16 0z" fill="${A}"/>`,
  },
  {
    id: 'orang-tergantung', numeral: 'XII', name: 'Orang Tergantung',
    art: `<path d="M20 44h60" stroke="${G}" stroke-width="2" stroke-linecap="round"/><path d="M50 44v14" stroke="${G}" stroke-width="1.4"/><path d="M38 58h24L50 82z" fill="${A}"/><circle cx="50" cy="96" r="12" fill="none" stroke="${A3}" stroke-width="1.6"/>${dot(50, 96, 3, A3)}${dot(26, 70)}${dot(74, 74)}${waves(124, 0.6)}`,
  },
  {
    // Renamed from "Kematian": the card reads as change, and the product never talks about death.
    id: 'transformasi', numeral: 'XIII', name: 'Transformasi',
    art: `${crescentL(56, 42, 10, A3)}<path d="M24 112a26 26 0 0 1 52 0z" fill="${A}"/><path d="M14 112h72" stroke="${G}" stroke-width="1.6"/><path d="M50 82v-6M34 90l-4-4M66 90l4-4" stroke="${A}" stroke-width="2" stroke-linecap="round"/>${waves(120, 0.8)}${waves(128, 0.5)}`,
  },
  {
    id: 'keseimbangan', numeral: 'XIV', name: 'Keseimbangan',
    art: `<path d="M44 52l6-10 6 10z" fill="${G}"/><path d="M22 66h18l-3 16h-12zM60 96h18l-3 16H63z" fill="none" stroke="${G}" stroke-width="1.4"/><path d="M36 82c10 6 18 8 28 14" fill="none" stroke="${A}" stroke-width="2.4" stroke-linecap="round"/>${dot(48, 86, 1.6, A3)}${dot(54, 89, 1.6, A3)}${star(74, 60, 3)}${star(26, 110, 3)}`,
  },
  {
    // Renamed from "Iblis": read as the habits and attachments that hold us back.
    id: 'belenggu', numeral: 'XV', name: 'Belenggu',
    art: `<circle cx="40" cy="74" r="12" fill="none" stroke="${G}" stroke-width="2.4"/><circle cx="60" cy="74" r="12" fill="none" stroke="${A}" stroke-width="2.4"/><path d="M50 92l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="${N6}" stroke="${G}" stroke-width="1"/>${dot(24, 50)}${dot(76, 48)}<path d="M14 126h72" stroke="${G}" stroke-width="1" opacity=".5"/>`,
  },
  {
    id: 'menara', numeral: 'XVI', name: 'Menara',
    art: `<path d="M40 126V64h20v62z" fill="${N6}" stroke="${G}" stroke-width="1.2"/><path d="M38 64h24l-4-8H42z" fill="${G}"/><path d="M46 80h8v10h-8zM46 100h8v10h-8z" fill="${A3}" opacity=".7"/><path d="M68 38l-8 14h7l-9 16" fill="none" stroke="${A}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>${dot(24, 52)}${dot(28, 90)}${dot(76, 96)}`,
  },
  {
    id: 'bintang', numeral: 'XVII', name: 'Bintang',
    art: `<path d="M50 46l4.5 15.5L70 66l-15.5 4.5L50 86l-4.5-15.5L30 66l15.5-4.5z" fill="${A}"/><path d="M50 54l2 10 10 2-10 2-2 10-2-10-10-2 10-2z" fill="${A3}"/><path d="M22 40l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill="${G}"/><path d="M78 42l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill="${G}"/><path d="M24 92l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" fill="${G}"/><path d="M76 90l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" fill="${G}"/>${dot(34, 100, 1)}${dot(66, 102, 1)}<ellipse cx="50" cy="118" rx="30" ry="6" fill="none" stroke="${G}" stroke-width="1.2"/><path d="M50 88v24" stroke="${G}" stroke-width="1" stroke-dasharray="2 3"/>`,
  },
  {
    id: 'bulan', numeral: 'XVIII', name: 'Bulan',
    art: `<path d="M58 48a22 22 0 1 0 0 44a27 27 0 0 1 0-44z" fill="${A}"/><circle cx="24" cy="44" r="3" fill="none" stroke="${G}" stroke-width="1"/><path d="M24 41a3 3 0 0 1 0 6z" fill="${G}"/><circle cx="76" cy="44" r="3" fill="none" stroke="${G}" stroke-width="1"/><path d="M76 41a3 3 0 0 0 0 6z" fill="${G}"/>${dot(74, 66, 1.2)}${dot(22, 80, 1)}${waves(112)}${waves(121, 0.6)}`,
  },
  {
    id: 'matahari', numeral: 'XIX', name: 'Matahari',
    art: `<g stroke="${A}" stroke-width="2" stroke-linecap="round"><path d="M50 44v8M50 96v-6M28 70h8M72 70h-8M34 54l5 5M66 54l-5 5M34 86l5-5M66 86l-5-5"/></g><circle cx="50" cy="70" r="14" fill="${A}"/><circle cx="50" cy="70" r="9" fill="${A3}"/>${hills}`,
  },
  {
    // "Penghakiman" in most Indonesian decks; read as renewal.
    id: 'kebangkitan', numeral: 'XX', name: 'Kebangkitan',
    art: `<path d="M50 112L28 46M50 112l22-66M50 112V42" stroke="${G}" stroke-width="1" opacity=".7"/>${dot(50, 96, 3, A3)}${dot(42, 78, 3.6, A)}${dot(58, 64, 4.2, A)}${star(50, 44, 5, A3)}<path d="M14 112h72" stroke="${G}" stroke-width="1.6"/>${waves(122, 0.7)}`,
  },
  {
    id: 'dunia', numeral: 'XXI', name: 'Dunia',
    art: `<ellipse cx="50" cy="80" rx="22" ry="34" fill="none" stroke="${G}" stroke-width="2" stroke-dasharray="1 3" stroke-linecap="round"/><ellipse cx="50" cy="80" rx="17" ry="28" fill="none" stroke="${A}" stroke-width="1.6"/><circle cx="50" cy="80" r="8" fill="${A3}"/>${star(20, 42, 4)}${star(80, 42, 4)}${star(20, 122, 4)}${star(80, 122, 4)}`,
  },
];

export const TAROT_BY_ID: Record<string, TarotCard> = Object.fromEntries(MAJOR_ARCANA.map((c) => [c.id, c]));

export const TAROT_POSITIONS = ['Masa lalu', 'Sekarang', 'Arah ke depan'] as const;

/** Full card SVG (as a string) so the same art renders on the page and inside the Story image. */
export function cardSvg(card: TarotCard, opts: { withText?: boolean; reversed?: boolean } = {}): string {
  const { withText = true, reversed = false } = opts;
  const long = card.name.length > 9;
  const text = withText
    ? `<text x="50" y="22" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="11" font-weight="600" fill="#2A2353">${card.numeral}</text><text x="50" y="152" text-anchor="middle" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="${long ? 6.4 : 8.5}" font-weight="700" letter-spacing="${long ? 0.8 : 1.6}" fill="#2A2353">${card.name.toUpperCase()}</text>`
    : '';
  const body = `<rect width="100" height="168" fill="#F3E9D6"/><rect x="5" y="5" width="90" height="158" rx="6" fill="none" stroke="#2A2353" stroke-width="1.2"/>${text}<rect x="12" y="30" width="76" height="104" rx="3" fill="#2A2353"/>${card.art}`;
  return reversed ? `<g transform="rotate(180 50 84)">${body}</g>` : body;
}
