const TZ = 'Asia/Jakarta';

const dayFmt = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'short', timeZone: TZ });
const timeFmt = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TZ });

/** "Rabu, 7 Okt" */
export function wibDay(d: Date | string): string {
  return dayFmt.format(new Date(d)).replace('.', '');
}

/** "21.12" */
export function wibTime(d: Date | string): string {
  return timeFmt.format(new Date(d)).replace(':', '.');
}

/** "Rabu, 7 Okt · 21.12 WIB" */
export function wibStamp(d: Date | string): string {
  return `${wibDay(d)} · ${wibTime(d)} WIB`;
}

/** 6281234561234 -> "+62 812-••••-1234" */
export function maskWa(wa: string | null | undefined): string {
  if (!wa) return '';
  const local = wa.startsWith('62') ? wa.slice(2) : wa;
  return `+62 ${local.slice(0, 3)}-••••-${local.slice(-4)}`;
}

/** 6281234561234 -> "+62 812-3456-1234" (admin only) */
export function prettyWa(wa: string | null | undefined): string {
  if (!wa) return '';
  const local = wa.startsWith('62') ? wa.slice(2) : wa;
  return `+62 ${local.slice(0, 3)}-${local.slice(3, -4)}-${local.slice(-4)}`;
}
