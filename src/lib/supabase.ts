import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const PHOTO_BUCKET = 'photos';

let client: SupabaseClient | null = null;

/** Server-only client with the secret key. RLS is on with no policies, so this is the only way in. */
export function db(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env vars are missing (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY).');
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
