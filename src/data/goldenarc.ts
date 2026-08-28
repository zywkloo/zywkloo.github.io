/**
 * GoldenARC's brand copy lives separately from its presentation so the
 * Carbon baseline and future brand explorations can compare language without
 * rewriting page structure.
 */
export const GOLDENARC_COPY = {
	meta: {
		title: 'GoldenARC Digital | One Core. Many Arcs.',
		description: 'Plug Once. Grow Everywhere. GoldenARC Digital builds local-first Apple platform tools on a modular Swift package architecture, including ARC EDF & BDF Viewer, ARC Scanner, ARC Markdown, and ARC PDF Studio.',
	},
	hero: {
		title: 'One Core. Many Arcs.',
		lede: 'Plug Once. Grow Everywhere. GoldenARC tools stay focused at the product layer while shared capabilities live in small, testable Swift Package products with explicit dependency boundaries.',
	},
	tools: {
		eyebrow: 'The ARC series',
		title: 'Choose a tool',
		description: 'Separate products at different stages, built around the same engineering discipline.',
	},
} as const;
