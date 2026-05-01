---
name: openspec-continue
description: 断点续传。继续上一个未完成的 change，基于 tasks.md checkbox 恢复执行状态。续传逻辑委托给 openspec-apply。
version: "5.3"
category: apply
tags:
  - openspec
  - layer:meta
aliases:
  - /opsx-continue
  - /opsx-apply
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

> 入口路由 + 断点检测。续传执行逻辑委托给 [openspec-apply](../openspec-apply/SKILL.md)。

## 核心职责

入口路由：检测 active changes → 找到断点 → 委托 openspec-apply 执行。

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

### 4. 显示续传摘要（含 Context Snapshot）

续传前捕获上下文快照，便于恢复中断时的状态：

```bash
# 获取 git 状态（是否有未 commit 的改动）
GIT_STATUS=$(git status --porcelain 2>/dev/null || echo "")

# 获取最近改动的文件（最近 3 个 task 的范围）
RECENT_FILES=$(git diff --name-only HEAD~3 HEAD 2>/dev/null | head -5 || echo "")

# 显示续传摘要
```

```
## Continue 摘要 — <change-name>

当前进度：N/N tasks 完成（N 个跳过）

上次中断位置：T3
上次中断原因：[从上下文推断或询问用户]

断点任务：T3: [任务描述]
  Layer: engine
  Verify: unit-tests
  Dependencies: none

Context Snapshot:
  Git 状态: clean | dirty（列出改动文件）
  最近改动: <file1>, <file2>...
  待续接内容: [简要描述上次中断时的上下文]

继续前请确认：
- [ ] 上次中断的上下文已清晰
- [ ] 无需要重新评估的任务
- [ ] 代码状态正常（无残留修改）

输入 "continue" 开始续传，或输入 task-id 跳转到其他 task。
```

### 5. 委托续传

续传执行完全委托给 [openspec-apply](../openspec-apply/SKILL.md)，复用其执行引擎和验证逻辑（模式 D：续传模式）。

## Guardrails

- **强制**先检测 active changes，有多个时列出供用户选择
- **强制**读取 tasks.md checkbox 作为状态真相源
- **强制**找到断点后显示续传摘要供用户确认
- **强制**通过 openspec-apply 执行续传（不自建执行逻辑）
- **禁止**在有多个 active changes 时自动选择（需用户确认）
- **禁止**跳过任何 checkbox 状态为 todo 的 task
