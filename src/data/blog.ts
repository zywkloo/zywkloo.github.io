/**
 * Blog copy and series metadata tokens.
 * Separates editorial taxonomy and interface copy from presentation,
 * matching the design token architecture of GoldenARC and Archive Paper.
 */

export interface SeriesMetaToken {
	icon: string;
	name: string;
	shortName: string;
	subtitle: string;
	accentColor: string;
	badgeClass: string;
}

export const BLOG_COPY = {
	meta: {
		title: 'Blog',
		description: 'Technical notes on systems engineering, GPU graphics, agent orchestration, and domain-driven design.',
	},
	sidebar: {
		all: {
			icon: '✦',
			short: 'All',
			full: 'All Posts',
		},
		other: {
			icon: '🗂️',
			short: 'Other',
			full: 'Other',
		},
	},
	series: {
		TokenChef: {
			icon: '👨‍🍳',
			name: 'TokenChef',
			shortName: 'Token',
			subtitle: 'Git-Native Multi-Agent Coding',
			accentColor: '#cb3837',
			badgeClass: 'tokenchef',
		},
		MetalSolo: {
			icon: '🎸',
			name: 'MetalSolo',
			shortName: 'Metal',
			subtitle: 'High-Performance GPU Programming',
			accentColor: '#8b5cf6',
			badgeClass: 'metalsolo',
		},
		CleanSemantics: {
			icon: '✨',
			name: 'CleanSemantics',
			shortName: 'Semantics',
			subtitle: 'Domain-Driven Engineering',
			accentColor: '#0ea5e9',
			badgeClass: 'cleansemantics',
		},
		ReactNativeCulprits: {
			icon: '⚛️',
			name: 'ReactNativeCulprits',
			shortName: 'RN',
			subtitle: 'React Native Core Deep Dive',
			accentColor: '#61dafb',
			badgeClass: 'reactnativeculprits',
		},
	} satisfies Record<string, SeriesMetaToken>,
} as const;

export const SERIES_META = BLOG_COPY.series;
