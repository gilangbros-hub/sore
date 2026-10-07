import { createHash } from 'node:crypto';
import { safeEqual } from './secrets';
import type { CatalogItem } from './config';

// Lynk.id webhook, per Lynk's documentation:
//   POST application/json, event "payment.received"
//   header X-Lynk-Signature = sha256_hex(grandTotal + refId + message_id + merchantKey)

export type LynkPayload = {
  event?: string;
  data?: {
    message_action?: string;
    message_id?: string;
    message_data?: {
      refId?: string;
      createdAt?: string;
      customer?: { email?: string; name?: string; phone?: string };
      items?: Array<{ title?: string; qty?: number; price?: number; questions?: string }>;
      totals?: { grandTotal?: number | string };
    };
  };
};

export function verifySignature(p: LynkPayload, signature: string, merchantKey: string): boolean {
  const md = p.data?.message_data;
  const s = `${md?.totals?.grandTotal ?? ''}${md?.refId ?? ''}${p.data?.message_id ?? ''}${merchantKey}`;
  const expected = createHash('sha256').update(s, 'utf8').digest('hex');
  return safeEqual(signature.trim().toLowerCase(), expected);
}

/**
 * Map a Lynk product title to our catalogue. LYNK_PRODUCT_MAP (JSON: {"substring": "tarot|palm|aura|bundle"})
 * wins over the keyword guess, so odd product names can be fixed without touching code.
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

/** Answers to Lynk "Additional Questions" arrive as a JSON string. */
export function parseAnswers(raw: unknown): Record<string, string> | null {
  if (!raw || typeof raw !== 'string') return null;
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>;
    const out = Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, String(v ?? '')]));
    return Object.keys(out).length ? out : null;
  } catch {
    return null;
  }
}
