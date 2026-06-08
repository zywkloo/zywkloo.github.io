---
title: "Rebuilding Two Legacy Commercial Sites for SEO & GEO (a Forward Plan)"
description: "Architecture and migration decision matrices for two common commercial-site archetypes — a client-rendered product landing page and a legacy-WordPress B2B site — covering framework choice, zero-risk migration, hosting TCO, and SEO/GEO."
pubDate: 2026-06-06
lang: "en"
tags: ["wtcraft", "SEO", "GEO", "Astro", "Next.js"]
---

> **Scope note / 说明**：这是一份**面向未来的规划**,不是已落地的案例。下面两个站点用**类型 + 架构**来指代(不点名具体公司或域名)——它们代表了两类很常见的重构标的,优化方案都还在 plan 阶段。

Commercial and marketing sites live under a double constraint now: they need steady organic traffic from classic search **and** they need to be shaped so AI answer engines can retrieve and quote them. I keep running into two recurring archetypes, and the right move for each is genuinely different. This doc lays out how I'd approach them — the value is in the decision matrices, not in any specific brand.

> **摘要**:两类标的——(A) 客户端渲染的产品落地页,(B) 跑在老 WordPress 上、有 SEO 历史资产的 B2B 站。结论先行:A 用 Astro 重写,B 用 Next.js Rewrites 渐进迁移。下面是各维度对比矩阵。

---

## The two archetypes

**Archetype A — the consumer product landing page.** A marketing site for a connected-hardware / IoT product, currently a client-rendered React SPA (Create React App). Its problems are structural: the raw HTML is an empty shell (`<div id="root">` and nothing else), so content only appears after the browser executes a heavy JS bundle. Crawlers and AI bots frequently grab the empty shell, and real users wait through a slow first paint (FCP).

**Archetype B — the legacy B2B site.** A business site in a fairly regulated vertical, running on WordPress with years of accumulated blog content and high-authority SEO history, currently getting a visual redesign. Its problems are the opposite: throwing WordPress away would torch the domain equity built up over years and force non-technical editors onto an unfamiliar CMS, while the legacy host is slow and has no global edge.

Same goal (rank + get cited), almost opposite starting points — which is why they need different plans.

## Archetype A: framework choice for the landing page

To fix the CSR performance and indexing problems, the real choice is React CSR vs Astro vs Next.js:

| Dimension | **React CSR (current)** | **Astro (recommended)** | **Next.js (alternative)** |
| :--- | :--- | :--- | :--- |
| First paint (FCP/LCP) | ❌ Slow (waits on core JS) | 🚀 **Fastest** (pure static HTML, zero JS) | ⚡ Fast (SSR'd, but ships the React runtime) |
| SEO friendliness | ❌ Poor (crawler must run JS) | 🚀 **Perfect** (full HTML up front) | 🚀 **Perfect** (full HTML up front) |
| GEO (AI engine) friendliness | ❌ Awful (bots get the shell) | 🚀 **Excellent** (clean structured HTML to slice) | 🚀 **Excellent** (clean structured HTML to slice) |
| Client JS size | ❌ Large (whole React runtime) | 🚀 **~0 KB** (JS only on interactive islands) | ⚠️ Large (React + Next runtime) |
| Hosting (commercial use) | 🚀 $0/mo (free static tiers) | 🚀 **$0/mo** (free static tiers) | ⚠️ $20/mo per seat (Vercel commercial terms) |
| Dev complexity | Lowest | ⚠️ Medium (islands model) | ⚠️ Medium (Server Components) |

**Verdict:** Astro. A marketing landing page is content with a few interactive bits — exactly the islands sweet spot. You keep React components where you need them, ship almost no client JS, get top-tier SEO/GEO, and host for $0.

## Archetype B: migrating without burning SEO equity

For a high-authority WordPress site, the migration *strategy* matters more than the framework. Three options:

| Migration plan | **A: Next.js Rewrites (reverse proxy)** | **B: Big-bang rewrite** | **C: Subdomain split** |
| :--- | :--- | :--- | :--- |
| How it works | Point the apex domain at Vercel; Next.js silently forwards un-migrated paths to the old WP. | Abandon WP; rebuild every post and the admin on a new system. | New site on the apex; old WP moves to `blog.example.com`. |
| Historical SEO equity | 🚀 **100% kept** (URLs unchanged) | ⚠️ High risk (mass 301s, dead-link penalties) | ❌ Diluted (subdomain splits authority) |
| Editor workflow | 🚀 **Untouched** (writers stay in WP) | ❌ Huge (relearn a new CMS) | 🚀 **Untouched** (still WP) |
| Visual consistency | ⚠️ Mixed during the staged swap | 🚀 **Perfect** (whole site, one design) | ❌ Poor (jarring jump to the blog subdomain) |
| Time to first launch | 🚀 **Very short** (ship the new home/about first) | ❌ Very long (everything before anything) | 🚀 Short (new static site) |

**Verdict:** the Next.js Rewrites reverse proxy. It's a progressive upgrade — launch a redesigned homepage and key entry pages immediately while everything else transparently serves from the old WP — at near-zero migration cost and with the years of SEO equity fully protected. Nobody on the content team has to change how they work.

## Hosting & total cost of ownership (TCO)

For a commercial owner, the real questions are long-term cost and stability — not framework taste.

| Host / Dimension | **Vercel Pro** | **Cloudflare Pages / Netlify** | **DigitalOcean VPS** | **Shared host** |
| :--- | :--- | :--- | :--- | :--- |
| Est. monthly | ⚠️ $20/seat/mo | 🚀 **$0/mo** | 🚀 $5–12/mo | ⚠️ $10–30/mo |
| Commercial use | ❌ Pro required (Hobby forbids it) | 🚀 **Unrestricted** | 🚀 Unrestricted | 🚀 Unrestricted |
| DevOps cost | 🚀 $0/yr (fully managed) | 🚀 $0/yr (fully managed) | ❌ High (Nginx/SSL/patching/DDoS) | ⚠️ Low but slow support |
| Global latency (TTFB) | 🚀 Very low (edge) | 🚀 Very low (CDN edge) | ⚠️ Depends on region | ❌ High (no edge) |
| Deploy speed | 🚀 ~1 min on push | 🚀 ~1 min on push | ❌ Slow (DIY CI) | ❌ Slowest (manual FTP) |

> **老板的账本 (the owner's math)**：
> - **Static landing page (Archetype A):** Astro compiled to static files on **Cloudflare Pages** — fully legal for commercial use, free, globally fast. Monthly TCO **$0**.
> - **Hybrid site (Archetype B):** Next.js Rewrites needs a dynamic Node runtime, so **Vercel Pro ($20/mo)** is the honest answer. Don't "save" $20 by self-hosting a $6 VPS — the hours you'd sink into Nginx, Let's Encrypt renewals, and downtime cost far more than the difference. A developer's hourly rate dwarfs the Pro delta.

## Next.js vs TanStack Start

If you do go full-stack (Archetype B), the choice is clear-cut for marketing/content:

| Dimension | **Next.js (App Router / SSG)** | **TanStack Start** |
| :--- | :--- | :--- |
| Best for | **Marketing sites, content, portals, SEO/GEO-sensitive pages** | Complex dashboards, SaaS consoles, heavy interactive apps |
| Image/media | 🚀 Built-in (`next/image`: crop, WebP, lazy-load) | ❌ Roll your own |
| Static generation | 🚀 Mature (SSG / ISR) | ⚠️ Weaker (SSR-focused) |
| Third-party ecosystem | 🚀 Huge (analytics, chat, consent all ship Next-first) | ⚠️ Smaller, catching up |
| Type safety | ⚠️ Medium (typedRoutes) | 🚀 End-to-end (router/params/data) |

For a content-and-SEO site, Next.js's image pipeline, mature SSG/ISR, and plugin ecosystem win easily. TanStack Start is the better tool for app-shaped products, not marketing pages.

## Landing the SEO & GEO (both archetypes)

Whatever the framework, the rebuild only pays off if it brings traffic. At the content layer:

**SEO foundation.** Never ship CSR to a crawler — pre-render (SSG) or revalidate (ISR) so the HTML is already full of text on first request. Every page emits its own `<title>`, `<meta name="description">`, and canonical URL.

**GEO extraction.** Answer engines slice pages via RAG, so when describing a product or spec:

- **BLUF first** — a ≤60-word bold paragraph at the top of each section that plainly answers "what is this / what's it for." Models lift it directly.
- **Tabulate the data** — Markdown comparison tables for specs (parameters, battery, materials). Perplexity renders them straight into comparison answers, with a source link back.
- **Question-shaped `H3`s + FAQ** — phrase headings the way a buyer would ask a model, then answer immediately below.

> 验收同 [overview](/docs):上线一周后,在 Perplexity / ChatGPT Search 用买家口吻的问题测试,看产品页是否被引用、对比表是否被直接渲染、信息是否准确。
