---
title: "Marketing an Open-Source Package (NPM / PyPI / GitHub) for SEO & GEO"
description: "How to turn the domain authority of GitHub, NPM, and PyPI into backlinks and AI citations for your own site — registry metadata, a RAG-friendly README, and the backlink loop."
pubDate: 2026-06-08
lang: "en"
tags: ["wtcraft", "SEO", "GEO", "NPM", "PyPI"]
---

If you publish a package, you're sitting on three of the highest-authority domains on the web and probably wasting them. GitHub, NPM, and PyPI all get crawled constantly and trusted heavily — by Google *and* by the answer engines. The job is to make those pages point back at you, and to shape your README so an LLM quotes it. I'll use `wtcraft` as the running example.

> **摘要**:GitHub / NPM / PyPI 域名权重极高(DA 90+),且被 AI 搜索高频抓取。两件事:(1) 用包元数据 + README 回链把权重导回个人站;(2) 把 README 重构成 LLM 爱提炼的形状。

---

## Why registries are leverage

GitHub, NPM, and PyPI carry domain authority in the 90s and — more importantly for GEO — answer engines treat them as trusted, frequently-recrawled sources. When someone asks Perplexity "what's a good git-native multi-agent tool," it's far more likely to retrieve your NPM page or README than your three-week-old personal blog. So the registry page is both your fastest backlink *and* often the chunk that actually gets cited. Treat it as a primary surface, not an afterthought.

## SEO: close the backlink loop

The goal is to make every registry surface declare your site as home, so the equity flows to your domain instead of pooling on the registry.

**NPM — `package.json`:** set `homepage` to the *canonical article*, not just the repo, and fill in `keywords` with the phrases people actually search.

```json
{
  "name": "wtcraft",
  "homepage": "https://zywkloo.github.io/blog/dont-build-another-agent-codex-claude-code-wtcraft/",
  "repository": { "type": "git", "url": "git+https://github.com/zywkloo/wtcraft.git" },
  "keywords": ["claude-code", "agentic-workflow", "git-worktree", "openai-codex", "devtool"]
}
```

**PyPI — `pyproject.toml`:** same idea, via `[project.urls]`.

```toml
[project]
name = "wtcraft"
keywords = ["claude-code", "git-worktree", "agentic-workflow", "vibe-coding"]

[project.urls]
"Homepage" = "https://zywkloo.github.io/blog/dont-build-another-agent-codex-claude-code-wtcraft/"
"Bug Tracker" = "https://github.com/zywkloo/wtcraft/issues"
"Source Code" = "https://github.com/zywkloo/wtcraft"
```

**README footer backlink:** end the GitHub `README.md` with a deep link to the canonical write-up on your site. GitHub's authority is high; one honest link from it meaningfully accelerates how fast your own page gets discovered.

> **关键术语**:`homepage` / `[project.urls]` 指向**正文链接**(canonical article),不是只丢个 repo 地址 — 这样回链落点是有内容、能被引用的页面。

## GEO: rewrite the README for the model, not just the human

When an answer engine retrieves a package, the LLM summarizes the README. Most READMEs open with a badge wall and a vague tagline — useless for extraction. Three fixes:

- **BLUF in the first screen.** One or two sentences that *define* the tool concretely, before any install instructions or badges:
  > `wtcraft is a lightweight CLI that uses git worktrees to isolate multi-agent workspaces, preventing code conflicts and preserving task-handoff context.`

  That single line is what gets lifted into an answer. Make it precise and claim-free of marketing fluff.
- **A comparison matrix.** Models strongly prefer tables when answering "how is X different from Y." A short Markdown table contrasting your tool with the obvious alternatives is the thing Perplexity will render directly into its answer card.
- **An FAQ section.** End with question-shaped `H3`s — `### Why does wtcraft use git worktrees?` — that mirror how people phrase prompts. High-density, self-contained Q&A is exactly what the retriever wants to slice out.

## Verify it (验收)

After a few days, ask Perplexity "lightweight git-native tooling for multi-agent coding?" and check the Sources panel. Two passing signals: your README/site shows up as a citation, and the comparison table renders inside the answer. If the model describes the tool *wrong*, the README BLUF line is the first thing to tighten — see the [field-notes overview](/docs) for the full acceptance loop.
