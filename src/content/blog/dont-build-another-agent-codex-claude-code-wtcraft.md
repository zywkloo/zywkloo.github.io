---
title: 'TokenChef (Part 4): 别卷 Agent 了：先把边界、账本和验收做好'
series: 'TokenChef'
description: 'Claude Code 也有完整 agent loop。研究 Codex 和 Claude Code 后，我更确定 wtcraft 不该再造 runtime，而该把任务边界、运行记录和验证流程做好。'
pubDate: 'Jun 02 2026'
heroImage: '../../assets/agent-boundaries-hero.svg'
tags: ['AI Tools', 'Agent Architecture', 'Codex', 'Claude Code', 'wtcraft', 'Git Worktrees', 'Harness Engineering']
---

<div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px;">
  <a href="https://www.npmjs.com/package/wtcraft"><img src="https://img.shields.io/npm/v/wtcraft.svg?style=flat-square&logo=npm&color=cb3837" alt="npm package" /></a>
  <a href="https://pypi.org/project/wtcraft/"><img src="https://img.shields.io/pypi/v/wtcraft.svg?style=flat-square&logo=pypi&color=3775a9" alt="PyPI version" /></a>
  <a href="https://github.com/zywkloo/wtcraft/actions/workflows/ci.yml"><img src="https://github.com/zywkloo/wtcraft/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/zywkloo/wtcraft/releases"><img src="https://img.shields.io/github/v/release/zywkloo/wtcraft?style=flat-square&logo=github&color=24292e" alt="GitHub release" /></a>
  <a href="https://github.com/zywkloo/wtcraft/blob/main/LICENSE"><img src="https://img.shields.io/github/license/zywkloo/wtcraft?style=flat-square&color=blue" alt="License" /></a>
</div>

<blockquote style="background-color: rgba(36, 41, 46, 0.05); border-left: 4px solid #cb3837; padding: 12px 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
  <strong>👨‍🍳 Series: TokenChef (Git-Native Multi-Agent Coding)</strong>
  <ul style="margin-top: 8px; margin-bottom: 0; padding-left: 20px;">
    <li><strong>Part 1</strong>: <a href="/blog/worktree-refactor-playbook/">Vibe Coding with Git Worktrees</a></li>
    <li><strong>Part 2</strong>: <a href="/blog/chief-token-orchestrator-manage-layered-agent-team/">Chief Token Orchestrator</a></li>
    <li><strong>Part 3</strong>: <a href="/blog/wtcraft-lightweight-git-native-multi-agent-scaffolding/">wtcraft: Git-Native Scaffolding</a></li>
    <li>👉 <strong>Part 4: 别卷 Agent 了 (Current)</strong></li>
  </ul>
</blockquote>

## 这次研究的几个项目

- **wtcraft**：<https://github.com/zywkloo/wtcraft>
- **OpenAI Codex**：<https://github.com/openai/codex>
- **Anthropic Claude Code**：<https://github.com/anthropics/claude-code>
- **Claude Code Agent SDK docs**：<https://code.claude.com/docs/en/agent-sdk/agent-loop>
- **Claude Code Architecture / CCB docs**：<https://ccb.agent-aura.top/docs/introduction/what-is-claude-code>

这是 TokenChef 系列的第四篇。

先把一个关键事实放在前面：Claude Code 当然有 agent loop。

Anthropic 自己的 [Agent SDK 文档](https://code.claude.com/docs/en/agent-sdk/agent-loop) 说得很清楚：SDK 跑的是和 Claude Code 同源的 autonomous agent loop。这个 loop 会让 Claude 评估当前状态、调用工具、接收工具结果，然后重复直到任务结束；它还暴露了 `Read`、`Edit`、`Write`、`Glob`、`Grep`、`Bash`、Web、Agent、Skill、hooks、permissions、turn / budget limits、usage / cost、session、compaction 等能力。

[Anthropic 的 Claude Code 产品页](https://www.anthropic.com/product/claude-code) 也明确把它描述成 project-level agent：读代码库、规划跨文件动作、执行修改、跑测试、根据失败迭代。也就是说，Claude Code 当然有 agent loop，而且不只是“提示词 + 插件目录”。

另外，2026-03-31 左右的 Claude Code npm sourcemap 泄露事件，也让外界更容易从公开分析里看到它的工程形状。[InfoQ 的报道](https://www.infoq.com/news/2026/04/claude-code-source-leak/) 说，`@anthropic-ai/claude-code` 2.1.88 包含了不该发布的 source map；[Axios 的报道](https://www.axios.com/2026/03/31/anthropic-leaked-source-code-ai) 引述 Anthropic 称没有客户数据或凭据暴露。后续有研究者基于公开可得的 TypeScript 源码写了分析，例如 arXiv 上的 [Dive into Claude Code](https://arxiv.org/abs/2604.14228) 把核心概括为一个“model -> tools -> repeat”的简单 loop，但真正复杂的是 loop 周围的权限、上下文压缩、扩展机制、subagent、worktree 隔离和 session storage。

所以这篇不把 Claude Code 当成一个薄薄的 workflow shell，也不把 Codex 和 Claude Code 写成两个完全不同的物种。更合理的问题是：既然它们都已经能读代码、改文件、跑命令、根据失败继续迭代，那 `wtcraft` 还应该做什么？

我的答案很朴素：不再造一个 runtime，先把任务边界、工作区隔离、运行记录和验证流程做扎实。

前三篇里，我一直在围绕一个问题转：**一个 solo developer，怎样用有限预算，把 Claude、Codex、Gemini 这些不同 agent 当成一个结构化小团队来用？**

`wtcraft` 的答案很朴素：不要先发明一个更聪明的 agent，也不要先搞一个宏大的 hosted control plane。先用 `git worktree`、任务契约、Scope / Off-limits、Verification，把 agent 的工作边界做清楚。

最近我重新研究了几个项目：

- OpenAI 的 `openai/codex`
- Anthropic 的官方 `anthropics/claude-code`
- 非官方的 Claude Code 架构解读资料 `ccb.agent-aura.top`
- 以及教学型项目 `shareAI-lab/learn-claude-code`

看完以后，我对 `wtcraft` 的定位反而更清晰了：

> `wtcraft` 不应该变成 Codex，也不应该变成 Claude Code。  
> 它应该把这些 coding agent 的分工、隔离、记录、验证做扎实。

换句话说，Codex 和 Claude Code 负责“做事”，`wtcraft` 负责把任务现场收拾清楚：谁做哪块、能改哪里、跑了什么、怎么验收、怎么交给下一个人或 agent。

---

## 1. 先说结论：它们的内核其实很像

如果只从用户体验看，Codex 和 Claude Code 都像是：

```text
你在终端里说一句话
Agent 读代码
Agent 改文件
Agent 跑命令
Agent 总结结果
```

从工程角度看，它们也共享同一种现代 coding agent 的基本形状：

```text
Prompt / project context
→ Model decision
→ Tool call
→ Tool result
→ Next decision
→ Final result
```

公开资料已经足够说明，Claude Code 并不是一个薄薄的 workflow wrapper。它有工具执行、权限门、hooks、budget / max turn、上下文压缩、session continuity、subagent、skills、plugins、MCP 等一整套 agent runtime 机制。

那它和 Codex 还要不要比较？要。但比较点应该更准确。

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

### Claude Code：agent runtime + workflow product

`anthropics/claude-code` 官方仓库公开出来的重点确实和 `openai/codex` 不一样，但这不等于 Claude Code 没有 runtime。

官方产品文案强调 Claude Code 是一个 lives in your terminal 的 agentic coding system，可以理解代码库、执行 routine tasks、解释复杂代码、处理 git workflows，并通过 terminal、IDE 或 GitHub 使用。

官方仓库目前更多呈现的是：

- 安装入口
- 插件目录
- commands
- agents
- hooks
- bug report / feedback
- 数据收集与隐私说明

也就是说，官方仓库不像 Codex 那样把完整 runtime 源码全部摊开给你读。它更像一个产品入口和插件生态入口。但从 Agent SDK 文档和公开泄露事件后的分析看，Claude Code 的内层同样是完整 agent loop。

Claude Code 的工程味道更接近：

```text
Developer intent
→ Project instructions / skills
→ Tool loop with permissions
→ Hooks / commands / plugins / agents
→ Human-reviewed coding workflow
```

它的强项不是“没有 runtime”，而是把 runtime 包进开发者日常工作流：`CLAUDE.md`、slash commands、hooks、skills、subagents、IDE / GitHub / terminal 入口、权限提示和项目记忆。

所以我现在会把这个对比改成：

| 维度 | Codex | Claude Code |
|---|---|---|
| 内层形态 | coding-agent tool loop | coding-agent tool loop |
| 外部入口 | CLI / TUI / headless exec / JSONL 更突出 | terminal / IDE / GitHub / Agent SDK / workflow affordances 更突出 |
| 项目记忆 | agent instructions / sessions / runtime events | `CLAUDE.md`、skills、hooks、commands、plugins、sessions |
| 边界控制 | sandbox / approval / event lifecycle | permissions / hooks / approval / budgets / compaction |
| 对 wtcraft 的启发 | 可审计执行账本 | 可持续项目工作流 |

这不是谁先进谁落后的问题。它们是在同一类 agent architecture 上，给开发者暴露了不同的产品表面。

---

## 2. 泄露事件真正说明了什么：loop 不神秘，周边系统才难

我不建议把泄露源码当成日常依赖，也不会在这里引用、传播或复刻里面的具体代码。但这个事件的公开报道和研究论文，确实改变了我对 Claude Code 架构差异的判断。

从公开分析看，Claude Code 的核心 loop 不是神秘魔法：

```text
while task not done:
  call model
  execute approved tools
  feed results back
```

真正的工程含金量在周边：

- 权限系统：哪些工具能自动跑，哪些必须问人，哪些必须拒绝。
- 上下文管理：长任务怎么压缩历史、保留关键决策、避免上下文爆炸。
- 工具生态：内置文件、搜索、shell、Web、MCP、自定义工具。
- workflow affordances：`CLAUDE.md`、commands、skills、hooks、plugins。
- delegation：subagent、隔离工作区、父子任务摘要。
- observability：session、usage、cost、result subtype、hook events。

这也影响了我对 `wtcraft` 的定位。

如果 Codex 和 Claude Code 都已经有成熟的 model-tool loop，那么 `wtcraft` 再写一个 loop，价值很低，风险很高。真正缺的是跨 agent、跨 worktree、跨任务的交接系统：

```text
Which task?
Which branch?
Which files?
Which off-limits paths?
Which verification commands?
Which run artifacts?
Which reviewer signs off?
```

说白了，是把协作流程落到文件、分支、日志和验证结果上。

---

## 3. 非官方架构资料怎么用：看 Claude Code，不是评测复刻项目

这里需要分清两件事。

`claude-code-best/claude-code` 本身是一个复刻/重建项目，不应该在这篇里作为“和 Codex、Claude Code、wtcraft 并列的产品”来分析。把它单独写成“值得看但不能盲用”，会把文章焦点带偏。

真正有用的是它配套的 [Claude Code Architecture 文档](https://ccb.agent-aura.top/docs/introduction/what-is-claude-code)。这份文档的价值在于，它按 Claude Code 的架构层次来解释：

- 交互层：terminal UI、REPL、用户输入。
- 编排层：QueryEngine、会话、成本追踪、transcript。
- 核心循环层：`query()` / agentic loop。
- 工具层：文件、搜索、Bash、MCP、权限检查。
- 通信层：Claude API streaming 和 provider 适配。

它还把一次典型任务拆成“上下文预处理 -> 流式 API 调用 -> 工具执行 -> 终止或继续”，这和 Anthropic Agent SDK 文档中描述的 loop 是同一个大结构。

所以我会把这类资料当成“Claude Code 架构解读材料”，而不是把 CCB 当成一个值得 `wtcraft` 对标的新 agent。对 `wtcraft` 来说，关键启发还是那句话：

> 真正的 multi-agent 难点不是让 agent 多起来，而是让 agent 之间的边界、状态、权限、日志、结果变得可管理。

---

## 4. Agent loop：不要复制大脑，要控制循环边界

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

Claude Code 也有自己的工具调用、权限、hooks、commands、subagents、skills、plugins、MCP、context compaction、session 和 budget 体系。

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

这叫外层工程 loop，不是 model tool loop。

这两层必须分清：

| 层级 | 谁负责 | 关注点 |
|---|---|---|
| Model tool loop | Codex / Claude Code | 如何读上下文、调工具、改代码 |
| Supervision loop | wtcraft | 谁做哪个任务、能改哪些文件、是否通过验证、如何交接 |

这也是我现在越来越相信的设计原则：

> `wtcraft` 不应该追求 agentic autonomy，而应该追求 bounded automation。

自动化可以很强，但边界必须很窄。

---

## 5. Headless：别把 Codex 和 Claude Code 的输出格式混在一起

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

这里要小心一个细节：Claude Code 也有 headless。官方文档叫 non-interactive / print mode，也就是 `claude -p`。

但 Claude Code 的输出格式和 Codex 不完全一样：

```bash
claude -p "Summarize this project" --output-format json
```

这个模式返回的是一个结构化 JSON 响应对象，文本结果在 `.result` 字段里，还带 session id、usage、cost 等 metadata。需要实时事件时，要用：

```bash
claude -p "Explain recursion" \
  --output-format stream-json \
  --verbose \
  --include-partial-messages
```

这时每一行才是一个 JSON event。也就是说：

| Engine | Headless command | Programmatic shape |
|---|---|---|
| Codex | `codex exec --json ...` | JSONL event stream by default |
| Claude Code | `claude -p --output-format json ...` | single JSON result object |
| Claude Code | `claude -p --output-format stream-json --verbose ...` | JSONL event stream |

订阅模式下也能拿到这些 metadata，但要区分“工程观测”和“真实账单”。Claude Code 文档说，`--output-format json` 的 payload 包含 `total_cost_usd` 和 per-model cost breakdown；Agent SDK 的 result message 也带 `usage`、`total_cost_usd`、`num_turns`、`session_id`。但 `total_cost_usd` 是客户端按本地价格表算出来的估算值。对 Pro / Max 这类订阅用户，session cost 不等同于真实账单；官方成本页也提醒订阅用户主要看 plan usage bars，而不是把这个 dollar figure 当 billing truth。

所以 `wtcraft` 的 run ledger 可以记录 token usage、session id、num turns、model breakdown、estimated cost，但不应该用 `total_cost_usd` 做财务结算。

这也是订阅模式下做 multi-agent orchestrator 最大的现实问题：命令格式、权限模式、输出 schema、usage metadata、计划限额都不是一个统一标准。更麻烦的是，这些 CLI 还在高速迭代，今天能 parse 的字段，明天可能改名、移动、拆成 event，或者只在某个 auth / plan / flag 组合下出现。

而且输出格式只是表层问题。更底层的是 task 边界和 sandbox 边界：

- task 边界：这个 agent 到底负责哪个 issue、哪个 branch、哪些文件、哪些验收条件。
- sandbox 边界：它能不能写文件、能写哪里、能不能跑 shell、能不能联网、能不能读本机 secrets。
- escalation 边界：哪些命令可以自动通过，哪些必须停下来问人，哪些直接禁止。
- merge 边界：一个 worktree 里的结果什么时候能进入主线，什么时候必须退回重做。

所以全自动 orchestrator 的 ROI 和可行性都要打折。不是完全不能做，而是不能把它当成 `wtcraft` 的第一性能力。

`wtcraft` 更合理的做法是：先把运行结果落成自己的 run artifact，同时允许人工接管。engine adapter 应该薄一点、保守一点，坏了也只是少抓一些 metadata，而不是让整个任务系统停摆。

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

## 6. Claude Code 给 wtcraft 的启发：别低估 hooks 和 project instructions

Claude Code 官方仓库虽然不是完整开源 runtime，但它给 `wtcraft` 的启发同样重要。

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

## 7. Worktree isolation：wtcraft 的护城河

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

4. **交接明确**
   下一个 agent 不需要读完整聊天历史，只要读任务文件、diff、run ledger。

5. **验证可自动化**
   `wtcraft check` 和 `wtcraft verify` 可以独立于 agent 执行。

这也是 `wtcraft` 和一般 agent CLI 最大的不同：

> Agent CLI 关心“如何完成一次 coding turn”。  
> `wtcraft` 关心“如何组织多个 coding turns 形成可合并的工程工作流”。

---

## 8. 对比总结：这次研究分别教了我什么

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

### 非官方架构资料提醒我的

非官方 Claude Code 架构资料最值得看的，不是复刻项目本身，而是它把 Claude Code 的内层结构拆得更具体。

它提醒我：

- agent loop 本身并不复杂，复杂的是 QueryEngine、权限、上下文、工具和恢复路径。
- terminal-native 的强项是完整 shell 能力，代价是必须有更严肃的边界。
- worktree isolation 已经进入成熟 coding agent 的设计空间，`wtcraft` 要做的是把它变成跨 agent 的任务契约。
- 如果一个 agent 已经有 hooks、skills、subagents、MCP，外层 harness 就更应该专注交接和验收，而不是重复造 runtime。

对 `wtcraft` 来说，这指向：

```text
run ledger
provider-neutral engine adapter
explicit permissions
local-first by default
```

---

## 9. wtcraft 下一步应该怎么走

研究这些项目后，我认为 `wtcraft` 的路线应该更坚定地保持轻量。

不是做：

```text
另一个 Codex
另一个 Claude Code
另一个全能 agent runtime
```

而是做：

```text
一个 git-native, agent-neutral, budget-aware coordination harness
```

优先级可以这样排。

### 第一优先级：Task / Sandbox Boundary

先把“谁可以做什么”说清楚。

`.worktree-task.md` 不只是任务说明，它应该逐渐承担边界声明：

```yaml
scope:
  - src/auth/**
off_limits:
  - package.json
  - .env*
sandbox:
  filesystem: workspace-write
  network: false
allowed_commands:
  - npm test
  - npm run lint
requires_approval:
  - git commit
  - npm install
```

这里的关键不是马上实现一个完美 sandbox。真正关键的是把边界写进 repo-native contract，让人类、Codex、Claude Code、Gemini、CI 都能看到同一份约束。

没有 task boundary，agent 会做多。

没有 sandbox boundary，agent 可能做错地方。

没有 approval boundary，自动化会从“省时间”变成“制造风险”。

### 第二优先级：Run Ledger

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

### 第三优先级：Thin Engine Adapter

不要把 `wtcraft` 绑死在某一个 agent CLI 上，但也不要把“全自动调度所有 agent”当成短期核心卖点。

可以先支持一个很薄的 adapter：

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
- 如何收集输出：Codex 的 `--json`、Claude 的 `--output-format json` / `stream-json` 不是同一种结果形状。
- 如何落 run artifact
- 失败时如何留下足够信息，让人类可以继续接手

真正的边界仍然由 `.worktree-task.md`、`check`、`verify` 控制。自动化抓不到 metadata 时，任务也不应该失效；最多是这次 run 的账本不够完整。

### 第四优先级：Contract Schema

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

这会让 Planner、Executor、Verifier、Finisher 之间的交接更稳。

### 第五优先级：Verifier as a first-class role

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

## 10. 最后的设计原则：让 agent 像承包商，不像室友

我现在越来越喜欢这个比喻：

> 不要让 agent 像室友一样住进你的主工作区；  
> 让 agent 像承包商一样，在明确工地、明确合同、明确验收标准下干活。

Codex 很适合做一个可观测的承包商。

Claude Code 很适合做一个懂你项目习惯的结对伙伴。

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
- Claude Code Agent SDK: How the agent loop works：<https://code.claude.com/docs/en/agent-sdk/agent-loop>
- Claude Code: Run Claude Code programmatically：<https://code.claude.com/docs/en/headless>
- Claude Code CLI reference：<https://code.claude.com/docs/en/cli-usage>
- Claude Code Agent SDK cost tracking：<https://code.claude.com/docs/en/agent-sdk/cost-tracking>
- Claude Code costs：<https://code.claude.com/docs/en/costs>
- Anthropic Claude Code product page：<https://www.anthropic.com/product/claude-code>
- InfoQ: Anthropic Accidentally Exposes Claude Code Source via npm Source Map File：<https://www.infoq.com/news/2026/04/claude-code-source-leak/>
- Axios: Anthropic leaked its own Claude source code：<https://www.axios.com/2026/03/31/anthropic-leaked-source-code-ai>
- arXiv: Dive into Claude Code：<https://arxiv.org/abs/2604.14228>
- Claude Code Architecture / CCB docs：<https://ccb.agent-aura.top/docs/introduction/what-is-claude-code>
- Learn Claude Code：<https://github.com/shareAI-lab/learn-claude-code>
- TokenChef Part 3：<https://zywkloo.github.io/blog/wtcraft-lightweight-git-native-multi-agent-scaffolding/>
