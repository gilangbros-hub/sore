// Aura colours the owner can pick from. Each has a light, mid and deep stop.
// "jingga" and "ungu" match the design exactly.

export type AuraColour = { id: string; name: string; light: string; mid: string; deep: string };

export const AURA_COLOURS: AuraColour[] = [
  { id: 'jingga', name: 'Jingga Senja', light: '#F6C98F', mid: '#F0B067', deep: '#C9835A' },
  { id: 'ungu', name: 'Ungu Lembayung', light: '#A58BD0', mid: '#7A5FA8', deep: '#4E3C7A' },
  { id: 'merah', name: 'Merah Delima', light: '#F4A28C', mid: '#D9665A', deep: '#8E3B46' },
  { id: 'jambu', name: 'Merah Jambu', light: '#F8C6D6', mid: '#E58FAE', deep: '#A8507A' },
  { id: 'kuning', name: 'Kuning Fajar', light: '#FBE7A1', mid: '#EBC85C', deep: '#B98E2F' },
  { id: 'emas', name: 'Emas Pagi', light: '#FBE3C2', mid: '#E3C584', deep: '#B08A3E' },
  { id: 'hijau', name: 'Hijau Pucuk', light: '#BFE3B0', mid: '#7FB77E', deep: '#3E7A57' },
  { id: 'biru', name: 'Biru Samudra', light: '#A9C8F0', mid: '#5F8FD1', deep: '#2F4E8C' },
  { id: 'nila', name: 'Nila Malam', light: '#9AA0E6', mid: '#5B5FB8', deep: '#2E2F73' },
  { id: 'putih', name: 'Putih Mutiara', light: '#FFFFFF', mid: '#E9E4F2', deep: '#B8AFCF' },
];

export const AURA_BY_ID: Record<string, AuraColour> = Object.fromEntries(AURA_COLOURS.map((c) => [c.id, c]));

export function hexAlpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** The orb gradient from the design, generalised to any pair of colours. */
export function orbGradient(dom: AuraColour, sec: AuraColour): string {
  return `radial-gradient(circle at 42% 38%, #FBE3C2 0%, ${dom.light} 18%, ${dom.mid} 42%, ${dom.deep} 62%, ${sec.mid} 86%, ${hexAlpha(sec.mid, 0)} 100%)`;
}

export function haloGradient(sec: AuraColour): string {
  return `radial-gradient(closest-side, ${hexAlpha(sec.mid, 0.55)}, ${hexAlpha(sec.mid, 0.18)} 60%, rgba(21,18,46,0))`;
}

export function swatchGradient(c: AuraColour): string {
  return `radial-gradient(circle at 40% 35%, ${c.light}, ${c.mid} 60%, ${c.deep})`;
}
