// Business settings. Prices and hours live here so they can change in one place.
// Anything that differs per deployment (links, phone number) comes from env vars.

export type ProductKind = 'tarot' | 'palm' | 'aura';
export type CatalogItem = ProductKind | 'bundle';

export const PRICES: Record<CatalogItem, number> = {
  tarot: 35000,
  palm: 39000,
  aura: 29000,
  bundle: 79000,
};

export const PRODUCT_NAME: Record<ProductKind, string> = {
  tarot: 'Tarot 5 Kartu - Menjawab Pertanyaan Kamu',
  palm: 'Baca Garis Tangan',
  aura: 'Baca Aura',
};

/** Operating hours in WIB, shown on the status page and FAQ. */
export const HOURS = {
  close: process.env.NEXT_PUBLIC_JAM_TUTUP || '22.00',
  open: process.env.NEXT_PUBLIC_JAM_BUKA || '08.00',
};

/** How long a delivered reading stays viewable. Also stated on the privacy page. */
export const RESULT_TTL_DAYS = 30;

export const LYNK_URL: Record<CatalogItem, string> = {
  // Hardcoded fallback until the env vars are set in Vercel. The env var still wins when present.
  tarot: process.env.NEXT_PUBLIC_LYNK_URL_TAROT || 'https://lynk.id/rekan_ba/ymqq5wndw845/checkout',
  palm: process.env.NEXT_PUBLIC_LYNK_URL_PALM || 'https://lynk.id/rekan_ba/mvww1lexdv5o/checkout',
  aura: process.env.NEXT_PUBLIC_LYNK_URL_AURA || '#bacaan',
  bundle: process.env.NEXT_PUBLIC_LYNK_URL_BUNDLE || '#bacaan',
};

/** wa.me number without "+", e.g. 6281234567890. */
export const WA_NUMBER = (process.env.NEXT_PUBLIC_WA_NUMBER || '').replace(/\D/g, '');

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

/** Display host for the Story image, e.g. "ruangsenja.vercel.app". */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, '');

export function waLink(text?: string, number: string = WA_NUMBER): string {
  const q = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${number}${q}`;
}

export function rupiah(n: number): string {
  return 'Rp' + n.toLocaleString('id-ID');
}

export const FOCUS_OPTIONS = ['Cinta', 'Karier', 'Keuangan', 'Diri sendiri', 'Umum'] as const;
