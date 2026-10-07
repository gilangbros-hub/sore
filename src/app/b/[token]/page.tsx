import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MoonIcon, Page } from '@/components/Chrome';
import { ResultView } from '@/components/results/ResultView';
import { getOrderByToken } from '@/lib/orders';
import { RESULT_TTL_DAYS } from '@/lib/config';

export const metadata: Metadata = { title: 'Bacaanmu', robots: { index: false, follow: false } };

export default async function ResultPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) notFound();
  const order = await getOrderByToken(token);
  if (!order) notFound();

  if (order.status !== 'ready' || !order.result) {
    return (
      <Page>
        <main className="flex-1 px-5 pb-14 pt-10">
          <div className="mx-auto flex max-w-[440px] flex-col items-center gap-4 text-center">
            <MoonIcon size={40} />
            <h1 className="m-0 font-serif text-4xl font-semibold leading-[1.1]">Link ini sudah tidak aktif</h1>
            <p className="m-0 text-base leading-[1.6] text-mist-300">
              Bacaan bisa dibuka selama {RESULT_TTL_DAYS} hari setelah dikirim. Setelah itu datanya kami hapus untuk menjaga privasimu.
            </p>
            <Link href="/#bacaan" className="btn btn-primary">Lihat pilihan bacaan</Link>
          </div>
        </main>
      </Page>
    );
  }

  return <ResultView order={order} result={order.result} token={token} />;
}
