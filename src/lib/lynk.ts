import type { CatalogItem } from './config';

// Lynk.id webhook parsing.
//
// The payload format could not be checked from this build environment, so this walks the JSON
// for the fields we need instead of assuming exact paths. Every raw payload is stored in
// webhook_events, so the mapping can be tightened once a real delivery has been seen.

export type ParsedLynk = {
  ref: string | null;
  email: string | null;
  items: Array<{ title: string; qty: number; product: CatalogItem | null }>;
  failed: boolean; // payment explicitly not successful
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REF_KEYS = /^(ref_?id|order_?id|order_?code|invoice(_?id)?|transaction_?id|trx_?id|reference)$/i;
const TITLE_KEYS = /^(title|name|product_?name|product_?title|item_?name)$/i;
const QTY_KEYS = /^(qty|quantity|jumlah)$/i;
const STATUS_KEYS = /^(status|payment_?status|message_?action|event|type)$/i;
const BAD_STATUS = /(fail|cancel|expire|refund|reject|denied|unpaid)/i;

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

/**
 * Map a Lynk product title to our catalogue. LYNK_PRODUCT_MAP (JSON: {"substring": "tarot|palm|aura|bundle"})
 * wins over the keyword guess, so odd product names can be fixed without a deploy.
 */
export function mapProduct(title: string): CatalogItem | null {
  const t = title.toLowerCase();
  try {
    const custom = JSON.parse(process.env.LYNK_PRODUCT_MAP || '{}') as Record<string, CatalogItem>;
    for (const [needle, product] of Object.entries(custom)) if (t.includes(needle.toLowerCase())) return product;
  } catch {
    /* ignore a malformed map */
  }
  if (/(paket|bundle|lengkap)/.test(t)) return 'bundle';
  if (/tarot/.test(t)) return 'tarot';
  if (/(garis tangan|telapak|palm)/.test(t)) return 'palm';
  if (/aura/.test(t)) return 'aura';
  return null;
}

export function parseLynk(payload: unknown): ParsedLynk {
  let ref: string | null = null;
  const emails: Array<{ key: string; value: string }> = [];
  const items: ParsedLynk['items'] = [];
  let failed = false;

  const walk = (node: Json, key: string) => {
    if (Array.isArray(node)) {
      for (const child of node) {
        if (child && typeof child === 'object' && !Array.isArray(child)) {
          // An array of objects with a title looks like a line-items list.
          const entry = Object.entries(child).find(([k, v]) => TITLE_KEYS.test(k) && typeof v === 'string');
          if (entry) {
            const qtyEntry = Object.entries(child).find(([k]) => QTY_KEYS.test(k));
            const qty = Math.max(1, Math.min(10, Number(qtyEntry?.[1]) || 1));
            items.push({ title: String(entry[1]), qty, product: mapProduct(String(entry[1])) });
          }
        }
        walk(child, key);
      }
      return;
    }
    if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) walk(v, k);
      return;
    }
    if (typeof node === 'string') {
      if (EMAIL_RE.test(node.trim())) emails.push({ key, value: node.trim().toLowerCase() });
      if (!ref && REF_KEYS.test(key) && node.trim()) ref = node.trim();
      if (STATUS_KEYS.test(key) && BAD_STATUS.test(node)) failed = true;
    } else if (typeof node === 'number' && !ref && REF_KEYS.test(key)) {
      ref = String(node);
    }
  };
  walk(payload as Json, '');

  // Prefer an address under a key that says "email" and is not the merchant's own.
  const merchant = (process.env.LYNK_MERCHANT_EMAIL || '').toLowerCase();
  const candidates = emails.filter((e) => e.value !== merchant);
  const email = (candidates.find((e) => /email/i.test(e.key)) ?? candidates[0])?.value ?? null;

  // No line items found: fall back to a single top-level title, if any.
  if (!items.length) {
    const flat = JSON.stringify(payload);
    const m = flat.match(/"(?:product_?name|product_?title|title)"\s*:\s*"([^"]+)"/i);
    if (m) items.push({ title: m[1], qty: 1, product: mapProduct(m[1]) });
  }

  return { ref, email, items, failed };
}
