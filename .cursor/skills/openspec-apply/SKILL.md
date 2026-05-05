---
name: openspec-apply
description: 实现 OpenSpec change 的任务。支持断点续传、增量验证、依赖调度。
version: "5.3"
category: apply
tags:
  - openspec
  - layer:meta
aliases:
  - /opsx:apply
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

> **前置共享片段：** layer 映射、验证命令见 [../_shared/SHARED-LAYERS.md](../_shared/SHARED-LAYERS.md)。

## Profile-Based Gating

Read profile at start to determine which gates to enforce:

```bash
PROFILE=$(get_config_value "opsx.profile" "openspec/config.yaml" "core-light")
GATE_SCHEMA_PREFLIGHT=$(get_config_value "opsx.gates.schema_preflight" "openspec/config.yaml" "false")
GATE_AUTO_COMMIT=$(get_config_value "opsx.git.auto_commit" "openspec/config.yaml" "false")
GATE_TEST_ATTRIBUTION=$(get_config_value "opsx.gates.test_attribution" "openspec/config.yaml" "false")
```

Profile gates:

| Profile | schema_preflight | test_attribution | archive_requires_verify |
|---------|-----------------|-----------------|----------------------|
| `core-light` (default) | false | false | false |
| `strict-review` | true | false | true |
| `enterprise` | true | true | true |

## Entry Routing

| Call Style | Mode | Behavior |
|------------|------|----------|
| `/opsx:apply <name> --from <id>` | Execute | Run specific task |
| `/opsx:apply <name>` | Execute | Start from first incomplete |
| `/opsx:apply` | Execute | Find active change via CLI |

## State Truth Source

> Priority: official CLI > tasks.md checkbox

```bash
# Preferred: use official CLI
openspec instructions --change "<name>" --json | jq '.current_task'
openspec status --change "<name>" --json | jq '.tasks[] | select(.status == "todo")'

# Fallback: read tasks.md checkbox directly
# - [ ] = todo, - [x] = done, - [S] = skipped
```

## Schema Preflight

Execute when `GATE_SCHEMA_PREFLIGHT=true`. See [_steps/SCHEMA-PREFLIGHT.md](_steps/SCHEMA-PREFLIGHT.md).

## Task Execution

For each task:

1. **Select change**: `openspec status --change "<name>" --json`
2. **Find next task**: first `- [ ]` with satisfied dependencies
3. **Record baseline**: `BASELINE=$(git rev-parse HEAD)`
4. **Execute**: implement the task
5. **Git after task**:
   - If `GATE_AUTO_COMMIT=true` AND working tree clean: commit with prefix `[opsx]`
   - Otherwise: report changes, let user decide
6. **Incremental verify**: see [_steps/VERIFY.md](_steps/VERIFY.md)
7. **Update checkbox**: `- [ ]` -> `- [x]`
8. **On failure**: go to `/opsx:debug`

## Layer Priority

From `config.yaml`: `opsx.layers.priority`

Execute tasks grouped by layer: engine > backend > editor > runtime > ui-skin > meta

## Test Failure Attribution

Execute when tests fail AND `GATE_TEST_ATTRIBUTION=true`. See [_steps/TEST-ATTRIBUTION.md](_steps/TEST-ATTRIBUTION.md).

For `core-light` profile: undetermined (meta layer) downgrades to warning + record, does not block.

## Git Operations

- **Baseline tracking**: Record `BASELINE=$(git rev-parse HEAD)` before each task. Compare against HEAD after task for accurate incremental diff.
- **Auto-commit**: Only when `opsx.git.auto_commit=true` AND working tree was clean before task.
- **No HEAD~N dependency**: Use `git diff $BASELINE...HEAD` instead of `git diff HEAD~1`.

## Module References

- Schema Preflight: [_steps/SCHEMA-PREFLIGHT.md](_steps/SCHEMA-PREFLIGHT.md)
- Incremental Verify: [_steps/VERIFY.md](_steps/VERIFY.md)
- Test Attribution: [_steps/TEST-ATTRIBUTION.md](_steps/TEST-ATTRIBUTION.md)
- Layer Calc: [_steps/LAYER-CALC.md](_steps/LAYER-CALC.md)
- Checkpoint: [_steps/CHECKPOINT.md](_steps/CHECKPOINT.md)

## Guardrails

- **强制**执行前检查 dependencies 依赖
- **强制**按 layer 优先级排序执行
- **强制**apply 开始前验证 tasks.md 存在（硬关卡）
- **强制**测试失败时执行 Test Failure Attribution（当 `GATE_TEST_ATTRIBUTION=true`）
- **强制**失败时转到 `/opsx:debug`
- **强制**增量验证基于实际 git diff，不依赖 Agent 预估
- **强制**git 操作使用 baseline tracking，不依赖 HEAD~N
- **禁止**在 apply 阶段探索代码库
- **禁止**跳过增量验证
- **禁止**忽略 layer 优先级
- **禁止**忽略 blocked dependencies
- **禁止**内联 bash/grep/sed 脚本片段（使用 xplat 函数）
- **委托**跳过 task → `/opsx:skip`
- **委托**中止 change → `/opsx:skip`
