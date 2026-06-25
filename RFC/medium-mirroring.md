---
title: Medium API Mirroring Architecture Proposal
date: 2026-06-25
updated: 2026-06-25
status: Draft
tags:
  - backend
  - tech-debt
  - seo
---

> Priority: Low

## 方案概述 (Overview)

为了最大化博客内容的曝光度，同时不影响自有域名的 SEO 权重，我们计划利用 Medium 官方提供的免费 API，实现将 `src/content/blog/` 下的 Markdown 文章自动镜像同步（Mirror）到 Medium 平台。

## 核心设计 (Core Design)

### 1. SEO 保护 (Canonical URL)
最核心的设计是不造成内容重复（Duplicate Content）惩罚。
Medium API 允许在发布时提供 `canonicalUrl`。通过指向我们独立站的原始文章链接，搜索引擎会将 Medium 视为内容的“复印件”，而将 SEO 权重（SEO Juice）全部归属于我们的原生域名。

### 2. 格式与内容兼容
- Medium API 原生支持 `contentFormat: "markdown"`。
- 我们不需要将 Astro 构建好的 HTML 进行复杂的转换，直接提取本地的 Markdown 源文件内容发送即可。

### 3. 发布状态控制 (Publish Status)
初始阶段，建议将脚本的默认推送状态（`publishStatus`）设为 `draft`（草稿）。
- 这样脚本执行后，我们可以登录 Medium 手动校验排版、检查图片加载是否正常。
- 等运行稳定后，可以考虑改成 `public` 全自动发布。

### 4. 幂等性与防重复提交 (Idempotency)
如果多次触发 CI，脚本需要知道哪些文章已经同步过了，以避免同一篇文章发布出多个副本。
**建议机制**：
- 每次文章推送到 Medium 后，Medium API 会返回新文章的 `url` 或 `id`。
- CI 脚本获取该结果后，将 `mediumUrl: "..."` 自动回写到本地 markdown 文件的 YAML Frontmatter 中。
- 以后每次运行脚本时，先检查文章 Frontmatter。如果已经存在 `mediumUrl`，则跳过不处理（或调用更新接口，如果 Medium API 支持）。

## 实施成本与计划 (Implementation Plan)

- **API 认证**：免费。开发者仅需登录 Medium 的 Settings 页面生成一个 Personal Integration Token。
- **开发工作量**：低（预估 0.5 ~ 1 个工作日）。
- **组件依赖**：只需在现有的 GitHub Actions 工作流中加入一个新的 Node.js 执行步骤，读取并解析现有的 Markdown 文件即可。

## 下一步 (Next Steps)
- [ ] 在 Medium 账号中生成 Integration Token。
- [ ] 编写简单的 Node.js 测试脚本，选取一篇现有文章推送到 Medium 的草稿箱验证排版格式。
- [ ] 将脚本集成至 GitHub Actions 并在仓库设置中配置 `MEDIUM_API_TOKEN` secret。
