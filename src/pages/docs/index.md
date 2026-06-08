---
layout: ../../layouts/BlogPost.astro
title: "个人网站 SEO + GEO 优化指南"
description: "面向个人 Astro 博客及 Portfolio 网站的传统搜索引擎优化 (SEO) 与生成式 AI 引擎优化 (GEO) 的实战方案。"
pubDate: 2026-06-08
---

本指南针对基于 **Astro** 构建的个人 Portfolio/Blog 网站（如 `zywkloo.github.io`），详细阐述如何进行传统搜索引擎优化（SEO）和新兴 AI 搜索引擎优化（GEO - Generative Engine Optimization）。

---

## 一、 SEO (搜索引擎优化) 优化实战

Astro 默认的静态输出（SSG）和零 JS 架构对传统 SEO 已经非常友好。为了最大化效果，我们需要落实以下技术优化：

### 1. 自动生成与提交 Sitemap
Astro 配置文件中已经启用了 `@astrojs/sitemap` 插件：
```javascript
// astro.config.mjs
export default defineConfig({
    site: 'https://zywkloo.github.io',
    integrations: [mdx(), sitemap()],
});
```
在执行 `npm run build` 后，系统会在根目录生成 `sitemap-index.xml` 和 `sitemap-0.xml`。
* **实操建议**：必须登录 **Google Search Console**，将 `https://zywkloo.github.io/sitemap-index.xml` 提交给 Google 进行主动抓取。

### 2. 补全 `BaseHead` 元数据 (Metadata)
目前网站使用 `src/components/BaseHead.astro` 组件来渲染 HTML 头部信息。我们需要在每一个页面（如 `index.astro`, `about.astro`, `blog/*.astro`）中传入正确的 `title` 和 `description`。
* **检查规范**：
  * **标题长度**：保持在 50~60 字符之间。
  * **描述长度**：保持在 120~150 字符之间，包含核心关键词（如 `Mobile Engineer`, `iOS`, `React Native`, `FastAPI`）。
  * **规范链接 (Canonical URL)**：`BaseHead.astro` 已自动处理 `<link rel="canonical" href={canonicalURL} />`，有效防止了 github.io 的镜像站产生内容重复惩罚。

### 3. 字体与媒体优化
* **字体预加载**：`BaseHead.astro` 已经预加载了 Atkinson 字体：
  ```html
  <link rel="preload" href="/fonts/atkinson-regular.woff" as="font" type="font/woff" crossorigin />
  ```
  这能有效防止文字闪烁并提升 Core Web Vitals 中的 **LCP (最大内容渲染)** 速度。
* **图片压缩**：在 `about.astro` 或博客文章中引入图片时，优先使用 Astro 内置的 `<Image />` 组件，它会自动把 JPG/PNG 压缩为现代化的 WebP/AVIF 格式。

---

## 二、 GEO (生成式 AI 引擎优化) 优化实战

GEO 是优化网站内容，使其更容易被 AI 搜索引擎（如 ChatGPT Search, Perplexity, Google AI Overviews）抓取、理解并在生成回答时作为**源链接（Citation）**进行推荐。

AI 搜索引擎的推荐依赖于 **RAG (检索增强生成)** 流程，以下是具体优化动作：

### 1. 允许 AI 爬虫抓取 (robots.txt)
很多开发者会屏蔽所有 AI 爬虫，但为了提高个人项目（如 `wtcraft`）在 AI 搜索中的曝光率，我们**应当允许** AI 搜索引擎的爬虫访问。
* **操作**：在 `public/` 目录下创建 `robots.txt`，添加如下配置：
  ```text
  User-agent: *
  Allow: /
  
  # 允许主流 AI 搜索爬虫
  User-agent: OAI-SearchBot
  Disallow:
  
  User-agent: GPTBot
  Disallow:
  
  User-agent: Claude-Web
  Disallow:
  
  User-agent: Google-Extended
  Disallow:
  
  Sitemap: https://zywkloo.github.io/sitemap-index.xml
  ```

### 2. 部署 Person/ProfilePage JSON-LD 结构化数据
AI 模型非常擅长解析结构化的 JSON-LD 格式。在个人网站中部署 Schema 数据，可以帮助 AI 瞬间建立起 **“Victor Zhang 是一名 Mobile/Systems 工程师，做过 wtcraft 开源项目，毕业于 UBC 和北大”** 的知识图谱关系。
* **实操**：在 `src/pages/about.astro` 的 `<head>` 区域注入如下 JSON-LD：
  ```html
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": "Victor Zhang",
      "alternateName": "zywkloo",
      "jobTitle": "Mobile & Systems Engineer",
      "alumniOf": [
        {
          "@type": "EducationalOrganization",
          "name": "University of British Columbia"
        },
        {
          "@type": "EducationalOrganization",
          "name": "Peking University"
        }
      ],
      "knowsAbout": ["iOS Development", "Swift", "React Native", "FastAPI", "Agentic Workflows"],
      "sameAs": [
        "https://github.com/zywkloo",
        "https://zywkloo.github.io"
      ]
    }
  }
  </script>
  ```

### 3. 内容结构重构：迎合 AI 提取习惯
大模型（LLM）提取网页信息有特定的“偏好”。在写博客或介绍项目（如 `wtcraft`）时，遵循以下排版：

* **BLUF 结构（Bottom Line Up Front，结论先行）**：
  在文章开头的 H2 标题下方，用 50~80 字总结项目或技术点。
  * *示例*：“`wtcraft` 是一个面向独立开发者、基于 Git Worktree 的轻量级多 Agent 协作开发脚手架，旨在解决自动化编写代码时的工作区污染与 handoff 上下文丢失问题。”
* **使用对比表格与 FAQ 问答**：
  * 用 H3 标题写出自然语言的问题（如：`### 为什么选择 Git Worktree 进行 AI 协同开发？`），并在正文中使用无序列表或对比表格展示核心指标，AI 极喜欢直接提取表格作为其答案卡片。
* **提供权威出处和数据支撑**：
  * 在技术探讨中，提供具体数字、开源跑分，并外链至官方规范文档（如 Apple Technical Notes 或 Git 官方文档）。AI 搜索偏爱带有权威链接和确切数据的源内容。

---

## 三、 实操清单

1. **新建 robots.txt**：在 `public/robots.txt` 写入上述配置，允许 AI 爬虫。
2. **加入 JSON-LD**：在 `src/pages/about.astro` 中注入 `Person` 结构化数据。
3. **内容重构**：将所有长文章（尤其是 `wtcraft` 和 `TokenChef` 相关的文章）的开头加上简短的摘要（BLUF），并在关键讨论点加上 FAQ 和表格。
