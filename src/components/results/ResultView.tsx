import { Page } from '@/components/Chrome';
import { TarotResult } from './TarotResult';
import { PalmResult } from './PalmResult';
import { AuraResult } from './AuraResult';
import type { Order } from '@/lib/orders';
import type { AuraResult as A, PalmResult as P, TarotResult as T } from '@/lib/results';
import { wibStamp } from '@/lib/format';
import { waLink } from '@/lib/config';
import { discussText } from '@/lib/wa';

/** Renders a delivered reading, or a draft when the admin previews one (token = null). */
export function ResultView({ order, result, token, banner }: { order: Order; result: unknown; token: string | null; banner?: React.ReactNode }) {
  const nickname = order.nickname ?? 'kamu';
  const at = wibStamp(order.delivered_at ?? new Date());
  const discussHref = token ? waLink(discussText(order.code)) : null;
  return (
    <Page>
      {banner}
      <main className="flex-1 px-5 pb-14 pt-5">
        {order.product === 'tarot' && <TarotResult r={result as T} nickname={nickname} focus={order.focus} deliveredAt={at} token={token} discussHref={discussHref} />}
        {order.product === 'palm' && <PalmResult r={result as P} nickname={nickname} hand={order.hand} deliveredAt={at} token={token} discussHref={discussHref} />}
        {order.product === 'aura' && <AuraResult r={result as A} nickname={nickname} deliveredAt={at} token={token} discussHref={discussHref} />}
      </main>
    </Page>
  );
}
