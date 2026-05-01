---
name: openspec-apply
description: 实现 OpenSpec change 的任务。支持断点续传、增量验证、依赖调度。
version: "5.3"
category: apply
tags:
  - openspec
  - layer:meta
aliases:
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

> **前置共享片段：** layer 映射、验证命令见 [\_shared/SHARED-LAYERS.md](../_shared/SHARED-LAYERS.md)。

## 状态真相源

> Task 状态以 tasks.md checkbox 为主，tasks-state.json 仅作兼容参考（渐进迁移中）。

**主真相源：tasks.md checkbox**
- `- [ ]` → todo
- `- [x]` → done
- `- [S]` → skipped

**冲突处理规则（必须写死）：**
- tasks.md checkbox 是唯一主真相源
- 冲突时输出 warning：`[opsx-apply] 状态不一致：tasks.md 为准`
- 不自动修复 JSON

## 入口路由

根据调用参数决定执行模式：

| 调用方式 | 模式 | 说明 |
|---------|------|------|
| `/opsx-apply <name>` | 执行模式 | 从第一个 todo task 开始 |
| `/opsx-apply`（无参数） | 续传模式 | 自动检测断点，从上次中断处继续 |
| `/opsx-apply --skip <task-id>` | 跳过模式 | 将指定 task 标记为跳过 |
| `/opsx-apply --skip --change` | 中止模式 | 中止整个 change |

## Health Check（诊断性，非硬关卡）

> **来自 design D5：** 健康检查失败输出为 WARNING，不阻断后续流程。Schema Preflight 仍为硬关卡。

```powershell
# 在 Schema Preflight 之前执行健康检查（诊断性，不阻断）
. "$PSScriptRoot\..\_shared\_xplat.ps1"

$healthCheckScript = Join-Path $PSScriptRoot "..\_shared\health-check.ps1"
if (Test-Path $healthCheckScript) {
    Write-Host "[opsx-apply] 运行健康检查..." -ForegroundColor Cyan
    try {
        # 使用 JSON 格式便于程序化解析，结构化捕获结果
        $hcJson = & $healthCheckScript -Format json 2>&1
        $hcResult = $hcJson | ConvertFrom-Json -ErrorAction Stop
        $hcOutput = & $healthCheckScript -Format table 2>&1
        $hcOutput | ForEach-Object { Write-Host $_ }
        $warnCount = $hcResult.summary.warnings
        $failCount = $hcResult.summary.failed
        if ($failCount -gt 0) {
            $failedChecks = $hcResult.checks | Where-Object { $_.status -eq "FAIL" } | ForEach-Object { $_.name }
            Write-Host "[opsx-apply] 健康检查失败: $($failedChecks -join ', ') — WARNING 不阻断流程，继续。" -ForegroundColor Yellow
        } elseif ($warnCount -gt 0) {
            Write-Host "[opsx-apply] 健康检查完成 ($warnCount 个 WARNING，0 个 FAIL) — WARNING 不阻断流程。" -ForegroundColor Yellow
        } else {
            Write-Host "[opsx-apply] 健康检查全部通过。" -ForegroundColor Green
        }
    } catch {
        # 健康检查脚本本身出错（如语法错误），输出警告但不阻断
        Write-Host "[opsx-apply] 健康检查执行异常: $_ — 跳过诊断，继续。" -ForegroundColor Yellow
    }
} else {
    Write-Host "[opsx-apply] 健康检查脚本不存在，跳过诊断。" -ForegroundColor DarkGray
}
```

## Schema / Config 一致性 Preflight（硬关卡）

```bash
# Unix / Git Bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../_shared/_xplat.sh"

# Windows PowerShell
# . "$PSScriptRoot\..\_shared\_xplat.ps1"

if ! test_schema_exists "openspec/config.yaml"; then
  echo "[opsx-apply] Schema 缺失，硬关卡触发。"
  echo "openspec/config.yaml 引用了 schema '$(get_schema_name "openspec/config.yaml")', 但目录不存在。"
  echo "排查：ls openspec/schemas/"
  echo "停止执行。"
  exit 1
fi
```

## Artifact Precondition（硬关卡）

```bash
# Unix / Git Bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../_shared/_xplat.sh"

# Windows PowerShell
# . "$PSScriptRoot\..\_shared\_xplat.ps1"

# 通过 xplat 检测文件是否存在
if [ ! -f "openspec/changes/<name>/repo-analysis.md" ] || \
   [ ! -f "openspec/changes/<name>/proposal.md" ] || \
   [ ! -f "openspec/changes/<name>/design.md" ] || \
   [ ! -f "openspec/changes/<name>/review.md" ] || \
   [ ! -f "openspec/changes/<name>/test-design.md" ] || \
   [ ! -f "openspec/changes/<name>/tasks.md" ]; then
  echo "[opsx-apply] 缺少前置 artifact（<文件名>），请先完成 /opsx-review 和 /opsx-test-design"
  exit 1
fi
```

**硬关卡：若任一 artifact 缺失：**
- 停止 apply
- 输出：`[opsx-apply] 缺少 artifact（<文件名>），请先完成 /opsx-review 和 /opsx-test-design`

## 增量验证：基于 git diff

> **原则：** 不依赖 Agent 预估的 files 字段，而是 task 完成后通过 `git diff --name-only` 获取实际改动的文件列表。

### 流程

```
task 完成 → git commit → git diff --name-only HEAD~1 → 计算受影响 layers → 执行增量验证
```

### 计算受影响 Layers

从 config.yaml 中的 layers 配置匹配文件路径（通过 xplat）：

```bash
# 获取 package_manager
PKG_MGR=$(get_package_manager "openspec/config.yaml")

# 获取受影响 layers
for file in $CHANGED_FILES; do
  for layer in engine backend editor runtime ui-skin; do
    paths=($(get_layer_paths "$layer" "openspec/config.yaml"))
    for p in "${paths[@]}"; do
      if [[ "$file" == "$p"* ]]; then
        AFFECTED_LAYERS+=("$layer")
        break 2
      fi
    done
  done
done
```

### 增量验证命令

从 config.yaml 中的 verify 配置读取命令（通过 xplat）：

```bash
# 获取对应 layer 的验证命令（xplat 自动降级）
VERIFY_CMD=$(get_verify_command "$LAYER" "typecheck" "openspec/config.yaml")

# 执行验证
invoke_verify "$LAYER" "typecheck" "openspec/config.yaml"
```

### 验证规则

- Incremental 验证失败 → **立即停止**，转 `openspec-debug`
- 不累积错误到结尾
- git 不可用时 → 降级为全量验证

## 执行流程

### 1. 选择 change

```bash
openspec status --change "<name>" --json
```

### 2. 读取任务状态

**优先读取 tasks.md checkbox 状态：**
- 扫描 tasks.md 中的 `- [ ]`、`- [x]`、`- [S]`

### 3. 解析 task 元数据

```html
<!-- opsx-meta
id: T1
layer: engine
verify:
  - unit-tests
dependencies:
  - type: task
    refs: []
  - type: change
    refs: []
    status_required: completed
-->
```

### 4. 检查依赖

```javascript
function checkDependencies(taskId, deps, checkboxState) {
  const blockers = [];
  // type=task：同一 tasks.md 内的前置 task
  for (const ref of deps.filter(d => d.type === 'task').flatMap(d => d.refs)) {
    if (checkboxState[ref] !== 'done') {
      blockers.push({ type: 'task', ref, current: checkboxState[ref] });
    }
  }
  // type=change：外部 change 的完成状态
  for (const dep of deps.filter(d => d.type === 'change')) {
    for (const changeName of dep.refs) {
      const extState = readExternalCheckbox(changeName);
      const required = dep.status_required || 'completed';
      if (!meetsStatus(extState, required)) {
        blockers.push({ type: 'change', ref: changeName, required, current: extState });
      }
    }
  }
  return blockers;
}
```

### 5. 按 layer 优先级排序

```
按 layer 优先级执行：engine > backend > editor > runtime > ui-skin > meta
```

### 6. 按排序后顺序执行

**单个 task 执行步骤：**
1. 执行 task 内容（代码改动）
2. Git commit（如 git 可用）
3. Git diff 获取实际文件（如 git 可用）
4. 计算受影响 layers
5. 执行增量验证
6. 更新 tasks.md checkbox：
   - 如成功：`- [ ]` → `- [x]`
   - 如失败：保持 `- [ ]`，输出一条简短的 error 摘要
7. 失败 → 转 openspec-debug

### 7. Full 验证（所有 tasks 完成后）

```bash
# 使用官方 CLI 执行全量验证（typecheck + test 已被整合）
openspec validate --all --json

# 输出解读：
# - valid: false → 硬关卡，禁止完成
# - valid: true + warnings → 警告，用户确认后可继续
# - invalid > 0 → 硬关卡，禁止完成
```

### 8. Test Failure Attribution（声明 + 条件阻断）

> **原则：先声明，声明不成立再硬停。**

```markdown
## Test Failure Attribution（强制声明）

**失败测试列表：**
| 测试名称 | 失败特征 | 在 git diff 覆盖范围内？ |

**归因分析（逐条，必须输出）：**
| 测试 | 归因级别 | 证据 |
|------|---------|------|
| [TC-xxx] | related / unrelated_proven / flaky_proven / undetermined | git diff / pre-existing / flaky 历史 |

**归因判定标准：**

| 级别 | 定义 | 后续动作 |
|------|------|---------|
| `related` | 测试在本次改动覆盖范围内 | 硬关卡：不得标记完成，必须修复 |
| `unrelated_proven` | 能用 git diff 证明不在覆盖范围 | 记录归因，继续 |
| `flaky_proven` | 已知 flaky，失败特征与历史一致 | 记录归因，继续 |
| `undetermined` | 无法明确证明无关 | **硬关卡：禁止给出"可以完成"结论** |

**如果存在 `undetermined` 或 `related`：**
- 输出：`[opsx-apply] Test Failure Attribution 阻断`
- **强制**进入 /opsx-debug 并附上归因分析

#### 量化决策树（三维打分制）

对每个失败的测试，按以下三个维度独立打分：

```
维度 1：文件覆盖（测试文件是否在 git diff 内？）
  1.0 — 测试文件完全在 git diff 范围内
  0.5 — 测试文件部分在 git diff 范围内（如通过共享模块间接关联）
  0.0 — 测试文件不在 git diff 范围内

维度 2：调用链关联（测试调用的函数是否被本次改动触及？）
  1.0 — 测试调用的核心函数在本次改动内
  0.5 — 测试调用的函数通过 >2 层间接调用链被改动影响
  0.0 — 无调用链关联

维度 3：失败特征匹配（错误信息是否与本次改动特征吻合？）
  1.0 — 错误信息指向本次改动的具体代码位置
  0.5 — 错误类型与本次改动涉及的类型/接口变化匹配
  0.0 — 错误类型与本次改动无关
```

**总分 = 维度1 + 维度2 + 维度3**

| 总分 | 归因等级 | 后续动作（meta 层） | 后续动作（非 meta 层） |
|------|---------|-------------------|---------------------|
| ≥ 2.0 | `related` | 硬关卡，必须修复 | 硬关卡，必须修复 |
| 1.0 ~ 1.5 | `undetermined` | **降级为 warning + 记录，继续** | 硬关卡，禁止完成 |
| ≤ 0.5 | `unrelated_proven` | 记录归因，继续 | 记录归因，继续 |
| 历史 flaky | `flaky_proven` | 记录归因，继续 | 记录归因，继续 |

#### 更新后的归因声明模板

```markdown
## Test Failure Attribution（强制声明）

**失败测试列表：**
|| 测试名称 | 维度1 | 维度2 | 维度3 | 总分 | 归因等级 |

**归因分析（逐条，必须输出）：**
|| 测试 | 归因级别 | 证据 | 维度得分 |
||------|---------|------|---------|
|| [TC-xxx] | related / unrelated_proven / flaky_proven / undetermined | git diff / 调用链 / 失败特征 | X/X/X |

**归因判定标准（量化）：**

|| 级别 | 总分 | 后续动作 |
||------|------|---------|
|| `related` | ≥ 2.0 | 硬关卡：不得标记完成，必须修复 |
|| `undetermined`（meta 层） | 1.0 ~ 1.5 | **降级：warning + 要求记录，继续执行** |
|| `undetermined`（非 meta 层） | 1.0 ~ 1.5 | **硬关卡：禁止给出"可以完成"结论** |
|| `unrelated_proven` | ≤ 0.5 | 记录归因，继续 |
|| `flaky_proven` | — | 记录归因，继续 |

**如果存在 `undetermined`（非 meta 层）或 `related`：**
- 输出：`[opsx-apply] Test Failure Attribution 阻断`
- **强制**进入 /opsx-debug 并附上归因分析

**meta 层 undetermined 降级输出格式：**
- 输出：`[opsx-apply] WARNING: undetermined attribution (meta layer) - <测试名> - 维度得分: X/X/X`
- 要求：在归因分析表中记录原因，供后续审查
```

### 9. 大 task 拆分判断

```
拆分条件（满足任一）：
├─ 预判需修改 >5 个文件
├─ 跨越 >3 个子模块

拆分方向：
├─ 能否独立运行一个最小功能？ → 拆成 T1a + T1b + T1c
├─ 是否有明确的先后依赖？ → 按依赖顺序拆成独立 task
└─ 是否涉及多个 layer？ → 按 layer 拆分
```

### 模式 B：跳过模式（`--skip <task-id>`）

#### 1. 确定 change 和 task

```bash
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

|| Task | 原因 | 日期 |
||------|------|------|
|| T3 | 需求变更，不再需要 | 2026-04-19 |
```

### 模式 C：中止模式（`--skip --change`）

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
# 在 proposal.md frontmatter 的 status 字段后追加 abandoned 状态
# 使用 awk 跨平台实现（sed -i 在原生 PowerShell 中不可用）
awk '
/^status:/ && !added {
    print $0
    print "abandoned_reason: \"xxx\""
    print "abandoned_date: \"2026-04-19\""
    added = 1
    next
}
{ print }
' "openspec/changes/<name>/proposal.md" > "openspec/changes/<name>/proposal.md.tmp" && \
  mv "openspec/changes/<name>/proposal.md.tmp" "openspec/changes/<name>/proposal.md"
```

### 模式 D：续传模式（无参数，自动检测）

#### 1. 检测 active changes

```bash
openspec list --json
```

#### 2. 找到断点

```javascript
function findResumePoint(tasks) {
  for (const task of tasks) {
    if (task.status === 'todo') {
      const blockers = checkDependencies(task, tasks);
      if (blockers.length === 0) {
        return task;
      }
    }
  }
  return null;
}
```

#### 3. 显示续传摘要

```
## Continue 摘要 — <change-name>

当前进度：N/N tasks 完成（N 个跳过）

上次中断位置：T3
上次中断原因：[从上下文推断或询问用户]

断点任务：T3: [任务描述]
  Layer: engine
  Verify: unit-tests
  Dependencies: none

从 T3 继续执行...

继续前请确认：
- [ ] 上次中断的上下文已清晰
- [ ] 无需要重新评估的任务
- [ ] 代码状态正常（无残留修改）

输入 "continue" 开始续传，或输入 task-id 跳转到其他 task。
```

#### 4. 执行续传

复用执行模式的逻辑，从断点 task 继续：
```
1. 执行当前 task（T3）
2. Git commit
3. 增量验证
4. 更新 checkbox
5. 继续下一个 task（T4）
6. ... 直到所有 tasks 完成或遇到 blocker
```

## Guardrails

- **强制**每个 task 完成后执行 git commit（git 可用时）
- **强制**增量验证基于实际改动的文件（git diff），不依赖预估的 files 字段
- **强制**失败时转 openspec-debug，提供错误输出
- **强制**每个 task 完成后立即增量验证，不累积到结尾
- **强制**执行前检查 dependencies 依赖
- **强制**按 layer 优先级排序（engine > backend > editor > runtime > ui-skin > meta）
- **强制**apply 开始前验证所有 artifacts 存在，缺失则阻断
- **强制**测试失败时执行 Test Failure Attribution 并输出归因分析
- **强制**存在 `related` 或 `undetermined` 时必须转 /opsx-debug
- **强制**调用 CLI 前必须执行 Schema Preflight（通过 xplat 函数，详见 SHARED-LAYERS.md）
- **强制**续传模式下有多于 1 个 active change 时必须列出供用户选择
- **强制**跳过 task 必须记录原因（写入 tasks.md 注释）
- **强制**中止 change 前必须确认用户已 commit 保留代码
- **禁止**在 apply 阶段探索代码库
- **禁止**跳过增量验证
- **禁止**忽略 layer 优先级
- **禁止**在 CLI 输出异常时放弃，应使用 fallback
- **禁止**忽略 blocked dependencies
- **禁止**未完成归因声明就自行判断"与本次 change 无关"
- **禁止**续传模式下跳过任何 checkbox 状态为 todo 的 task
- **禁止**内联 bash/grep/sed 脚本片段（使用 xplat 函数，详见 SHARED-LAYERS.md）
