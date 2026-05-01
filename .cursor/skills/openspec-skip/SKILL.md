---
name: openspec-skip
description: 跳过当前 task 或中止整个 change。处理不再需要的 task 或放弃进行中的 change。
version: "5.3"
category: skip
tags:
  - openspec
  - layer:meta
aliases:
  - /opsx-skip
depends_on: []
permissions:
  - file-write
risks: []
verify: []
---

> **前置共享片段：** 配置规范见 [\_shared/SCHEMA.md](../_shared/SCHEMA.md)。

## 核心职责

- **跳过 task**：将当前未完成的 task 标记为跳过（`- [S]`），不影响其他 tasks
- **中止 change**：将整个 change 标记为 `abandoned`，停止后续工作

## 使用方式

```bash
/opsx-skip <task-id>     # 跳过指定 task（如 T3）
/opsx-skip --task        # 交互式选择要跳过的 task
/opsx-skip --change      # 中止当前 change
/opsx-skip --change <name>  # 中止指定 change
```

## 执行流程

### 模式 1：跳过 task

#### 1. 确定 change 和 task

```bash
# 如果用户指定了 task-id，直接使用
# 如果未指定，列出当前 change 的未完成 tasks
openspec status --change "<name>" --json
```

#### 2. 确认跳过原因

```
## 跳过 Task 确认 — T3

当前 change：<name>
Task：T3: [任务描述]

请选择跳过原因：
1. [ ] 需求变更，不再需要
2. [ ] 已由其他 task 覆盖
3. [ ] 技术不可行，暂不实现
4. [ ] 其他原因（请说明）

跳过后：
- 该 task 标记为 - [S]（跳过）
- 不影响其他 tasks
- 记录跳过原因到 tasks.md

输入原因编号，或直接输入 "skip" 确认跳过。
```

#### 3. 更新 tasks.md

```bash
# 使用 awk 跨平台替换 checkbox 状态（sed -i 在原生 PowerShell 中不可用）
awk '
/^- \[ \] \(T3:.*\)/ {
    sub(/^- \[ \] \(T3:/, "- [S] (T3:")
    $0 = $0 "  # 跳过原因：xxx"
}
{ print }
' "openspec/changes/<name>/tasks.md" > "openspec/changes/<name>/tasks.md.tmp" && \
  mv "openspec/changes/<name>/tasks.md.tmp" "openspec/changes/<name>/tasks.md"
```

#### 4. 记录跳过原因

```markdown
## Task 跳过记录

| Task | 原因 | 日期 |
|------|------|------|
| T3 | 需求变更，不再需要 | 2026-04-19 |
```

### 模式 2：中止 change

#### 1. 确认中止

```
## 中止 Change 确认 — <name>

警告：中止 change 将：
- 停止所有后续 tasks
- 将 change 标记为 abandoned
- 不删除任何已创建的 artifacts

当前进度：N/N tasks 完成

请确认：
1. [ ] 已 commit 所有需要保留的代码
2. [ ] 了解中止后无法直接恢复
3. [ ] 确认中止此 change

输入 "abandon" 确认中止，或 "cancel" 取消。
```

#### 2. 更新 proposal.md

```bash
# 在 proposal.md 顶部添加 abandoned 状态
# 在状态字段添加：
# status: abandoned
# abandoned_reason: "xxx"
# abandoned_date: "2026-04-19"
```

#### 3. 生成中止摘要

```markdown
## Change 中止摘要 — <name>

中止日期：2026-04-19
中止原因：[用户输入的原因]

完成的任务：[列表]
跳过的任务：[列表]

保留的代码：
- 已 commit 到主分支

下一步：
- 运行 /opsx-propose 重新开始（如需）
```

### 3. 输出摘要

```
## Skip 摘要

| 操作 | 目标 | 状态 |
|------|------|------|
| 跳过 task | T3 | ✓ |
| 原因 | 需求变更 | — |

当前 change 进度：N/N tasks 完成（N 个跳过）
```

## Guardrails

- **强制**跳过 task 时记录原因（写入 tasks.md 注释）
- **强制**中止 change 时确认用户已 commit 保留代码
- **强制**中止 change 前列出当前进度和影响
- **禁止**在 verify 未通过时直接中止（需用户明确确认）
- **禁止**删除任何 artifacts（保留历史记录）
- **强制**跳过后的 task 不参与 coherence 检查
