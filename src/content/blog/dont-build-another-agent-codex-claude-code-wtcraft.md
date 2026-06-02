---
title: 'TokenChef (Part 4): 别再造 Agent 了：研究 Codex 和 Claude Code 后，我更确定 wtcraft 该做什么'
series: 'TokenChef'
description: 'Codex 像 runtime，Claude Code 像 workflow。研究它们之后，我更确定 wtcraft 不该再造一个 Agent，而应该做 git-native handoff layer。'
pubDate: 'Jun 02 2026'
tags: ['AI Tools', 'Agent Architecture', 'Codex', 'Claude Code', 'wtcraft', 'Git Worktrees', 'Harness Engineering']
---

<div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px;">
  <a href="https://www.npmjs.com/package/wtcraft"><img src="https://img.shields.io/npm/v/wtcraft.svg?style=flat-square&logo=npm&color=cb3837" alt="npm package" /></a>
  <a href="https://pypi.org/project/wtcraft/"><img src="https://img.shields.io/pypi/v/wtcraft.svg?style=flat-square&logo=pypi&color=3775a9" alt="PyPI version" /></a>
  <a href="https://github.com/zywkloo/wtcraft/actions/workflows/ci.yml"><img src="https://github.com/zywkloo/wtcraft/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/zywkloo/wtcraft/releases"><img src="https://img.shields.io/github/v/release/zywkloo/wtcraft?style=flat-square&logo=github&color=24292e" alt="GitHub release" /></a>
  <a href="https://github.com/zywkloo/wtcraft/blob/main/LICENSE"><img src="https://img.shields.io/github/license/zywkloo/wtcraft?style=flat-square&color=blue" alt="License" /></a>
</div>

# 别再造 Agent 了：研究 Codex 和 Claude Code 后，我更确定 wtcraft 该做什么

<blockquote style="background-color: rgba(36, 41, 46, 0.05); border-left: 4px solid #cb3837; padding: 12px 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
  <strong>👨‍🍳 Series: TokenChef (Git-Native Multi-Agent Coding)</strong>
  <ul style="margin-top: 8px; margin-bottom: 0; padding-left: 20px;">
    <li><strong>Part 1</strong>: <a href="/blog/worktree-refactor-playbook/">Vibe Coding with Git Worktrees</a></li>
    <li><strong>Part 2</strong>: <a href="/blog/chief-token-orchestrator-manage-layered-agent-team/">Chief Token Orchestrator</a></li>
    <li><strong>Part 3</strong>: <a href="/blog/wtcraft-lightweight-git-native-multi-agent-scaffolding/">wtcraft: Git-Native Scaffolding</a></li>
    <li>👉 <strong>Part 4: 别再造 Agent 了 (Current)</strong></li>
  </ul>
</blockquote>

## 这次研究的几个项目

- **wtcraft**：<https://github.com/zywkloo/wtcraft>
- **OpenAI Codex**：<https://github.com/openai/codex>
- **Anthropic Claude Code**：<https://github.com/anthropics/claude-code>
- **Claude Code Best**：<https://github.com/claude-code-best/claude-code>

这是 TokenChef 系列的第四篇。

前三篇里，我一直在围绕一个问题转：**一个 solo developer，怎样用有限预算，把 Claude、Codex、Gemini 这些不同 agent 当成一个结构化小团队来用？**

`wtcraft` 的答案很朴素：不要先发明一个更聪明的 agent，也不要先搞一个宏大的 hosted control plane。先用 `git worktree`、任务契约、Scope / Off-limits、Verification，把 agent 的工作边界做清楚。

最近我重新研究了几个项目：

- OpenAI 的 `openai/codex`
- Anthropic 的官方 `anthropics/claude-code`
- 第三方复原/增强项目 `claude-code-best/claude-code`
- 以及教学型项目 `shareAI-lab/learn-claude-code`

看完以后，我对 `wtcraft` 的定位反而更清晰了：

> `wtcraft` 不应该变成 Codex，也不应该变成 Claude Code。  
> 它应该成为这些 coding agent 之上的 git-native handoff layer。

换句话说，Codex 和 Claude Code 负责“做事”，`wtcraft` 负责“分工、隔离、记录、验证、交接”。

---

## 1. 先说结论：Codex 是 runtime，Claude Code 是 workflow

如果只从用户体验看，Codex 和 Claude Code 都像是：

```text
你在终端里说一句话
Agent 读代码
Agent 改文件
Agent 跑命令
Agent 总结结果
```

但从工程角度看，它们的重心不太一样。

### Codex：runtime-first

`openai/codex` 给人的感觉是一个可研究、可观测、协议化的 agent runtime。

它强调：

- headless execution
- JSONL event stream
- session / thread / turn
- sandbox / approval
- tool execution lifecycle
- TUI / CLI / app-server protocol
- model turn 和工具调用之间的状态机

Codex 很像一个“可以被其他系统调用的 coding worker”。尤其是 `codex exec --json` 这种能力，非常适合被外部 orchestrator 包起来。

对于 `wtcraft` 来说，这一点很关键。

因为 `wtcraft` 真正需要的不是又一个聊天界面，而是一个可以稳定调用的 executor：

```bash
codex exec --json --output-last-message last.md "follow .worktree-task.md and implement the task"
```

然后 `wtcraft` 可以解析 JSONL，得到：

- 这个 agent 什么时候开始
- 执行了哪些 shell 命令
- 调用了哪些工具
- 修改了哪些文件
- token usage 多少
- 最终回答是什么
- 是否失败
- 失败在哪里

这就从“我相信 agent 说它做完了”，变成了“我有一份可审计的执行账本”。

### Claude Code：workflow-first

`anthropics/claude-code` 官方仓库公开出来的重点则不一样。

官方 README 强调 Claude Code 是一个 lives in your terminal 的 agentic coding tool，可以理解代码库、执行 routine tasks、解释复杂代码、处理 git workflows，并通过 terminal、IDE 或 GitHub 使用。

这个仓库目前更多呈现的是：

- 安装入口
- 插件目录
- commands
- agents
- hooks
- bug report / feedback
- 数据收集与隐私说明

也就是说，官方仓库不像 Codex 那样把完整 runtime 源码全部摊开给你读。它更像一个产品入口和插件生态入口。

Claude Code 的工程味道更接近：

```text
Developer intent
→ Project instructions
→ Commands / hooks / plugins / agents
→ Human-in-the-loop coding workflow
```

它的强项是把 agent 融入开发者的日常工作流，而不是把 runtime 设计成一个特别容易被第三方 orchestrator 消费的 JSONL worker。

这不是优劣问题，是产品重心不同。

---

## 2. Claude Code Best 为什么值得看，但不能盲用

`claude-code-best/claude-code` 是一个第三方项目。它的 README 说得很直白：这是对官方 Claude Code 的“完整复原的工程化项目”，包名是 `claude-code-best`，命令是 `ccb`。

它有很多非常激进、非常有研究价值的能力：

- 多模型供应商
- Pipe IPC 多实例协作
- LAN 跨机器通讯
- ACP 协议支持
- Remote Control
- Langfuse agent loop 监控
- Web Search
- Channels
- Voice Mode
- Computer Use
- Chrome Use
- Sentry / GrowthBook

从研究角度看，它很有意思，因为它把很多“官方产品里看不到源码的东西”以一种工程化方式重新摊开了。

但从安全角度看，也要冷静。

它不是 Anthropic 官方仓库，而且它涉及：

- postinstall scripts
- Chrome bridge
- remote control
- browser automation
- telemetry / monitoring
- 多 provider credentials

这些能力本身不代表恶意，但意味着攻击面很大。

所以我会这样使用它：

- **适合研究**：看 agent loop、IPC、多实例协作、monitoring、remote control 的工程思路。
- **适合玩具项目**：在隔离环境里试功能。
- **不适合直接接入敏感公司 repo / 主浏览器 cookie / 长期 API key**。

对 `wtcraft` 来说，Claude Code Best 最有价值的不是“照抄功能”，而是提醒我们一件事：

> 真正的 multi-agent 难点不是让 agent 多起来，而是让 agent 之间的边界、状态、权限、日志、结果变得可管理。

这正好回到了 `wtcraft` 的核心。

---

## 3. Agent loop：不要复制大脑，要控制循环边界

研究 Codex 和 Claude Code 以后，很容易产生一个诱惑：我们是不是也应该在 `wtcraft` 里实现自己的 agent loop？

我的答案是：**不要。至少现在不要。**

一个典型 agent loop 是：

```text
User prompt
→ Model response
→ Tool use
→ Tool result
→ Model continuation
→ Final answer
```

Codex 已经在这里做了很多复杂工程：

- streaming model response
- tool router
- parallel tool calls
- sandboxed command execution
- approval handling
- diff tracking
- context compaction
- token limit handling
- pending input drain
- turn lifecycle events
- hooks

Claude Code 也有自己的工具调用、hooks、commands、agents、skills 等体系。

`wtcraft` 如果试图重写这个 loop，就会从一个轻量 harness 变成一个 runtime 竞争者。那不是它的强项。

`wtcraft` 应该控制的是更外层的 loop：

```text
Plan
→ Create worktree
→ Write task contract
→ Invoke agent
→ Capture run ledger
→ Check scope
→ Verify commands
→ Review / replan / finish
```

这叫“agent supervision loop”，不是“model tool loop”。

这两层必须分清：

| 层级 | 谁负责 | 关注点 |
|---|---|---|
| Model tool loop | Codex / Claude Code | 如何读上下文、调工具、改代码 |
| Supervision loop | wtcraft | 谁做哪个任务、能改哪些文件、是否通过验证、如何交接 |

这也是我现在越来越相信的设计原则：

> `wtcraft` 不应该追求 agentic autonomy，而应该追求 bounded automation。

自动化可以很强，但边界必须很窄。

---

## 4. Headless：Codex 给 wtcraft 的最大启发

如果只选一个 Codex 给 `wtcraft` 的启发，我会选 headless + JSONL。

`codex exec` 这类 headless 命令天生适合被 shell、CI、orchestrator 调用。

一个 `wtcraft` 未来可以支持的调用方式可能是：

```bash
wtcraft run feat/auth-refactor --engine codex
```

内部做的事大概是：

```bash
codex exec \
  --json \
  --sandbox workspace-write \
  --output-last-message .wtcraft/runs/<run-id>/last-message.md \
  "Read .worktree-task.md and implement only the Scope."
```

然后 `wtcraft` 保存：

```text
.wtcraft/runs/<run-id>/
  events.jsonl
  last-message.md
  usage.json
  changed-files.txt
  verification.json
  summary.md
```

这件事非常重要。

因为 multi-agent 最大的问题不是“agent 不够聪明”，而是：

- 它到底做了什么？
- 它有没有越界？
- 它改了哪些文件？
- 它有没有跑验证？
- 它失败时失败在哪里？
- 下一个 agent 能不能接上？

没有 run ledger，多 agent 就会退化成一堆聊天窗口。

有了 run ledger，多 agent 才可能变成一个工程系统。

---

## 5. Claude Code 给 wtcraft 的启发：别低估 hooks 和 project instructions

Claude Code 官方生态虽然没有完整开源 runtime，但它给 `wtcraft` 的启发同样重要。

它证明了一个事实：

> 开发者真正长期依赖的不是一个“超级 prompt”，而是一套能被项目记住的 workflow affordances。

也就是：

- `CLAUDE.md`
- commands
- hooks
- plugins
- specialized agents
- project-level conventions
- repeatable workflows

`wtcraft` 现在已经有类似方向：

- `.agent-harness/planner.md`
- `.agent-harness/executor.md`
- `.agent-harness/finisher.md`
- `.worktree-task.md`
- `wtcraft check`
- `wtcraft verify`
- optional routing stubs in `CLAUDE.md` / `AGENTS.md`

这其实是非常 Claude-Code-ish 的：把工作流变成项目的一部分，而不是每次靠人重新解释。

但 `wtcraft` 要比 Claude Code 更中立。

Claude Code 的 project instructions 主要服务 Claude Code。

`wtcraft` 的 contract 应该服务任何 agent：

- Claude Code 可以读
- Codex 可以读
- Gemini CLI 可以读
- 人类开发者也可以读
- CI 也可以解析

这就是为什么 `.worktree-task.md` 这种格式很关键。

它既是人类文档，又是机器契约。

---

## 6. Worktree isolation：wtcraft 的护城河

Codex 和 Claude Code 都能在一个 repo 里工作，但它们默认不是一个“跨任务 worktree orchestrator”。

而 `wtcraft` 的核心假设是：

> agent 的隔离边界不应该只靠 prompt，应该落到 git worktree。

Prompt 里的 “please only edit these files” 很有用，但不够。

真正稳的边界应该是：

```text
任务 A → worktree A → Scope A → verify A
任务 B → worktree B → Scope B → verify B
任务 C → worktree C → Scope C → verify C
```

这带来几个好处：

1. **上下文隔离**
   每个 agent 看到的是自己的任务契约。

2. **文件冲突可见**
   shared files 需要串行，file-disjoint tasks 可以并行。

3. **回滚便宜**
   一个 worktree 搞坏了，不会污染主工作区。

4. **handoff 明确**
   下一个 agent 不需要读完整聊天历史，只要读任务文件、diff、run ledger。

5. **验证可自动化**
   `wtcraft check` 和 `wtcraft verify` 可以独立于 agent 执行。

这也是 `wtcraft` 和一般 agent CLI 最大的不同：

> Agent CLI 关心“如何完成一次 coding turn”。  
> `wtcraft` 关心“如何组织多个 coding turns 形成可合并的工程工作流”。

---

## 7. 对比总结：三个项目分别教了我什么

### OpenAI Codex 教我的

Codex 最值得学习的是工程可观测性。

它提醒我：

- headless 很重要
- JSONL 很重要
- event lifecycle 很重要
- final message 不够，执行轨迹才重要
- token usage 要被记录
- tool call / command / file change 要有结构化状态

对 `wtcraft` 来说，这指向一个功能：

```bash
wtcraft run --engine codex --json
```

### Anthropic Claude Code 教我的

Claude Code 最值得学习的是 workflow ergonomics。

它提醒我：

- commands 很重要
- hooks 很重要
- project instructions 很重要
- agent 要融入人的开发节奏
- 不要让用户每次从零解释团队约定

对 `wtcraft` 来说，这指向：

```text
.agent-harness/
.worktree-task.md
CLAUDE.md / AGENTS.md routing stubs
```

### Claude Code Best 教我的

Claude Code Best 最值得学习的是“增强层”的想象力。

它提醒我：

- 多实例协作需要 IPC
- agent loop 需要 tracing
- remote control 有价值但风险也大
- provider-neutral 会打开很多可能
- 高级功能必须配安全边界

对 `wtcraft` 来说，这指向：

```text
run ledger
provider-neutral engine adapter
explicit permissions
local-first by default
```

---

## 8. wtcraft 下一步应该怎么走

研究这些项目后，我认为 `wtcraft` 的路线应该更坚定地保持轻量。

不是做：

```text
另一个 Codex
另一个 Claude Code
另一个全能 agent runtime
```

而是做：

```text
一个 git-native, agent-neutral, budget-aware handoff harness
```

优先级可以这样排。

### 第一优先级：Run Ledger

每次 agent 执行都应该留下结构化痕迹：

```text
.wtcraft/runs/<run-id>/
  meta.json
  prompt.md
  events.jsonl
  last-message.md
  changed-files.txt
  check.txt
  verify.txt
  summary.md
```

这会让 agent 工作从“聊天记录”变成“工程记录”。

### 第二优先级：Engine Adapter

不要把 `wtcraft` 绑死在某一个 agent CLI 上。

可以先支持：

```bash
wtcraft run <worktree> --engine codex
```

然后逐步扩展：

```bash
wtcraft run <worktree> --engine claude
wtcraft run <worktree> --engine gemini
```

Adapter 层只负责：

- 如何启动 agent
- 如何传 prompt
- 如何收集输出
- 如何落 run artifact

真正的边界仍然由 `.worktree-task.md`、`check`、`verify` 控制。

### 第三优先级：Contract Schema

`.worktree-task.md` 需要继续保持人类可读，但也应该逐步机器可读。

比如明确：

```yaml
status: ready
agent: codex
priority: medium
scope:
  - src/auth/**
off_limits:
  - package.json
verification:
  - npm test
```

这会让 Planner、Executor、Verifier、Finisher 之间的 handoff 更稳。

### 第四优先级：Verifier as a first-class role

现在 agent 最大的风险不是不会写代码，而是会自信地说“完成了”。

所以 Verifier 不能只是一个人肉步骤。

`wtcraft` 应该让下面这些动作变得自然：

```bash
wtcraft check <worktree>
wtcraft verify <worktree>
wtcraft review <worktree>
```

其中 `review` 可以未来接 Codex review、Claude review，甚至两个 agent 交叉 review。

但无论用谁 review，最终都必须回到：

- diff
- Scope
- Off-limits
- tests
- exit code

---

## 9. 最后的设计原则：让 agent 像承包商，不像室友

我现在越来越喜欢这个比喻：

> 不要让 agent 像室友一样住进你的主工作区；  
> 让 agent 像承包商一样，在明确工地、明确合同、明确验收标准下干活。

Codex 很适合做一个可观测的承包商。

Claude Code 很适合做一个懂你项目习惯的结对伙伴。

Claude Code Best 展示了如果把这个伙伴扩展到多 provider、多实例、多通道，会发生什么。

而 `wtcraft` 应该做的是项目经理：

- 分任务
- 开 worktree
- 写合同
- 查越界
- 跑验收
- 记录账本
- 合并结果

这也是 TokenChef 系列一直在追的方向：

> 不是买一个最贵的超级 agent，  
> 而是用便宜、专长不同、可替换的 agent，组织成一个可控的小团队。

Codex 和 Claude Code 的架构差异，最后给 `wtcraft` 的启发很简单：

```text
Codex teaches observability.
Claude Code teaches workflow.
wtcraft should provide boundaries.
```

Agent 会越来越强。

但越强的 agent，越需要清楚的边界。

这正是 `wtcraft` 要做的事。

---

## References

- wtcraft：<https://github.com/zywkloo/wtcraft>
- OpenAI Codex：<https://github.com/openai/codex>
- Anthropic Claude Code：<https://github.com/anthropics/claude-code>
- Claude Code Best：<https://github.com/claude-code-best/claude-code>
- Learn Claude Code：<https://github.com/shareAI-lab/learn-claude-code>
- TokenChef Part 3：<https://zywkloo.github.io/blog/wtcraft-lightweight-git-native-multi-agent-scaffolding/>
