---
title: "Marketing a Personal GitHub Pages + Astro Blog (SEO & GEO)"
description: "The full playbook for a bilingual Astro blog on GitHub Pages: the Astro-specific technical SEO that's free, the title/metadata gotchas that aren't, and how to get cited by AI engines fast via canonical cross-posting."
pubDate: 2026-06-07
lang: "en"
tags: ["wtcraft", "SEO", "GEO", "Astro", "GitHub Pages"]
---

This is the surface I actually own. A static Astro blog on GitHub Pages is about as SEO-friendly as it gets *by default* — but "by default" hides a couple of gotchas that quietly cost you ranking, and getting cited by AI engines needs a deliberate push because a brand-new domain has no authority yet. Here's the whole playbook, using this site (`zywkloo.github.io`) as the example.

> **摘要**:Astro + GitHub Pages 的技术 SEO 基本免费,但有几个暗坑(尤其 title 混入 HTML 标签)。GEO 上,新域名没权重,靠**双语内容 + canonical 跨站转载**快速被 AI 收录引用。

---

## The technical SEO Astro gives you for free (just don't forget it)

Astro's static output (SSG) with near-zero client JS already does most of the work. The few things to actually wire up:

- **Sitemap.** `@astrojs/sitemap` is enabled in `astro.config.mjs`; after a build it emits `sitemap-index.xml`. The one manual step that matters: submit it to **Google Search Console** so crawling is pull, not wait-and-pray.
- **Per-page metadata via `BaseHead.astro`.** Pass a real `title` (50–60 chars) and `description` (120–150 chars, with the keywords you want — `iOS`, `React Native`, `FastAPI`) to every page. `BaseHead` already emits the `<link rel="canonical">`, which quietly saves you from duplicate-content penalties against the `github.io` mirror.
- **Fonts & images.** `BaseHead` preloads the Atkinson font (kills the flash, helps LCP); use Astro's `<Image />` for posts so JP/PNG auto-convert to WebP/AVIF. Both feed straight into Core Web Vitals.

None of this is clever. It's just a checklist you run once.

## The gotcha that actually bites: HTML in your `<title>`

> **关键坑**:Frontmatter 的 `title` 必须是**纯文本**,不能塞 `<em>` 之类标签。

This one's worth calling out because it's silent and self-inflicted. If a post's frontmatter title contains an HTML tag:

```yaml
title: 'TokenChef (Part 4): Stop Reinventing the Agent — <em>wtcraft</em>'
```

…that tag renders straight into `<head>`'s `<title>` element. The result: garbled character entities (`&lt;em&gt;`) in the browser tab and in search results, and Google flagging the page as non-canonical and demoting it. **The frontmatter title must be plain text.** If you want a word highlighted in the rendered heading, do it in the Astro component at render time (a regex pass that wraps the term), never in the data source.

## GEO for a bilingual blog

The blog's job in the GEO economy is to be the *citable explanation* behind your projects. Two things specific to a bilingual blog:

- **Bilingual descriptions.** If a post is中英双语, the `description` should carry retrieval keywords in *both* languages so search engines in either language match the right snippet:
  ```yaml
  description: "Comparing OpenAI Codex vs. Claude Code architecture. / 从 Claude Code 源码泄露与 CCB 逆向架构出发,探讨 wtcraft 如何做实任务边界与验收。"
  ```
- **Question-shaped headings, not literary ones.** Replace `## 引子:从一次源码泄露说起` with something a person would actually ask a model: `## What is the six-layer Claude Code architecture reverse-engineered by CCB?`. Then answer it immediately underneath, and add a 2–3 question **FAQ** at the end — that high-density block is what the retriever pulls first.

This is the same BLUF/table/FAQ discipline from the [overview](/docs), applied to long-form prose.

## Getting discovered fast: canonical cross-posting

A new GitHub Pages domain has no authority, so search engines are slow to find it. You borrow authority from high-DA platforms — without splitting your own — by cross-posting with a canonical pointer home.

> **摘要**:用高权重平台(Dev.to、Medium)发英文版,但把 **Canonical URL 设回自己站** — 流量和权重结算到你的域名,不是平台。

- **Dev.to / Medium.** Publish the English version on [Dev.to](https://dev.to) (DA 90+); high-authority posts often hit Google's first page within minutes. **The non-negotiable step:** in the post settings, set the **Canonical URL** to your own page:
  `https://zywkloo.github.io/blog/dont-build-another-agent-codex-claude-code-wtcraft/`
  Google then settles the backlinks, traffic, and social signals onto *your* domain and accelerates indexing of your original.
- **Where the AI crawlers loiter.** Share to Hacker News (Show HN) and topical subreddits (e.g. r/LocalLLaMA). Real-time engines like Perplexity watch trending links on these platforms, which can pull your post into their RAG index almost immediately.

## Verify it (验收)

A week after publishing, run the identity and project prompts from the [overview](/docs) on Perplexity and ChatGPT Search. Passing looks like: an answer about "Victor Zhang (zywkloo)" that's *accurate* and links back here, and a `wtcraft` explanation that cites a `zywkloo.github.io/blog/...` page rather than a third-party rehash. If a third-party copy outranks your original, your canonical tags aren't set right — fix those first.
