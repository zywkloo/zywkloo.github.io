import { getSupabaseBrowserClient, hasSupabaseConfig } from './supabase';

const VISITOR_ID_KEY = 'semantic-systems:visitor-id';
const VIEW_GATE_PREFIX = 'semantic-systems:viewed';

function getUtcDayToken() {
	return new Date().toISOString().slice(0, 10);
}

function getViewGateKey(slug: string) {
	return `${VIEW_GATE_PREFIX}:${slug}:${getUtcDayToken()}`;
}

function canUseStorage() {
	try {
		return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
	} catch {
		return false;
	}
}

export function hasPostStatsConfig() {
	return hasSupabaseConfig();
}

export function getOrCreateVisitorId() {
	if (!canUseStorage()) {
		return `ephemeral-${Math.random().toString(36).slice(2)}`;
	}

	const existingId = window.localStorage.getItem(VISITOR_ID_KEY);
	if (existingId) {
		return existingId;
	}

	const nextId = crypto.randomUUID();
	window.localStorage.setItem(VISITOR_ID_KEY, nextId);
	return nextId;
}

export function shouldRecordView(slug: string) {
	if (!canUseStorage()) {
		return true;
	}

	return window.localStorage.getItem(getViewGateKey(slug)) !== '1';
}

export function markViewRecorded(slug: string) {
	if (!canUseStorage()) {
		return;
	}

	window.localStorage.setItem(getViewGateKey(slug), '1');
}

export async function fetchViewCounts(slugs: string[]) {
	const client = getSupabaseBrowserClient();
	if (!client) {
		return null;
	}

	const normalizedSlugs = [...new Set(slugs.filter(Boolean))];
	if (normalizedSlugs.length === 0) {
		return new Map<string, number>();
	}

	const { data, error } = await client
		.from('post_stats')
		.select('slug, view_count')
		.in('slug', normalizedSlugs);

	if (error) {
		console.warn('Unable to load post stats from Supabase.', error.message);
		return null;
	}

	return new Map(
		(data ?? []).map((row) => [row.slug as string, Number(row.view_count ?? 0)]),
	);
}

export async function fetchViewCount(slug: string) {
	const counts = await fetchViewCounts([slug]);
	if (!counts) {
		return null;
	}

	return counts.get(slug) ?? 0;
}

export async function recordView(slug: string) {
	const client = getSupabaseBrowserClient();
	if (!client) {
		return null;
	}

	const { data, error } = await client.rpc('record_post_view', {
		p_slug: slug,
		p_visitor_id: getOrCreateVisitorId(),
	});

	if (error) {
		console.warn('Unable to record post view in Supabase.', error.message);
		return null;
	}

	return Number(data ?? 0);
}
