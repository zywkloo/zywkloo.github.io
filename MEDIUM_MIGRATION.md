# Migrating Medium Posts to Your Blog

## Easy Way to Copy Content from Medium

Yes! You can easily copy content from your Medium articles. Here's how:

### Method 1: Simple Copy-Paste (Quickest)

1. Open your Medium article: https://medium.com/@zywkloo/choosing-the-right-javascript-data-visualization-framework-insights-and-comparisons-6325b8d66969
2. Click the `...` menu (three dots) at the top right
3. Select "Print"
4. The page will show a clean, printable version
5. Copy the entire content (Cmd+A, Cmd+C on Mac)
6. Paste into a new Markdown file in `src/content/blog/`

### Method 2: Copy HTML and Convert

1. Right-click on the Medium article
2. Select "Inspect" or "View Page Source"
3. Find the `<article>` tag
4. Copy the HTML content
5. Use an HTML to Markdown converter (online tools available)
6. Save as `.md` file

### Method 3: Use Browser Extensions

Install a Markdown extension like:
- "Copy as Markdown" Chrome extension
- Select the article content and use the extension to convert

## Creating a New Blog Post

Create a new file in `src/content/blog/` with this format:

```markdown
---
title: 'Your Article Title'
description: 'A brief description of your article'
pubDate: 'Jan 01 2025'
heroImage: '../../assets/blog-placeholder-1.jpg'
tags: ['React', 'JavaScript', 'Frontend']
---

Your article content here...
```

## Example: Your JavaScript Visualization Article

For your "Choosing the Right JavaScript Data Visualization Framework" article:

1. Copy the content from Medium
2. Create `src/content/blog/javascript-data-visualization-frameworks.md`
3. Fill in the frontmatter
4. Paste the content below

### Tips:
- Keep the same images by downloading them and putting in `src/assets/`
- Update the `heroImage` path to use your downloaded image
- Add relevant tags for SEO
- Use proper markdown formatting

## Need Help?

The blog posts I created already show examples:
- `board-game-ai-development.md`
- `react-dev-tips.md`

Use them as templates for your new posts!
