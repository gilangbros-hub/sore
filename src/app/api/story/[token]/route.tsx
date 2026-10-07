import { getOrderByToken } from '@/lib/orders';
import { storyImage } from '@/lib/story';
import type { AuraResult, PalmResult, TarotResult } from '@/lib/results';

export const runtime = 'nodejs';

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) return new Response('Not found', { status: 404 });
  const order = await getOrderByToken(token);
  if (!order || order.status !== 'ready' || !order.result) return new Response('Not found', { status: 404 });
  return storyImage(order.product, order.result as TarotResult | PalmResult | AuraResult);
}
