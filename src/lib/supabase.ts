import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;

export function hasSupabaseConfig() {
	return Boolean(
		import.meta.env.PUBLIC_SUPABASE_URL &&
			(import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY),
	);
}

export function getSupabaseBrowserClient() {
	if (typeof window === 'undefined' || !hasSupabaseConfig()) {
		return null;
	}

	if (!browserClient) {
		browserClient = createClient(
			import.meta.env.PUBLIC_SUPABASE_URL!,
			import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.PUBLIC_SUPABASE_ANON_KEY!,
			{
				auth: {
					autoRefreshToken: false,
					detectSessionInUrl: false,
					persistSession: false,
				},
			},
		);
	}

	return browserClient;
}
