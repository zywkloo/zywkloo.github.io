/**
 * Minimal PostgREST client for the post_stats table.
 *
 * This used to import `@supabase/supabase-js`, which drags auth, realtime,
 * storage and postgrest (~46 KB gzipped) into every blog page in order to run
 * two REST selects and two RPCs. Supabase's REST surface is plain HTTP, so a
 * `fetch` wrapper covers everything this site does with it.
 */

const SUPABASE_URL = (import.meta.env.PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
const SUPABASE_KEY =
	import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';

export function hasSupabaseConfig() {
	return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

function isUsable() {
	return typeof window !== 'undefined' && hasSupabaseConfig();
}

function baseHeaders(): Record<string, string> {
	return {
		apikey: SUPABASE_KEY,
		Authorization: `Bearer ${SUPABASE_KEY}`,
		Accept: 'application/json',
	};
}

async function readError(response: Response) {
	try {
		const body = (await response.json()) as { message?: string };
		return body?.message || `${response.status} ${response.statusText}`;
	} catch {
		return `${response.status} ${response.statusText}`;
	}
}

/**
 * PostgREST `in.(…)` list. Values are double-quoted so a slug containing a
 * comma cannot split the filter; URLSearchParams percent-encodes the result.
 */
function inFilter(values: string[]) {
	const quoted = values.map((value) => `"${value.replace(/["\\]/g, '\\$&')}"`).join(',');
	return `in.(${quoted})`;
}

export async function selectRows<T>(
	table: string,
	params: Record<string, string>,
): Promise<T[] | null> {
	if (!isUsable()) {
		return null;
	}

	const query = new URLSearchParams(params).toString();
	try {
		const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
			headers: baseHeaders(),
		});
		if (!response.ok) {
			console.warn(`Unable to load ${table} from Supabase.`, await readError(response));
			return null;
		}
		return (await response.json()) as T[];
	} catch (error) {
		console.warn(`Unable to load ${table} from Supabase.`, (error as Error).message);
		return null;
	}
}

export async function callRpc<T>(fn: string, args: Record<string, unknown>): Promise<T | null> {
	if (!isUsable()) {
		return null;
	}

	try {
		const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
			method: 'POST',
			headers: { ...baseHeaders(), 'Content-Type': 'application/json' },
			body: JSON.stringify(args),
		});
		if (!response.ok) {
			console.warn(`Unable to call ${fn} in Supabase.`, await readError(response));
			return null;
		}
		return (await response.json()) as T;
	} catch (error) {
		console.warn(`Unable to call ${fn} in Supabase.`, (error as Error).message);
		return null;
	}
}

export { inFilter };
