import { createClient } from "@supabase/supabase-js";

// Browser Supabase client using public env vars
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

