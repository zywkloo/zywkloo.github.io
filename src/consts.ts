// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Victor Zhang | Mobile & Systems Engineer | Apps from Device to Cloud';
export const SITE_DESCRIPTION = 'Mobile and systems engineer building reliable, data-heavy product systems across iOS, React Native, device sync, backend flows, and telemetry.';
export const SITE_AUTHOR = 'Victor Zhang';
export const SITE_URL = 'https://zywkloo.github.io';

// Social links
export const GITHUB_URL = 'https://github.com/zywkloo';
export const LINKEDIN_URL = 'https://linkedin.com/in/yiweiZ315';
export const EMAIL = 'yiweizhangca@gmail.com';

// Featured project
export const WTCRAFT_URL = 'https://github.com/zywkloo/wtcraft';
export const WTCRAFT_NPM_URL = 'https://www.npmjs.com/package/wtcraft';
export const WTCRAFT_PYPI_URL = 'https://pypi.org/project/wtcraft/';

// Profile
export const PROFILE_IMAGE = 'https://avatars.githubusercontent.com/u/18610590?s=400&u=bb73412244714c5465010503fee1c6381c8b46fe&v=4';
export const USER_TITLE = 'Mobile & Systems Engineer';

// ---------------------------------------------------------------------------
// Blog/doc series metadata — single source of truth.
// Consumed by blog index cards, the BlogPost layout, and the wtcraft hub so the
// badge label / accent colour / subtitle never drift between pages.
// ---------------------------------------------------------------------------
export interface SeriesMeta {
	icon: string;
	name: string;
	subtitle: string;
	accentColor: string;
	badgeClass: string;
}

export const SERIES_META: Record<string, SeriesMeta> = {
	TokenChef: { icon: '👨‍🍳', name: 'TokenChef', subtitle: 'Git-Native Multi-Agent Coding', accentColor: '#cb3837', badgeClass: 'tokenchef' },
	MetalSolo: { icon: '🎸', name: 'MetalSolo', subtitle: 'High-Performance GPU Programming', accentColor: '#8b5cf6', badgeClass: 'metalsolo' },
	'Clean Semantics': { icon: '✨', name: 'Clean Semantics', subtitle: 'Domain-Driven Engineering', accentColor: '#0ea5e9', badgeClass: 'cleansemantics' },
};

// Normalize a raw series value (e.g. "Clean Semantics 01") into its group key,
// trailing part number, and metadata. Returns null for unknown/absent series.
export function getSeriesMeta(series?: string) {
	if (!series) return null;
	const key = series.replace(/\s+\d+$/, '');
	const meta = SERIES_META[key];
	if (!meta) return null;
	const partMatch = series.match(/\s+(\d+)$/);
	return { ...meta, key, part: partMatch ? partMatch[1] : null };
}

// CSS class for the series badge; falls back to a slugified series for unknowns.
export function seriesBadgeClass(series?: string): string {
	const m = getSeriesMeta(series);
	return m ? m.badgeClass : (series ?? '').toLowerCase();
}

// Badge label, e.g. "👨‍🍳 TokenChef" or "✨ Clean Semantics (Part 01)".
export function seriesBadgeLabel(series?: string): string {
	const m = getSeriesMeta(series);
	if (!m) return series ?? '';
	return m.key === 'Clean Semantics' && m.part
		? `${m.icon} ${m.name} (Part ${m.part})`
		: `${m.icon} ${m.name}`;
}
