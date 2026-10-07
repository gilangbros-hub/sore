import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { cardSvg, TAROT_BY_ID, TAROT_POSITIONS } from '@/lib/tarot';
import { AURA_BY_ID, hexAlpha } from '@/lib/aura';
import { PALM_PATH } from '@/components/Art';
import { SITE_HOST, type ProductKind } from '@/lib/config';
import type { AuraResult, PalmResult, TarotResult } from '@/lib/results';

// 1080×1920 Story image. Built only from card ids, colour ids and the one highlight line,
// so the user's name, photo and full reading never reach this pipeline.

const fontDir = join(process.cwd(), 'assets', 'fonts');
type Font = { name: string; data: ArrayBuffer; weight: 500 | 600 | 700; style: 'normal' | 'italic' };
let fonts: Promise<Font[]> | null = null;

const buf = (b: Buffer): ArrayBuffer => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;

function loadFonts() {
  fonts ??= Promise.all([
    readFile(join(fontDir, 'cormorant-garamond-latin-600-normal.woff')),
    readFile(join(fontDir, 'cormorant-garamond-latin-500-italic.woff')),
    readFile(join(fontDir, 'plus-jakarta-sans-latin-600-normal.woff')),
    readFile(join(fontDir, 'plus-jakarta-sans-latin-700-normal.woff')),
  ]).then(([c600, c500i, j600, j700]): Font[] => [
    { name: 'Cormorant', data: buf(c600), weight: 600, style: 'normal' },
    { name: 'Cormorant', data: buf(c500i), weight: 500, style: 'italic' },
    { name: 'Jakarta', data: buf(j600), weight: 600, style: 'normal' },
    { name: 'Jakarta', data: buf(j700), weight: 700, style: 'normal' },
  ]);
  return fonts;
}

const svgUri = (inner: string, vb: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${inner}</svg>`)}`;

function Card({ id, reversed, label, tilt, featured, w = 270 }: { id: string; reversed: boolean; label: string; tilt: number; featured: boolean; w?: number }) {
  const card = TAROT_BY_ID[id];
  const long = card.name.length > 9;
  const h = Math.round((w * 168) / 100);
  const scale = w / 270;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ...(tilt ? { transform: `rotate(${tilt}deg) translateY(${28 * scale}px)` } : {}) }}>
      <div
        style={{
          display: 'flex', position: 'relative', width: w, height: h, borderRadius: 22 * scale, overflow: 'hidden',
          ...(reversed ? { transform: 'rotate(180deg)' } : {}),
          boxShadow: `0 30px 60px -20px rgba(15,12,36,.8), 0 0 0 2px rgba(227,197,132,${featured ? 0.9 : 0.7})`,
        }}
      >
        <img src={svgUri(cardSvg(card, { withText: false }), '0 0 100 168')} width={w} height={h} alt="" />
        <div style={{ position: 'absolute', top: 30 * scale, left: 0, right: 0, display: 'flex', justifyContent: 'center', fontFamily: 'Cormorant', fontWeight: 600, fontSize: 30 * scale, color: '#2A2353' }}>
          {card.numeral}
        </div>
        <div style={{ position: 'absolute', top: (long ? 394 : 388) * scale, left: 0, right: 0, display: 'flex', justifyContent: 'center', fontFamily: 'Jakarta', fontWeight: 700, fontSize: (long ? 17 : 23) * scale, letterSpacing: (long ? 2 : 4.3) * scale, color: '#2A2353' }}>
          {card.name.toUpperCase()}
        </div>
      </div>
      <div style={{ display: 'flex', marginTop: 28 * scale, fontFamily: 'Jakarta', fontWeight: 600, fontSize: Math.max(18, 28 * scale), color: '#BDB4D3' }}>{label}</div>
    </div>
  );
}

function auraSvg(domId: string, secId: string) {
  const d = AURA_BY_ID[domId];
  const s = AURA_BY_ID[secId];
  return svgUri(
    `<defs>
      <radialGradient id="h" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${s.mid}" stop-opacity=".6"/><stop offset=".6" stop-color="${s.mid}" stop-opacity=".2"/><stop offset="1" stop-color="#15122E" stop-opacity="0"/></radialGradient>
      <radialGradient id="o" cx="42%" cy="38%" r="58%"><stop offset="0" stop-color="#FBE3C2"/><stop offset=".18" stop-color="${d.light}"/><stop offset=".42" stop-color="${d.mid}"/><stop offset=".62" stop-color="${d.deep}"/><stop offset=".86" stop-color="${s.mid}"/><stop offset="1" stop-color="${s.mid}" stop-opacity="0"/></radialGradient>
      <radialGradient id="g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFFAF0" stop-opacity=".7"/><stop offset="1" stop-color="#FFFAF0" stop-opacity="0"/></radialGradient>
    </defs>
    <circle cx="350" cy="350" r="350" fill="url(#h)"/>
    <circle cx="350" cy="350" r="250" fill="url(#o)"/>
    <ellipse cx="315" cy="247" rx="65" ry="37" fill="url(#g)" transform="rotate(-24 315 247)"/>`,
    '0 0 700 700',
  );
}

export async function storyImage(kind: ProductKind, result: TarotResult | PalmResult | AuraResult): Promise<ImageResponse> {
  const highlight = result.story_line;
  const eyebrow = kind === 'tarot' ? 'Tarot 5 Kartu' : kind === 'aura' ? 'Warna auraku' : 'Garis tanganku';

  let visual: React.ReactNode = null;
  if (kind === 'tarot') {
    const r = result as TarotResult;
    const mid = (r.cards.length - 1) / 2;
    visual = (
      <div style={{ position: 'absolute', left: 0, right: 0, top: 470, height: 560, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 18 }}>
        {r.cards.map((c, i) => (
          <Card key={i} id={c.card} reversed={c.reversed} label={TAROT_POSITIONS[i]} tilt={Math.round((i - mid) * 5)} featured={i === Math.round(mid)} w={162} />
        ))}
      </div>
    );
  } else if (kind === 'aura') {
    const r = result as AuraResult;
    visual = (
      <div style={{ position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src={auraSvg(r.dominant, r.secondary)} width={700} height={700} alt="" />
        <div style={{ display: 'flex', marginTop: -34, fontFamily: 'Jakarta', fontWeight: 600, fontSize: 34, letterSpacing: 0.7 }}>
          {AURA_BY_ID[r.dominant].name}
          <span style={{ color: '#E3C584', margin: '0 14px' }}>·</span>
          {AURA_BY_ID[r.secondary].name}
        </div>
      </div>
    );
  } else {
    visual = (
      <div style={{ position: 'absolute', left: 0, right: 0, top: 400, height: 680, display: 'flex', justifyContent: 'center' }}>
        <img
          width={440}
          height={660}
          alt=""
          src={svgUri(
            `<path d="${PALM_PATH}" fill="#2A2353" stroke="#E3C584" stroke-width="1.4" stroke-linejoin="round"/>
             <path d="M72 150C92 140 110 142 128 150" fill="none" stroke="#F0B067" stroke-width="3.4" stroke-linecap="round"/>
             <path d="M62 168C86 162 105 170 124 178" fill="none" stroke="#E3C584" stroke-width="3" stroke-linecap="round"/>
             <path d="M62 150C52 175 58 205 72 226" fill="none" stroke="#F6EFE3" stroke-width="3" stroke-linecap="round"/>
             <path d="M98 226C96 204 96 184 99 160" fill="none" stroke="#F6EFE3" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="4 5"/>`,
            '0 0 160 240',
          )}
        />
      </div>
    );
  }

  const backdrop = svgUri(
    `<g fill="#E3C584">
      <circle cx="120" cy="140" r="3"/><circle cx="260" cy="90" r="2"/><circle cx="420" cy="180" r="2.5"/><circle cx="610" cy="110" r="2"/><circle cx="790" cy="170" r="3"/><circle cx="960" cy="100" r="2"/>
      <circle cx="70" cy="380" r="2"/><circle cx="1010" cy="330" r="2.5"/><circle cx="180" cy="620" r="1.6"/><circle cx="930" cy="640" r="2"/><circle cx="60" cy="900" r="2"/><circle cx="1030" cy="960" r="1.6"/>
      <path d="M880 250l4 12 12 4-12 4-4 12-4-12-12-4 12-4z"/><path d="M190 300l3 9 9 3-9 3-3 9-3-9-9-3 9-3z"/>
    </g>
    <circle cx="540" cy="2010" r="330" fill="#F6C98F" opacity=".35"/>
    <path d="M0 1800 Q 270 1745 540 1772 T 1080 1760 V1920 H0Z" fill="#15122E" opacity=".55"/>
    <path d="M0 1850 Q 300 1815 560 1838 T 1080 1830 V1920 H0Z" fill="#0F0C24" opacity=".7"/>`,
    '0 0 1080 1920',
  );

  const phases = svgUri(
    `<circle cx="6" cy="6" r="4.5" fill="none" stroke="#E3C584"/><path d="M36 1.5a4.5 4.5 0 0 1 0 9a4.5 4.5 0 0 0 0-9z" fill="#E3C584"/><circle cx="36" cy="6" r="4.5" fill="none" stroke="#E3C584"/><circle cx="66" cy="6" r="4.5" fill="#F0B067"/><path d="M96 1.5a4.5 4.5 0 0 0 0 9a4.5 4.5 0 0 1 0-9z" fill="#E3C584"/><circle cx="96" cy="6" r="4.5" fill="none" stroke="#E3C584"/><circle cx="126" cy="6" r="4.5" fill="none" stroke="#E3C584"/>`,
    '0 0 132 12',
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080, height: 1920, position: 'relative', display: 'flex', color: '#F6EFE3', fontFamily: 'Jakarta',
          backgroundImage: 'linear-gradient(180deg, #0F0C24 0%, #1E1940 26%, #2A2353 44%, #4A3767 62%, #8A5866 78%, #C9835A 91%, #F0B067 100%)',
        }}
      >
        <img src={backdrop} width={1080} height={1920} alt="" style={{ position: 'absolute', left: 0, top: 0 }} />

        <div style={{ position: 'absolute', left: 0, right: 0, top: 270, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', fontSize: 30, fontWeight: 700, letterSpacing: 6, textTransform: 'uppercase', color: '#E3C584' }}>{eyebrow}</div>
          <img src={phases} width={220} height={20} alt="" style={{ marginTop: 14 }} />
        </div>

        {visual}

        <div style={{ position: 'absolute', left: 110, right: 110, top: 1140, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <img
            width={60}
            height={40}
            alt=""
            src={svgUri('<path d="M8 34c0-14 6-24 18-28l2 5c-7 3-10 8-10 13h8v10zM34 34c0-14 6-24 18-28l2 5c-7 3-10 8-10 13h8v10z" fill="#E3C584" opacity=".8"/>', '0 0 60 40')}
          />
          <div style={{ display: 'flex', marginTop: 24, fontFamily: 'Cormorant', fontStyle: 'italic', fontWeight: 500, fontSize: 76, lineHeight: 1.12, textAlign: 'center', justifyContent: 'center', textShadow: `0 2px 30px ${hexAlpha('#0F0C24', 0.5)}` }}>
            {highlight}
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, top: 1530, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              width={64}
              height={64}
              alt=""
              src={svgUri('<circle cx="16" cy="15" r="9" fill="#F6EFE3"/><circle cx="20" cy="12" r="8" fill="#9A6463"/><path d="M3 24h26" stroke="#F6EFE3" stroke-width="1.5" stroke-linecap="round"/><path d="M8 28h16" stroke="#F6EFE3" stroke-width="1.5" stroke-linecap="round" opacity=".6"/>', '0 0 32 32')}
            />
            <div style={{ display: 'flex', marginLeft: 18, fontFamily: 'Cormorant', fontWeight: 600, fontSize: 64 }}>Ruang Senja</div>
          </div>
          <div style={{ display: 'flex', marginTop: 12, fontSize: 32, fontWeight: 600, letterSpacing: 1.3, color: '#0F0C24', backgroundColor: 'rgba(246,239,227,.92)', padding: '10px 26px', borderRadius: 999 }}>
            {SITE_HOST}
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts: await loadFonts(),
      headers: { 'Cache-Control': 'private, max-age=3600' },
    },
  );
}
