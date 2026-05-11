---
name: openspec-continue
description: 断点续传。继续上一个未完成的 change，基于 tasks.md checkbox 恢复执行状态。只负责定位断点，不执行任何 task。
version: "5.3"
category: apply
tags:
  - openspec
  - layer:meta
aliases:
  - /opsx:continue
depends_on:
  - openspec-propose
  - openspec-plan
permissions:
  - file-write
risks:
  - modifies-code
verify:
  - typecheck
---

> 入口路由 + 断点检测。只负责找到断点并输出续传指令，实际执行由 [openspec-apply](../openspec-apply/SKILL.md) 完成。

## 核心职责

纯定位器：检测 active changes → 找到断点 → 输出续传指令。不执行任何 task。

## 执行流程

### 1. 检测 active changes

```bash
openspec list --json
```

若有多于 1 个 active change，列出供用户选择。

### 2. 读取 tasks.md checkbox

扫描 tasks.md 中的 checkbox 状态：
- `- [ ]` → todo
- `- [x]` → done
- `- [S]` → skipped

### 3. 找到断点

找到第一个 status 为 todo 且 dependencies 已满足的 task，即为断点。

### 4. 显示续传摘要

```
## Continue 摘要 — <change-name>

当前进度：N/N tasks 完成（N 个跳过）

断点任务：T3: [任务描述]
  Layer: engine
  Verify: unit-tests
  Dependencies: none

下一步：调用 /opsx-apply <change-name> --from T3
```

### 5. 输出续传指令

不再委托 apply 执行，而是直接输出调用指令供 Agent 执行：

```
/opsx-apply <change-name> --from <task-id>
```

## Guardrails

- **强制**先检测 active changes，有多个时列出供用户选择
- **强制**读取 tasks.md checkbox 作为状态真相源
- **强制**找到断点后输出续传指令
- **禁止**执行任何 task 逻辑（只做定位）
- **禁止**在有多个 active changes 时自动选择（需用户确认）
- **禁止**跳过任何 checkbox 状态为 todo 的 task
