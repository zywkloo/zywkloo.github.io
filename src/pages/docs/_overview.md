These are my working notes on getting indexed — and *cited* — by both classic search engines and the newer AI answer engines. I write a lot of bilingual, fairly niche technical content (the TokenChef series, `wtcraft`), and the honest reality is that nobody types my project names into Google yet. So the question I actually care about isn't "how do I rank," it's "when someone asks Perplexity or ChatGPT about git-native multi-agent tooling, does my work show up in the answer — with a link back to me?"

That framing — optimizing for the *citation*, not the blue link — is what GEO (Generative Engine Optimization) is about, and it's where I spend most of my effort. SEO still matters, but it's largely a solved, commodity checklist. GEO is the part that's still soft and worth thinking about.

> **摘要**：这一节是总览——为什么做、怎么做、什么时候做，以及**最关键的:GEO 怎么验收**。下面三篇是分场景的实战(开源包 / 个人博客 / 商业站重构)。SEO 是老生常谈,一笔带过;重点在 GEO。

---

## Why — SEO is table stakes, GEO is the new surface

Two different machines read your site, and they fail in different ways.

A **search crawler** wants clean HTML, a sitemap, fast paint, and unique titles. If you give it that, you rank roughly as well as your backlinks deserve. This is well-trodden ground; there's nothing clever left to do here, only things you can forget to do.

An **answer engine** (Perplexity, ChatGPT Search, Google AI Overviews, Copilot) does something else entirely. It runs a RAG (检索增强生成) loop: retrieve a handful of pages, slice them into chunks, and synthesize an answer that *quotes* a few sources. You're no longer competing for position #1 — you're competing to be one of the 3–5 chunks the model decides are worth quoting. That's a content-shape problem, not a backlink problem, and almost nobody optimizes for it yet. That gap is the opportunity.

> **为什么重点在 GEO**:传统 SEO(关键词 / Domain Authority / 外链)是红海,人人都在做。GEO 还很「软」,内容结构稍微为 LLM 提炼习惯调整一下,就能被引用——这是性价比最高的地方。

## How — the whole playbook on one screen

Everything in the three practical docs reduces to the same handful of moves:

- **Let the AI crawlers in.** A `robots.txt` that explicitly allows `GPTBot`, `OAI-SearchBot`, `Claude-Web`, `Google-Extended`. Most people reflexively block these; if you *want* to be cited, do the opposite.
- **Lead with the answer (BLUF — Bottom Line Up Front).** The first 1–2 sentences under any heading should state the conclusion in plain language. LLMs lift that line almost verbatim.
- **Make facts liftable.** Comparison tables, FAQ sections with real question-shaped `H3`s, concrete numbers with authoritative outbound links. Models love a table they can render straight into an answer card.
- **Be a clean knowledge graph.** JSON-LD (`Person`, `SoftwareApplication`, `Article`) so the model can resolve *who/what* without guessing.
- **Close the backlink loop.** Point your high-authority surfaces (GitHub, NPM, PyPI, Dev.to) back at the canonical page, with `rel=canonical` set correctly so the equity settles on your domain.

The mechanics differ per surface — a README is not a blog post is not a marketing landing page — which is exactly why the three docs below exist.

## When — sequencing matters more than you'd think

> **摘要**:别一上来就追 GEO。先让爬虫拿到干净 HTML,再谈被 AI 引用。

A rough timeline, because doing these out of order wastes weeks:

1. **At launch:** ship static HTML, valid sitemap, per-page `<title>`/description/canonical, JSON-LD, and the permissive `robots.txt`. This is the SEO baseline — without it, there's nothing for an answer engine to retrieve.
2. **Day 0–7:** seed the high-authority backlinks (NPM/PyPI `homepage`, README footer link, a Dev.to cross-post with canonical pointing home). This is what gets you *discovered* fast.
3. **After ~1 week:** start the GEO acceptance loop below. Indexing isn't instant; testing on day one just tells you the crawler hasn't been around yet.
4. **Ongoing:** reshape content based on what the models actually quote (or get wrong).

## How to verify GEO — the acceptance test (验收)

This is the part people skip, and it's the only part that tells you whether any of the above worked. SEO has dashboards; GEO mostly doesn't, so you verify it by *interrogating the models directly* and scoring the answers.

> **摘要**:GEO 没有现成后台,验收靠「向 AI 提问 + 给回答打分」。三个核心指标:引用率、域名提及、信息准确度。优先在 Perplexity 上测。

**Run a fixed prompt set** across Perplexity, ChatGPT Search, Gemini, and Copilot — the same prompts each week so the trend is comparable:

| Intent | Example prompt | What "pass" looks like |
| :--- | :--- | :--- |
| Identity / 履历 | "Who is Victor Zhang (zywkloo) and what does he work on?" | Accurate role + projects, with a link to my site |
| Project lookup | "What is wtcraft and how does it do bounded multi-agent coding?" | Correct mechanism, cites a `zywkloo.github.io/blog/...` page |
| Category query | "Lightweight, git-native tooling for AI multi-agent coding?" | `wtcraft` appears in the list, ideally with the comparison table lifted |

**Score three things:**

- **Citation Rate（引用率）** — out of ~10 strongly-relevant prompts, how often does my page show up as a cited source? This is the headline metric.
- **Domain Mentions（域名提及）** — how often my domain surfaces across models, cited or not.
- **Information Accuracy（信息准确度）** — is what the model *says* about me/the project correct, or is it hallucinating a背景 I don't have? A wrong citation is worse than no citation.

**Why Perplexity first:** it re-indexes tech blogs and GitHub Pages aggressively (often within hours), it surfaces a "Sources" panel that makes pass/fail obvious at a glance, and its audience skews toward exactly the developers who'd search for a tool like `wtcraft`. It's the fastest, clearest feedback loop — I treat it as the canary before checking the slower engines.

## SEO, briefly (the commodity part)

I won't belabor this — it's a checklist, not an art:

- Static render (SSG), never ship a CSR shell to a crawler.
- Unique `<title>` (50–60 chars) and `description` (120–150 chars) per page; titles must be **plain text** (an `<em>` tag leaking into `<title>` is a real, self-inflicted ranking penalty — see the blog doc).
- `rel=canonical` everywhere to neutralize mirror domains.
- Submit the sitemap to Google Search Console; keep Lighthouse SEO/Performance ≥ 95, LCP < 2.5s, CLS < 0.1.

If you're on Astro this is mostly free out of the box. Get it right once and forget it.

## GEO, in depth (the part worth your time)

Everything that makes a page *quotable* rather than merely *rankable*:

- **RAG-shaped content** — short, self-contained chunks that answer one question each, so a retriever can pull a clean slice without surrounding context.
- **BLUF under every `H2`** — 50–80 字 conclusion first, elaboration after.
- **Question-shaped headings** — `### Why does wtcraft use git worktrees?` matches how people actually phrase prompts; academic headings ("引子:从一次源码泄露说起") don't.
- **Tables and FAQs** — the two formats models reach for when answering "compare X vs Y" or "how do I…".
- **Authority signals** — exact numbers, benchmarks, and outbound links to canonical specs (Git docs, Apple Technical Notes). Models prefer sources that look sourced.
- **Structured data** — JSON-LD so identity and relationships are explicit, not inferred.

---

The three docs below apply all of this to a specific surface, because the details genuinely differ:

- **开源包 (NPM / PyPI / GitHub) marketing** — turning registry domain authority into citations.
- **个人 GitHub Pages + Astro 博客 marketing** — the bilingual-blog playbook, plus the technical SEO gotchas specific to Astro.
- **两种 legacy 架构商业站 marketing** — a forward plan for two common archetypes: a client-rendered product landing page and a legacy-WordPress B2B site.
