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

export function signatureDiagnostics(p: LynkPayload, signature: string, merchantKey: string) {
  const md = p.data?.message_data;
  const amount = md?.totals?.grandTotal ?? '';
  const refId = md?.refId ?? '';
  const messageId = p.data?.message_id ?? '';
  const cleanKey = merchantKey.trim();
  const received = signature.trim().toLowerCase().replace(/^sha256=/, '');
  const expected = createHash('sha256')
    .update(`${amount}${refId}${messageId}${cleanKey}`, 'utf8')
    .digest('hex');

  return {
    valid: safeEqual(received, expected),
    amount: String(amount),
    amountType: typeof amount,
    refId: String(refId),
    messageId: String(messageId),
    keyConfigured: cleanKey.length > 0,
    signaturePresent: received.length > 0,
    signatureLength: received.length,
    receivedPrefix: received.slice(0, 10),
    expectedPrefix: expected.slice(0, 10),
  };
}

export function verifySignature(p: LynkPayload, signature: string, merchantKey: string): boolean {
  return signatureDiagnostics(p, signature, merchantKey).valid;
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
