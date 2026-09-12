/**
 * Whether a markdown body contains anything remark-math will hand to KaTeX.
 *
 * Used to decide per-post whether the KaTeX stylesheet is worth loading — only
 * a few posts carry formulas, but the <link> used to sit unconditionally in the
 * blog layout, blocking render on every one of them.
 *
 * Deliberately looser than micromark's math grammar: it also matches `$…$`
 * inside fenced code, which costs an unnecessary stylesheet on a post that
 * happens to show shell variables, whereas a miss would render broken math.
 */

// An opener is a `$` not followed by whitespace; a closer is a `$` not preceded
// by whitespace. Close enough to remark-math that prose like "from $20/mo to
// $40/mo" and JS template literals do not trip it.
const INLINE_MATH = /\$(?![\s$])[^\n$]*[^\s$]\$/;

export function hasMath(body: string | undefined): boolean {
	if (!body) return false;
	// `\$` is an escaped currency sign, never a delimiter — drop those first so
	// a pricing table does not drag KaTeX onto the page.
	const source = body.replace(/\\\$/g, '');
	return source.includes('$$') || INLINE_MATH.test(source);
}
