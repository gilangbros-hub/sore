import { PRODUCT_NAME, RESULT_TTL_DAYS, SITE_URL, type ProductKind } from './config';

// Every WhatsApp message the site prefills, in one place so the wording stays consistent.

/** Buyer → you: sending the data for the reading. */
export function dataRequestText(product: ProductKind, code: string): string {
  const head = `Halo Ruang Senja, ini data untuk bacaan ${PRODUCT_NAME[product]}.\nKode: ${code}\n\nNama panggilan: `;
  if (product === 'tarot') return `${head}\nFokus (Cinta / Karier / Keuangan / Diri sendiri / Umum): \nPertanyaan (opsional): `;
  if (product === 'palm') return `${head}\nTangan yang difoto (kanan / kiri): \n\n(Foto telapak tangan aku lampirkan di chat ini)`;
  return `${head}\n\n(Foto wajah aku lampirkan di chat ini)`;
}

/** Buyer → you: paid but no code yet. */
export const NO_CODE_TEXT = 'Halo Ruang Senja, aku sudah bayar di Lynk.id tapi belum dapat kode akses. Nama/email di Lynk: ';

/** Buyer → you: general help with a code. */
export const helpText = (code: string) => `Halo Ruang Senja, aku mau tanya soal pesananku. Kode: ${code}`;

/** Buyer → you: talk about a delivered reading. */
export const discussText = (code: string) => `Halo Ruang Senja, aku mau ngobrol soal bacaanku. Kode: ${code}`;

/** You → buyer: the access code(s) after payment. */
export function codeDeliveryText(name: string | null, items: Array<{ code: string; product: ProductKind }>): string {
  const greet = `Halo${name ? ` ${name.split(' ')[0]}` : ''}, terima kasih sudah memesan di Ruang Senja.`;
  const lines = items.map((i) => `${PRODUCT_NAME[i.product]}: ${i.code}\n${SITE_URL}/status/${i.code}`);
  return [
    greet,
    '',
    items.length > 1 ? 'Ini kode-kode aksesmu:' : 'Ini kode aksesmu:',
    '',
    lines.join('\n\n'),
    '',
    'Buka link di atas untuk lihat progres dan langkah berikutnya. Data dan foto untuk bacaan cukup dikirim lewat chat ini, ya.',
    '',
    'Simpan kodenya, dipakai lagi untuk membuka bacaanmu nanti.',
  ].join('\n');
}

/** You → buyer: the reading is ready. */
export function resultDeliveryText(nickname: string | null, product: ProductKind, code: string, token: string): string {
  return [
    `Halo${nickname ? ` ${nickname}` : ''}, bacaan ${PRODUCT_NAME[product]}-mu sudah siap.`,
    '',
    `Buka di sini: ${SITE_URL}/b/${token}`,
    '',
    `Link-nya bisa kamu buka lagi kapan saja selama ${RESULT_TTL_DAYS} hari. Kode aksesmu: ${code}`,
    '',
    'Kalau ada yang mau ditanyakan soal bacaannya, balas saja chat ini.',
    '',
    'Ruang Senja untuk hiburan dan refleksi diri, bukan pengganti nasihat profesional.',
  ].join('\n');
}
