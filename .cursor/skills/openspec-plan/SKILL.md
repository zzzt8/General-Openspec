---
name: openspec-plan
description: 多 change 编排能力。按专家规划派生子 change，非默认能力。
version: "5.3"
category: meta
tags:
  - openspec
  - layer:meta
aliases:
  - /opsx:plan
depends_on:
  - openspec-explore
permissions: []
risks: []
verify: []
---

> **前置共享片段：** 配置规范见 [../_shared/SCHEMA.md](../_shared/SCHEMA.md)。

## 核心职责

- 接收专家规划文档
- 产出 `change-index.md`：候选子 change 列表 + 依赖
- 批量派生子 change

## 使用门槛

满足以下任一条件，建议使用 `/opsx:plan`：

| 条件 | 说明 |
|------|------|
| 预期需要 3 个以上子 change | change 间需要结构化拆分 |
| 存在 change 间依赖 | 子 change 有执行顺序约束 |
| 涉及共享 contract / migration / rollout | 需要统一协调 |
| 需要批量 apply | 多个 change 需要统一执行 |
| 专家规划文档已存在 | 已有结构化分析，需拆解派生子 change |

不满足以上条件，直接走 `/opsx:propose`。

## 使用方式

```bash
/opsx:plan <path-to-expert-doc>     # 完整流程
/opsx:plan --derive <meta-change>    # 仅派生
/opsx:plan <doc> --no-confirm        # 跳过人工确认
```

## 执行流程

### 阶段 1: 解析专家规划

```bash
openspec new change "<meta-name>"
```

生成：proposal.md、design.md、repo-analysis.md（只扫一遍）、change-index.md。
（注：review（含 test-design）由各子 change 独立生成，不在 meta-change 中创建。）

> **CLI 语法验证（v5.1）：**
> `openspec new change` 的 name 参数仅支持小写字母、数字、连字符（kebab-case），**不支持** `/` 分隔的嵌套语法。
> 子 change 名称由 Agent 在 `<meta-name>/<sub-name>` 约定下自动转换（`/` 替换为 `-`）。

**change-index.md 结构：**

```markdown
# Change Index

> 本 index 由 meta-change `<name>` 全局分析生成。

## C1 <change-name>

- **goal**: <一句话描述目标>
- **layer**: <engine / backend / editor / runtime / ui-skin>
- **depends_on**: <none / C2 / C3...>
- **reason**: <为什么需要这个 change>
```

> **命名约定：** 子 change 名称中 `/` 由 Agent 自动替换为 `-`（kebab-case）。

**人工确认：**

```
拆分结果：
| # | Child Change | Layer |
|---|--------------|-------|
| C1 | c1-mapper-contract | engine |
| C2 | c2-repository-layer | backend |

- [ ] 范围是否合理？
- [ ] 依赖关系是否正确？
```

### 阶段 2: 批量派生

```bash
openspec new change "<meta-name>-c1-mapper-contract"
openspec new change "<meta-name>-c2-repository-layer"
```

> **注意：** 子 change 名称不含 `/`，使用 `-` 连接。例如 `openspec new change "my-meta-c1-xxx"`。

子 change 复用 meta 的 repo-analysis。

### 阶段 3: 子 change 的 review + test-design

每个子 change 都需要依次执行：
1. `/opsx:review` — 评审 design 决策（含 test-design）
2. `/opsx:apply` — 实现

父 meta change 的 repo-analysis.md 供子 change 复用。
review.md 和 test-design.md 必须由每个子 change 独立完成，不得复用父 meta 的版本。

## Guardrails

- **强制**只做一次全局 repo-analysis
- **强制**按依赖拓扑顺序创建子 change
- **强制**检测并报错循环依赖
- **禁止**用 mkdir 创建子 change 目录
- **禁止**假设 CLI 支持 `/` 嵌套语法（必须使用 kebab-case）
- **强制**子 change 必须独立完成各自的 review（含 test-design），不得复用父 meta 的版本
