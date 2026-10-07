import Link from 'next/link';
import type { ReactNode } from 'react';
import { waLink } from '@/lib/config';

export function Logo() {
  return (
    <Link href="/" aria-label="Ruang Senja, ke beranda" className="flex min-h-[44px] flex-none items-center gap-2.5 whitespace-nowrap text-ivory-50 no-underline hover:text-ivory-50">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="15" r="9" fill="#F0B067" />
        <circle cx="20" cy="12" r="8" fill="#15122E" />
        <path d="M3 24h26" stroke="#E3C584" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 28h16" stroke="#E3C584" strokeWidth="1.5" strokeLinecap="round" opacity=".5" />
      </svg>
      <span className="font-serif text-2xl font-semibold tracking-[.01em]">Ruang Senja</span>
    </Link>
  );
}

export function Header({ right }: { right?: ReactNode }) {
  return (
    <header className="relative z-[2] px-5 py-3">
      <div className="mx-auto flex max-w-[1040px] items-center justify-between gap-3">
        <Logo />
        {right}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-ivory-50/10 px-5 pb-8 pt-6">
      <div className="mx-auto flex max-w-[1040px] flex-col gap-2.5">
        <p className="m-0 text-sm leading-[1.6] text-mist-300">
          Ruang Senja untuk hiburan dan refleksi diri, bukan pengganti nasihat profesional.
        </p>
        <nav aria-label="Tautan bawah" className="flex flex-wrap gap-x-5 text-sm">
          <Link href="/faq" className="flink">FAQ</Link>
          <Link href="/privasi" className="flink">Privasi</Link>
          <a href={waLink()} className="flink">Bantuan via WhatsApp</a>
        </nav>
      </div>
    </footer>
  );
}

export function Page({ children, header, className = '' }: { children: ReactNode; header?: ReactNode; className?: string }) {
  return (
    <div className={`flex min-h-screen flex-col bg-night-900 ${className}`}>
      {header ?? <Header />}
      {children}
      <Footer />
    </div>
  );
}

const STAR_POS: Array<[number, number, number, number]> = [
  // left %, top %, delay s, size px
  [12, 18, 0, 3], [28, 8, 1.2, 2], [72, 14, 2.1, 3], [86, 30, 0.6, 2], [58, 4, 3.3, 2], [6, 46, 2.7, 2], [92, 58, 4, 3],
];

export function Stars({ positions = STAR_POS }: { positions?: Array<[number, number, number, number]> }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {positions.map(([l, t, d, s], i) => (
        <span
          key={i}
          className="absolute rounded-full bg-gold-300 motion-safe:animate-twinkle"
          style={{ left: `${l}%`, top: `${t}%`, width: s, height: s, animationDelay: `${d}s` }}
        />
      ))}
    </div>
  );
}

export function Check({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" className="flex-none">
      <path d="M3 8.5l3 3 7-7" fill="none" stroke="#E3C584" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 2.5a7.5 7.5 0 0 0-6.4 11.4L2.5 17.5l3.7-1A7.5 7.5 0 1 0 10 2.5z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MoonIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" className="mt-0.5 flex-none">
      <path d="M13 3a7.5 7.5 0 1 0 4 11.5A6 6 0 0 1 13 3z" fill="none" stroke="#E3C584" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function DeliveredPill({ at }: { at: string }) {
  return (
    <p className="mt-1 inline-flex items-center gap-2 rounded-full bg-night-800 px-3.5 py-2 text-[13px] leading-[1.4] text-mist-300">
      <Check />
      Dikirim {at} · Bisa dibuka lagi kapan saja
    </p>
  );
}
