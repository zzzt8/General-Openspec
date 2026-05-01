---
name: _skill-index
description: 所有 Skill 的索引目录。按 category 组织。v4.0。
---

# Skill Index

> 本 index 由生成脚本自动维护。所有 Skill 必须遵循 [SCHEMA.md](./SCHEMA.md) 定义的元数据 schema。

## 快速导航

[onboard](#onboard) · [sync](#sync) · [explore](#explore) · [propose](#propose) · [meta](#meta) · [apply](#apply) · [skip](#skip) · [verify](#verify) · [archive](#archive) · [debug](#debug) · [review](#review) · [test-design](#test-design)

---

## onboard

### openspec-onboard

Guided onboarding for OpenSpec - walk through a complete workflow cycle with narration and real codebase work.

| 属性 | 值 |
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

| 属性 | 值 |
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

| 属性 | 值 |
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

| 属性 | 值 |
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

| 属性 | 值 |
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

| 属性 | 值 |
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

| 属性 | 值 |
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

| 属性 | 值 |
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

### openspec-apply-change

Implement tasks from an OpenSpec change. Use when the user wants to start implementing, continue implementation, or work through tasks.

| 属性 | 值 |
|------|----|
| name | `openspec-apply-change` |
| category | `apply` |
| version | `"5.3"` |
| tags | `openspec`, `layer:meta` |
| aliases | `/opsx-apply-change` |
| depends_on | `openspec-propose`, `openspec-plan` |

```bash
/opsx-apply-change
```

---

### openspec-continue

断点续传。继续上一个未完成的 change，基于 tasks.md checkbox 恢复执行状态。续传逻辑委托给 openspec-apply。

| 属性 | 值 |
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

### openspec-continue-change

Continue working on an OpenSpec change by creating the next artifact. Use when the user wants to progress their change, create the next artifact, or continue their workflow.

| 属性 | 值 |
|------|----|
| name | `openspec-continue-change` |
| category | `apply` |
| version | `"5.3"` |
| tags | `openspec`, `layer:meta` |
| aliases | `/opsx-continue-change` |
| depends_on | `openspec-propose` |

```bash
/opsx-continue-change
```

---

## skip

### openspec-skip

跳过当前 task 或中止整个 change。处理不再需要的 task 或放弃进行中的 change。

| 属性 | 值 |
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

| 属性 | 值 |
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

### openspec-verify-change

Verify implementation matches change artifacts. Use when the user wants to validate that implementation is complete, correct, and coherent before archiving.

| 属性 | 值 |
|------|----|
| name | `openspec-verify-change` |
| category | `verify` |
| version | `"5.3"` |
| tags | `openspec`, `layer:meta` |
| aliases | `/opsx-verify-change` |
| depends_on | `openspec-apply` |

```bash
/opsx-verify-change
```

---

## archive

### openspec-archive

归档已完成的 OpenSpec change。

| 属性 | 值 |
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

### openspec-archive-change

Archive a completed change in the experimental workflow. Use when the user wants to finalize and archive a change after implementation is complete.

| 属性 | 值 |
|------|----|
| name | `openspec-archive-change` |
| category | `archive` |
| version | `"5.3"` |
| tags | `openspec`, `layer:meta` |
| aliases | `/opsx-archive-change` |
| depends_on | `openspec-verify` |

```bash
/opsx-archive-change
```

---

## debug

### openspec-debug

调试 apply 阶段遇到的问题。环境自适应诊断，支持多类错误模式。

| 属性 | 值 |
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

| 属性 | 值 |
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

## test-design

### openspec-test-design

测试用例设计。在动手实现前明确测试边界，TDD 视角先写测试用例再写实现。

| 属性 | 值 |
|------|----|
| name | `openspec-test-design` |
| category | `test-design` |
| version | `"5.3"` |
| tags | `openspec`, `layer:meta` |
| aliases | `/opsx-test-design` |
| depends_on | `openspec-review` |

```bash
/opsx-test-design
```

---

## 搜索示例

### 按 category 搜索

```
onboard → openspec-onboard
apply   → openspec-apply, openspec-continue
verify  → openspec-verify
debug   → openspec-debug
meta    → openspec-plan, openspec-skill
```

## 相关文件

- [SCHEMA.md](./SCHEMA.md) — 参数化配置规范
- [SHARED-LAYERS.md](./SHARED-LAYERS.md) — Layer 映射和验证命令
