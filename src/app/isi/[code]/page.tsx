import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Header, Page } from '@/components/Chrome';
import { IntakeForm } from './IntakeForm';
import { getOrderByCode } from '@/lib/orders';
import { CODE_RE, normalizeCode } from '@/lib/codes';
import { PRODUCT_NAME } from '@/lib/config';

export const metadata: Metadata = { title: 'Isi data bacaan', robots: { index: false } };

export default async function IsiPage({ params }: { params: Promise<{ code: string }> }) {
  const code = normalizeCode(decodeURIComponent((await params).code));
  if (!CODE_RE.test(code)) notFound();
  const order = await getOrderByCode(code);
  if (!order) redirect(`/kode?c=${code}`);
  if (order.status === 'submitted') redirect(`/status/${code}`);
  if (order.status === 'ready' && order.result_token) redirect(`/b/${order.result_token}`);
  if (order.status !== 'unused') redirect(`/kode?c=${code}`);

  const product = PRODUCT_NAME[order.product];
  return (
    <Page header={<Header right={<p className="m-0 text-right text-[13px] text-mist-300">Kode aktif · {product}</p>} />}>
      <main className="flex-1 px-5 pb-14 pt-6">
        <IntakeForm code={code} kind={order.product} product={product} />
      </main>
    </Page>
  );
}
