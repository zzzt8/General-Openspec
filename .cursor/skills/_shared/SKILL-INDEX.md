---
name: _skill-index
description: All Skill index. Organized by category. v5.3.
---

# Skill Index

> **This index is auto-generated. Do not edit manually.**
> Run `node .cursor/skills/_shared/GENERATE-INDEX.js` to regenerate.

## Quick Nav

[onboard](#onboard) | [sync](#sync) | [explore](#explore) | [propose](#propose) | [meta](#meta) | [apply](#apply) | [skip](#skip) | [verify](#verify) | [archive](#archive) | [debug](#debug) | [review](#review)

---

## onboard

### openspec-onboard

Guided onboarding for OpenSpec - walk through a complete workflow cycle with narration and real codebase work.

| Attr | Value |
|------|----|
| name | `openspec-onboard` |
| category | `onboard` |
| version | `"5.3"` |
| tags | `openspec`, `layer:meta` |
| aliases | `/opsx-onboard` |
| depends_on | `[]` |

```bash
/opsx-onboard
```

---

## sync

### openspec-sync

同步 OpenSpec CLI 和 Skill 系统。生成/更新 config.yaml、同步 agent 指令、同步 schemas。

| Attr | Value |
|------|----|
| name | `openspec-sync` |
| category | `sync` |
| version | `"5.3"` |
| tags | `openspec`, `layer:meta` |
| aliases | `/opsx-sync` |
| depends_on | `[]` |

```bash
/opsx-sync
```

---

### openspec-sync-specs

Sync delta specs from a change to main specs. Use when the user wants to update main specs with changes from a delta spec, without archiving the change.

| Attr | Value |
|------|----|
| name | `openspec-sync-specs` |
| category | `sync` |
| version | `"5.3"` |
| tags | `openspec`, `layer:meta` |
| aliases | `/opsx-sync-specs` |
| depends_on | `[]` |

```bash
/opsx-sync-specs
```

---

## explore

### openspec-explore

Enter explore mode - a thinking partner for exploring ideas, investigating problems, and clarifying requirements. Use when the user wants to think through something before or during a change.

| Attr | Value |
|------|----|
| name | `openspec-explore` |
| category | `explore` |
| version | `"5.3"` |
| tags | `openspec`, `layer:meta` |
| aliases | `/opsx-explore` |
| depends_on | `[]` |

```bash
/opsx-explore
```

---

## propose

### openspec-propose

Propose a new change with all artifacts generated in one step. Use when the user wants to quickly describe what they want to build and get a complete proposal with design, specs, and tasks ready for implementation.

| Attr | Value |
|------|----|
| name | `openspec-propose` |
| category | `propose` |
| version | `"5.3"` |
| tags | `openspec`, `layer:meta` |
| aliases | `/opsx-propose` |
| depends_on | `[]` |

```bash
/opsx-propose
```

---

## meta

### openspec-plan

多 change 编排能力。按专家规划派生子 change，非默认能力。

| Attr | Value |
|------|----|
| name | `openspec-plan` |
| category | `meta` |
| version | `"5.3"` |
| tags | `openspec`, `layer:meta` |
| aliases | `/opsx-plan` |
| depends_on | `openspec-explore` |

```bash
/opsx-plan
```

---

### openspec-skill

Skill 系统维护工具。合并了 skill-list / skill-deps / skill-validate / skill-index 功能。不默认暴露，仅维护时使用。

| Attr | Value |
|------|----|
| name | `openspec-skill` |
| category | `meta` |
| version | `"5.3"` |
| tags | `openspec`, `layer:meta` |
| aliases | `/opsx-skill` |
| depends_on | `[]` |

```bash
/opsx-skill
```

---

## apply

### openspec-apply

实现 OpenSpec change 的任务。支持断点续传、增量验证、依赖调度。

| Attr | Value |
|------|----|
| name | `openspec-apply` |
| category | `apply` |
| version | `"5.3"` |
| tags | `openspec`, `layer:meta` |
| aliases | `/opsx-apply` |
| depends_on | `openspec-propose`, `openspec-plan` |

```bash
/opsx-apply
```

---

### openspec-continue

断点续传。继续上一个未完成的 change，基于 tasks.md checkbox 恢复执行状态。续传逻辑委托给 openspec-apply。

| Attr | Value |
|------|----|
| name | `openspec-continue` |
| category | `apply` |
| version | `"5.3"` |
| tags | `openspec`, `layer:meta` |
| aliases | `/opsx-continue`, `/opsx-apply` |
| depends_on | `openspec-propose`, `openspec-plan` |

```bash
/opsx-continue
```

---

## skip

### openspec-skip

跳过当前 task 或中止整个 change。处理不再需要的 task 或放弃进行中的 change。

| Attr | Value |
|------|----|
| name | `openspec-skip` |
| category | `skip` |
| version | `"5.3"` |
| tags | `openspec`, `layer:meta` |
| aliases | `/opsx-skip` |
| depends_on | `[]` |

```bash
/opsx-skip
```

---

## verify

### openspec-verify

验证 OpenSpec change 的实现一致性 — Full 验证 + coherence-lite checklist。

| Attr | Value |
|------|----|
| name | `openspec-verify` |
| category | `verify` |
| version | `"5.3"` |
| tags | `openspec`, `layer:meta` |
| aliases | `/opsx-verify` |
| depends_on | `openspec-apply` |

```bash
/opsx-verify
```

---

## archive

### openspec-archive

归档已完成的 OpenSpec change。

| Attr | Value |
|------|----|
| name | `openspec-archive` |
| category | `archive` |
| version | `"5.3"` |
| tags | `openspec`, `layer:meta` |
| aliases | `/opsx-archive` |
| depends_on | `openspec-verify` |

```bash
/opsx-archive
```

---

## debug

### openspec-debug

调试 apply 阶段遇到的问题。环境自适应诊断，支持多类错误模式。

| Attr | Value |
|------|----|
| name | `openspec-debug` |
| category | `debug` |
| version | `"5.3"` |
| tags | `openspec`, `layer:meta` |
| aliases | `/opsx-debug` |
| depends_on | `openspec-apply`, `openspec-verify` |

```bash
/opsx-debug
```

---

## review

### openspec-review

设计评审。基于结构分析评审 design 决策是否合理，输出 formal review artifact。

| Attr | Value |
|------|----|
| name | `openspec-review` |
| category | `review` |
| version | `"5.3"` |
| tags | `openspec`, `layer:meta` |
| aliases | `/opsx-review` |
| depends_on | `openspec-propose` |

```bash
/opsx-review
```

---

## Search Examples

```
onboard  -> openspec-onboard
apply   -> openspec-apply, openspec-continue
verify  -> openspec-verify
debug   -> openspec-debug
meta    -> openspec-plan, openspec-skill
```

## Related Files

- [SCHEMA.md](./SCHEMA.md) - Configuration schema
- [SHARED-LAYERS.md](./SHARED-LAYERS.md) - Layer mapping
