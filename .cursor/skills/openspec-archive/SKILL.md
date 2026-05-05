---
name: openspec-archive
description: 归档已完成的 OpenSpec change。
version: "5.3"
category: archive
tags:
  - openspec
  - layer:meta
aliases:
  - /opsx:archive
depends_on:
  - openspec-verify
permissions: []
risks: []
verify:
  - typecheck
---

> **前置共享片段：** 配置规范见 [../_shared/SCHEMA.md](../_shared/SCHEMA.md)。

## Profile-Based Gating

Read profile at start:

```bash
PROFILE=$(get_config_value "opsx.profile" "openspec/config.yaml" "core-light")
REQUIRE_VERIFY=$(get_config_value "opsx.gates.archive_requires_verify" "openspec/config.yaml" "false")
```

| Profile | verify gate |
|---------|------------|
| `core-light` (default) | false — archive without verify is allowed |
| `strict-review` | true |
| `enterprise` | true |

When `REQUIRE_VERIFY=false`: show a warning but allow archive even if verify was not run.
When `REQUIRE_VERIFY=true`: block archive if verify was not passed.

## 核心职责

> **v4.0 变更：** changelog 生成改为可选（由 config.yaml 控制），路径可配置。

1. 确认用户已确认（最后一次人工检查点）
2. 检查 git 工作区干净度
3. 调用官方 CLI
4. 显示归档摘要

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
  echo "[opsx-archive] Schema Preflight 失败。停止执行。"
  exit 1
fi
```

### 2. 检查完成状态

> State truth source: CLI first, then tasks.md checkbox.

```bash
# Preferred: use official CLI
openspec status --change "<name>" --json | jq '.tasks[] | select(.status != "done" and .status != "skipped") | .id'

# Fallback: read tasks.md
```

### 3. Git 工作区检查

```bash
# 通过 xplat 层检测 git 状态
if test_command_exists "git" && [ -d ".git" ]; then
  git_status=$(git status --porcelain)
  if [ -n "$git_status" ]; then
    echo "[opsx-archive] 警告：git 工作区有未提交改动。"
    echo "请先 commit 或确认不需要保留的改动。"
    echo ""
    echo "改动内容："
    echo "$git_status"
  fi
fi
```

### 4. 用户最终确认

```
## Archive 最终确认 — <change-name>

tasks.md checkbox 确认：所有 task 为 - [x]（done）或 - [S]（skipped）

请确认：
- [ ] 所有代码改动已 commit
- [ ] verify 阶段已通过（profile: %PROFILE%）
- [ ] 没有需要保留的未提交改动

输入 "archive" 完成归档，或输入 "cancel" 取消。
```

### 4.1 verify 失败时的强制归档路径（profile-aware）

当 `REQUIRE_VERIFY=true` 且 verify 未通过时：

```
## Archive 最终确认 — <change-name>

警告：verify 未通过（存在 undetermined 或 related 测试）。

可选操作：
1. [ ] 强制归档（跳过 coherence 检查）
   - 输入 "force-archive" 确认强制归档
2. [ ] 返回 /opsx:apply 修复
   - 输入 "apply" 返回 /opsx:apply
3. [ ] 取消归档
   - 输入 "cancel"

强制归档说明：
- 将跳过 coherence-lite 检查
- 必须在 proposal.md 中记录强制归档原因
- 追加字段：force_archive_reason, force_archive_date
```

当 `REQUIRE_VERIFY=false`（core-light profile）时：
- 显示 verify 警告但不阻断
- 用户可选择 archive 或返回 apply

**强制归档时追加 proposal.md 字段：**

```yaml
---
# 在 proposal.md frontmatter 中追加
force_archive_reason: "测试 [TC-xxx] 归因为 undetermined，决策：接受风险强制归档"
force_archive_date: "YYYY-MM-DD"
---
```

### 5. 调用官方 CLI

```bash
openspec archive <name> --yes
```

> **注意：** `<name>` 是位置参数，不是 `--change <name>`。

### 6. 显示摘要

```
## Archive 摘要 — <change-name>

归档位置：openspec/changes/archive/<date>-<name>/
specs 同步状态：✓ 已更新

下一步：
- 运行 /opsx:propose 开始新 change
```

### 6.1 查看已归档 change 的内容

> **注意：** CLI 的 `openspec show` 只在 `openspec/changes/` 中查找，archive 后目录移入 `archive/`，CLI 无法直接 show。这是上游设计行为，Skill 层提供 workaround。详见 [archive-guide.md](../../openspec/docs/archive-guide.md)。

## changelog 生成（可选）

> 从 config.yaml 中的 `archive.generate_changelog` 字段控制，默认 false。

```yaml
archive:
  generate_changelog: true
  changelog_dir: docs/changelogs/
```

## Guardrails

- **禁止**手搓 `mkdir` + `mv` 命令
- **强制**使用官方 `openspec archive` 命令
- **强制**在归档前检查 git 工作区
- **强制**无 git commit 时提示用户先 commit 再归档
- **强制**在归档前调用 verify（由 depends_on 保证）
- **强制**verify 失败时必须显示决策分支（强制归档 / 返回 apply / 取消）
- **强制**强制归档必须记录原因（追加到 proposal.md）
- **禁止**在 archive 阶段重复执行 verify 的 coherence-lite checklist（职责分离）
- **强制**状态检查以 tasks.md checkbox 为准（不是 tasks-state.json）
- **强制**profile-aware：core-light 下 verify 未运行只警告，不阻断 archive
- **禁止**内联 bash/grep/sed 脚本片段（使用 xplat 函数，详见 SHARED-LAYERS.md）
