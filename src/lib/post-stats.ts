import { getSupabaseBrowserClient, hasSupabaseConfig } from './supabase';

const VISITOR_ID_KEY = 'semantic-systems:visitor-id';
const VIEW_GATE_PREFIX = 'semantic-systems:viewed';
const LIKE_GATE_PREFIX = 'semantic-systems:liked';

interface PostStat {
	viewCount: number;
	likeCount: number;
}

function getUtcDayToken() {
	return new Date().toISOString().slice(0, 10);
}

function getViewGateKey(slug: string) {
	return `${VIEW_GATE_PREFIX}:${slug}:${getUtcDayToken()}`;
}

function getLikeGateKey(slug: string) {
	return `${LIKE_GATE_PREFIX}:${slug}`;
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

export function hasLikedPost(slug: string) {
	if (!canUseStorage()) {
		return false;
	}

	return window.localStorage.getItem(getLikeGateKey(slug)) === '1';
}

export function markLikedPost(slug: string) {
	if (!canUseStorage()) {
		return;
	}

	window.localStorage.setItem(getLikeGateKey(slug), '1');
}

export async function fetchPostStats(slugs: string[]) {
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
		.select('slug, view_count, like_count')
		.in('slug', normalizedSlugs);

	if (error) {
		console.warn('Unable to load post stats from Supabase.', error.message);
		return null;
	}

	return new Map(
		(data ?? []).map((row) => [
			row.slug as string,
			{
				viewCount: Number(row.view_count ?? 0),
				likeCount: Number(row.like_count ?? 0),
			} satisfies PostStat,
		]),
	);
}

export async function fetchViewCounts(slugs: string[]) {
	const stats = await fetchPostStats(slugs);
	if (!stats) {
		return null;
	}

	return new Map([...stats.entries()].map(([slug, value]) => [slug, value.viewCount]));
}

export async function fetchViewCount(slug: string) {
	const stats = await fetchPostStats([slug]);
	if (!stats) {
		return null;
	}

	return stats.get(slug)?.viewCount ?? 0;
}

export async function fetchLikeCount(slug: string) {
	const stats = await fetchPostStats([slug]);
	if (!stats) {
		return null;
	}

	return stats.get(slug)?.likeCount ?? 0;
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

export async function recordLike(slug: string) {
	const client = getSupabaseBrowserClient();
	if (!client) {
		return null;
	}

	const { data, error } = await client.rpc('record_post_like', {
		p_slug: slug,
		p_visitor_id: getOrCreateVisitorId(),
	});

	if (error) {
		console.warn('Unable to record post like in Supabase.', error.message);
		return null;
	}

	return Number(data ?? 0);
}
