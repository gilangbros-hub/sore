import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { getOrderByCode } from '@/lib/orders';
import { RESULT_SCHEMA } from '@/lib/results';
import { ResultView } from '@/components/results/ResultView';

export const dynamic = 'force-dynamic';

export default async function Preview({ params }: { params: Promise<{ code: string }> }) {
  await requireAdmin();
  const { code } = await params;
  const order = await getOrderByCode(decodeURIComponent(code).toUpperCase());
  if (!order) notFound();
  const parsed = RESULT_SCHEMA[order.product].safeParse(order.result_draft);

  const banner = (
    <div className="sticky top-0 z-10 flex flex-wrap items-center justify-center gap-3 bg-amber-400 px-4 py-2 text-sm font-semibold text-night-950">
      Pratinjau draf, belum terlihat pembeli.
      <Link href={`/admin/o/${order.code}`} className="text-night-950 underline hover:text-night-950">Kembali ke form</Link>
    </div>
  );

  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return (
      <div className="flex min-h-screen flex-col">
        {banner}
        <p className="m-auto max-w-md p-6 text-center text-mist-300">
          Draf belum lengkap untuk dipratinjau: <strong className="text-ivory-50">{i.path.join(' › ')}</strong> {i.message}
        </p>
      </div>
    );
  }
  return <ResultView order={order} result={parsed.data} token={null} banner={banner} />;
}
