/**
 * Vendors KaTeX's stylesheet + woff2 fonts into public/vendor/katex/.
 *
 * Why vendor at all: the stylesheet has to match the KaTeX version that
 * rehype-katex renders the markup with, and a hard-coded CDN URL drifts from
 * package-lock.json silently (it was pinned to 0.16.9 while the renderer was
 * on 0.16.47). Reading the version straight out of node_modules keeps the two
 * in lockstep, and serving from our own origin drops a cross-origin
 * DNS + TLS handshake from the three posts that actually contain math.
 *
 * Only .woff2 is copied — every browser that can render this site prefers it,
 * so the .woff/.ttf sources are stripped from the CSS rather than shipped as
 * ~800 KB of files nothing ever requests.
 *
 * Run after upgrading KaTeX:  node scripts/sync-katex.mjs
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const katexPkg = require.resolve('katex/package.json');
const katexDist = path.join(path.dirname(katexPkg), 'dist');
const version = JSON.parse(fs.readFileSync(katexPkg, 'utf8')).version;

const outDir = path.resolve('public/vendor/katex');
const outFonts = path.join(outDir, 'fonts');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outFonts, { recursive: true });

const css = fs
	.readFileSync(path.join(katexDist, 'katex.min.css'), 'utf8')
	// drop `,url(fonts/X.woff) format("woff"),url(fonts/X.ttf) format("truetype")`
	.replace(/,url\(fonts\/[^)]+\.(?:woff|ttf)\)\s*format\("(?:woff|truetype)"\)/g, '');

fs.writeFileSync(
	path.join(outDir, 'katex.min.css'),
	`/*! Vendored from katex@${version} by scripts/sync-katex.mjs — do not edit. */\n${css}`,
);

const fonts = fs.readdirSync(path.join(katexDist, 'fonts')).filter((f) => f.endsWith('.woff2'));
for (const font of fonts) {
	fs.copyFileSync(path.join(katexDist, 'fonts', font), path.join(outFonts, font));
}

const bytes = [path.join(outDir, 'katex.min.css'), ...fonts.map((f) => path.join(outFonts, f))].reduce(
	(sum, f) => sum + fs.statSync(f).size,
	0,
);
console.log(`katex@${version} → public/vendor/katex (${fonts.length} woff2, ${(bytes / 1024).toFixed(0)} KB total)`);
