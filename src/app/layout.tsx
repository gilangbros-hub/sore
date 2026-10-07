import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import { SITE_URL } from '@/lib/config';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-cormorant',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Ruang Senja · Tarot, garis tangan, dan aura', template: '%s · Ruang Senja' },
  description: 'Bacaan tarot, garis tangan, dan aura yang personal, dikirim ke WhatsApp-mu dalam 1–3 jam. Untuk hiburan dan refleksi diri.',
  openGraph: { siteName: 'Ruang Senja', locale: 'id_ID', type: 'website' },
};

export const viewport: Viewport = { themeColor: '#15122E', colorScheme: 'dark' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${cormorant.variable} ${jakarta.variable}`}>
      <body>{children}</body>
    </html>
  );
}
