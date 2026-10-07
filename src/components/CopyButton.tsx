'use client';

import { useState } from 'react';

export function CopyButton({ text, className = '' }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={className || 'min-h-[36px] cursor-pointer rounded-full border-0 bg-night-700 px-3 text-[13px] font-semibold text-ivory-50'}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          /* clipboard blocked; the code is still visible on screen */
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }}
    >
      <span aria-live="polite">{copied ? 'Tersalin' : 'Salin'}</span>
    </button>
  );
}
