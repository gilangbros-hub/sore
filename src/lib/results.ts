import { z } from 'zod';
import { TAROT_BY_ID } from './tarot';
import { AURA_BY_ID } from './aura';

const para = z.string().trim().min(1);
const paragraphs = z.array(para).min(1).max(4);
const storyLine = z.string().trim().min(1, 'Kalimat Story wajib diisi').max(70, 'Kalimat Story maksimal 70 karakter');

export const tarotResult = z.object({
  cards: z
    .array(
      z.object({
        card: z.string().refine((id) => id in TAROT_BY_ID, 'Kartu tidak dikenal'),
        reversed: z.boolean(),
        paragraphs,
      }),
    )
    .length(5),
  message: paragraphs,
  question: para,
  story_line: storyLine,
});

export const palmResult = z.object({
  lines: z.object({ hati: paragraphs, kepala: paragraphs, kehidupan: paragraphs, takdir: paragraphs }),
  summary: paragraphs,
  question: para,
  story_line: storyLine,
});

export const auraResult = z.object({
  dominant: z.string().refine((id) => id in AURA_BY_ID, 'Warna tidak dikenal'),
  secondary: z.string().refine((id) => id in AURA_BY_ID, 'Warna tidak dikenal'),
  meaning: paragraphs,
  strengths: z.array(para).min(1).max(5),
  watch: z.array(para).min(1).max(4),
  affirmation: para,
  story_line: storyLine,
});

export type TarotResult = z.infer<typeof tarotResult>;
export type PalmResult = z.infer<typeof palmResult>;
export type AuraResult = z.infer<typeof auraResult>;

export const RESULT_SCHEMA = { tarot: tarotResult, palm: palmResult, aura: auraResult } as const;

export const PALM_LINES = [
  { key: 'hati', name: 'Garis Hati', n: 1 },
  { key: 'kepala', name: 'Garis Kepala', n: 2 },
  { key: 'kehidupan', name: 'Garis Kehidupan', n: 3 },
  { key: 'takdir', name: 'Garis Takdir', n: 4 },
] as const;

/**
 * Words that suggest the reading drifts into death, illness, pregnancy or money predictions,
 * which the product never makes. The admin form warns; it does not block.
 */
const RISKY = [
  'meninggal', 'kematian', 'mati ', 'wafat', 'ajal', 'umur pendek',
  'sakit', 'penyakit', 'kanker', 'operasi', 'kecelakaan',
  'hamil', 'kehamilan', 'keguguran', 'anak pertama',
  'juta', 'miliar', 'lotre', 'togel', 'jackpot', 'kaya mendadak', 'rp ',
];

export function riskyWords(text: string): string[] {
  const t = ` ${text.toLowerCase()} `;
  return RISKY.filter((w) => t.includes(w));
}
