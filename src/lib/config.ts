// Business settings. Prices and hours live here so they can change in one place.
// Lynk links and the WhatsApp number are hardcoded here too, not in env vars.

export type ProductKind = 'tarot' | 'palm' | 'aura';
export type CatalogItem = ProductKind | 'bundle';

export const PRICES: Record<CatalogItem, number> = {
  tarot: 39000,
  palm: 39000,
  aura: 35000,
  bundle: 99000,
};

export const PRODUCT_NAME: Record<ProductKind, string> = {
  tarot: 'Tarot 5 Kartu - Menjawab Pertanyaan Kamu',
  palm: 'Baca Garis Tangan (Dua Tangan)',
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
  tarot: 'https://lynk.id/rekan_ba/ymqq5wndw845',
  palm: 'https://lynk.id/rekan_ba/mvww1lexdv5o',
  aura: 'https://lynk.id/rekan_ba/p5880n5jjdpl',
  bundle: 'https://lynk.id/rekan_ba/om88p9m6263r',
};

/** wa.me number without "+", e.g. 6281234567890. */
export const WA_NUMBER = '628179142911';

// Hardcoded production domain. NEXT_PUBLIC_SITE_URL only overrides it for local dev.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://senjakala.vercel.app').replace(/\/$/, '');

/** Display host for the Story image, e.g. "senjakala.vercel.app". */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, '');

export function waLink(text?: string, number: string = WA_NUMBER): string {
  const q = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${number}${q}`;
}

export function rupiah(n: number): string {
  return 'Rp' + n.toLocaleString('id-ID');
}

export const FOCUS_OPTIONS = ['Cinta', 'Karier', 'Keuangan', 'Diri sendiri', 'Umum'] as const;
