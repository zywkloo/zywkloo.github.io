# zywkloo.github.io

**Victor Zhang's personal blog and engineering portfolio.**

🌐 [zywkloo.github.io](https://zywkloo.github.io)

Built with [Astro](https://astro.build) and deployed via GitHub Pages.

---

## About

Writing on software engineering, multi-vendor agent workflows, and solo developer tooling.

Featured project: **[wtcraft](https://github.com/zywkloo/wtcraft)** — a git-native governance core for running multiple coding-agent CLIs together (Claude Code, Codex, Gemini) without them stepping on each other — on a budget. No daemon, no DB, just git.

## Recent Posts

- [wtcraft — Budget-Aware Multi-Vendor Agent Harness](https://zywkloo.github.io/blog/beyond-worktrees-budget-aware-multi-agent-coding-harness/)
- [Vibe Coding with Git Worktrees](https://zywkloo.github.io/blog/worktree-refactor-playbook/)

## Stack

| Layer | Choice |
| --- | --- |
| Framework | [Astro](https://astro.build) (static, content collections) |
| Content | Markdown + MDX in `src/content/blog/` |
| Deployment | GitHub Pages (push to `master` → auto deploy) |
| Analytics | Post view counts via custom endpoint |
| Fonts | Atkinson Hyperlegible |

## Project Structure

```text
src/
├── assets/          # Optimized images (Astro pipeline → WebP)
├── components/      # Header, Footer, BaseHead, PostViewCount …
├── content/
│   └── blog/        # .md blog posts (frontmatter: title, pubDate, heroImage, …)
├── layouts/
│   └── BlogPost.astro
├── pages/
│   ├── index.astro
│   └── blog/
│       ├── index.astro
│       └── [...slug].astro
└── styles/
    └── global.css
public/
├── fonts/
└── images/          # Static assets (icons, screenshots)
```

## Dev Commands

| Command | Action |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build to `./dist/` |
| `npm run preview` | Preview production build locally |

## License

Content © Victor Zhang. Code: MIT.
