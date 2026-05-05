---
name: openspec-verify
description: 验证 OpenSpec change 的实现一致性 — Full 验证 + coherence-lite checklist。
version: "5.3"
category: verify
tags:
  - openspec
  - layer:meta
aliases:
  - /opsx-verify
depends_on:
  - openspec-apply
permissions: []
risks: []
verify:
  - typecheck
---

> **前置共享片段：** layer 映射、验证命令见 [\_shared/SHARED-LAYERS.md](../_shared/SHARED-LAYERS.md)。

## 核心原则

**verify 只做检查，不做修复。** 发现的问题由 `openspec-apply` 修复后重新 verify。

## 状态读取

> 状态以 tasks.md checkbox 为主：`- [ ]` → todo，`- [x]` → done，`- [S]` → skipped。

## 执行流程

### 1. Schema Preflight（xplat）

> 详见 [../_shared/SCHEMA.md](../_shared/SCHEMA.md#schema-preflight-统一硬关卡)。

```bash
# Unix / Git Bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../_shared/_xplat.sh"

# Windows PowerShell
# . "$PSScriptRoot\..\_shared\_xplat.ps1"

if ! test_schema_exists "openspec/config.yaml"; then
  echo "[opsx-verify] Schema 缺失。停止执行。"
  exit 1
fi
```

### 2. 选择 change

```bash
openspec status --change "<name>" --json
```

### 3. Full 验证

```bash
openspec validate --all --json
```

**输出解读：**

```json
{
  "results": {
    "changes": [{ "name": "<name>", "valid": true, "warnings": [] }]
  },
  "summary": { "total": 1, "valid": 1, "invalid": 0 }
}
```

- `valid: false` → Full 验证失败，禁止 archive
- `valid: true` + `warnings` → 警告，提示用户确认
- `invalid > 0` → Full 验证阻断，禁止 archive

> **注意：** 官方 `openspec validate` 已整合 typecheck + test，不要再用 `$PKG_MGR typecheck/test`。

### 4. coherence-lite 检查

**问答式 checklist：**

```markdown
## Coherence Check

- [ ] tasks.md 中每个已完成 task 是否有对应的代码改动？
- [ ] design.md 中的关键技术决策是否在代码中得到体现？
- [ ] specs/ 中的 ADDED / MODIFIED 语义是否有对应的实现？
```

**Traceability Map：**

```markdown
|| Proposal Goal | Design Decision | Task | Code/Test | 测试状态 | 归因判定过程 |
||--------------|----------------|------|-----------|---------|------------|
|| [goal-1] | [decision-1] | T1 | [file:func] | PASS / FAIL / N/A | [如何得出测试状态] |
```

**高风险 change 额外检查（change_class=high）：**

```markdown
## High-Risk Traceability

- [ ] 是否存在 specs 改了但没有对应 task？
- [ ] 是否存在 design 提到的关键路径但代码没有落点？
```

### 5. undetermined 处理（闭环流程）

> 当 coherence-lite 检查中出现无法明确判断"相关"或"无关"的测试时，触发此流程。

#### 5.1 尝试确定性证明

**第一步：增量测试**
运行针对受影响文件的增量测试，看是否能定位到具体测试用例：
```bash
# 通过 xplat 执行增量验证
invoke_verify "engine" "test" "openspec/config.yaml"
```

**第二步：调用栈分析**
读取失败测试的调用栈，追踪是否经过本次改动的文件。

#### 5.2 决策分支

| 证据 | 判定 | 后续动作（meta 层） | 后续动作（非 meta 层） |
|------|------|---------|---------------------|
| 能用 git diff 证明测试不在覆盖范围 | `unrelated_proven` | 记录归因，继续 verify | 记录归因，继续 verify |
| 已知 flaky，失败特征与历史一致 | `flaky_proven` | 记录归因，继续 verify | 记录归因，继续 verify |
| 测试在 git diff 覆盖范围内 | `related` | 硬关卡：不得标记完成，转 /opsx-apply 修复 | 硬关卡：不得标记完成，转 /opsx-apply 修复 |
| 无法明确证明 | `undetermined` | **降级：warning + 记录，继续 verify** | **硬关卡：禁止给出结论，转 /opsx-debug** |

#### 5.3 记录归因

所有情况都必须在 Traceability Map 的"归因判定过程"列中注明判断过程：

```markdown
|| 测试 | 归因判定 | 归因判定过程 |
||------|---------|------------|
|| [TC-xxx] | related | git diff 显示 test/foo.test.ts 覆盖 file/changed.go |
|| [TC-yyy] | unrelated_proven | git diff 不包含 module/B/ 路径 |
|| [TC-zzz] | flaky_proven | 失败特征与 2026-03-15 run 一致 |
|| [TC-abc] | undetermined | 无法通过 git diff 确认 module/C/ 是否被覆盖 |
```

#### 5.4 强制阻断

如果存在 `related` 或 `undetermined`（非 meta 层）：
- 输出：`[opsx-verify] Test Failure Attribution 阻断`
- **强制**进入 /opsx-debug 并附上归因分析
- **禁止**给出"可以 archive"或"不可 archive"的二元结论（对 `undetermined`）

如果存在 `undetermined`（meta 层）：
- 输出：`[opsx-verify] WARNING: undetermined attribution (meta layer) - <测试名>`
- 在 Traceability Map 中记录原因
- 继续 verify 流程（不阻断）

## 输出结果

> **注意（archive 后无法 show 的 workaround）：**
> CLI 的 `openspec show` 只在 `openspec/changes/` 中查找，archive 后目录移入 `archive/`，CLI 无法直接 show。
> 这是上游设计行为，Skill 层提供 workaround。详见 [archive-guide.md](../../openspec/docs/archive-guide.md)。

```markdown
## Verify Result

| 检查项 | 状态 | 详情 |
|--------|------|------|
| Full 元数据检查 | PASS/FAIL | N/N tasks done |
| Full 验证 | PASS/FAIL | typecheck + test |
| Coherence Check | PASS/FAIL | N/N passed |
| Traceability | PASS/FAIL | N/N goals traceable |

下一步：
- 全部通过 → 可以 archive
- 有问题 → 必须修复后重新 verify
```

## Guardrails

- **强制**在 archive 前执行 verify
- **强制**Full 元数据检查所有 checkbox 已完成
- **强制**coherence-lite 执行 Traceability Map 核对
- **强制**undetermined 状态必须经过三步闭环处理（详见"undetermined 处理"章节）
- **强制**非 meta 层 undetermined 必须阻断，禁止给出 archive 结论
- **强制**coherence-lite 失败时返回 apply 修复
- **禁止**跳过 verify 直接 archive
- **禁止**在 verify 阶段修复代码，只负责发现问题
- **禁止**内联 bash/grep/sed 脚本片段（使用 xplat 函数，详见 SHARED-LAYERS.md）
