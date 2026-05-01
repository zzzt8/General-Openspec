---
name: openspec-sync
description: 同步 OpenSpec CLI 和 Skill 系统。生成/更新 config.yaml、同步 agent 指令、同步 schemas。
version: "5.3"
category: sync
tags:
  - openspec
  - layer:meta
aliases:
  - /opsx-sync
depends_on: []
permissions:
  - file-write
risks: []
verify: []
---

> **前置共享片段：** 配置规范见 [\_shared/SCHEMA.md](../_shared/SCHEMA.md)。

## 核心职责

同步 OpenSpec 系统的各个组件：
1. 更新 `openspec config`（同步 CLI 配置）
2. 重新生成 `openspec/config.yaml`（基于当前项目结构）
3. 调用 `openspec update`（同步 agent 指令）
4. 验证 Schema 一致性

## 使用方式

```bash
/opsx-sync              # 完整同步
/opsx-sync --config     # 仅同步 config.yaml
/opsx-sync --agents     # 仅同步 agent 指令
/opsx-sync --validate   # 仅验证一致性
```

## 执行流程

### 1. 前置检查

```bash
# Unix / Git Bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../_shared/_xplat.sh"

# Windows PowerShell
# . "$PSScriptRoot\..\_shared\_xplat.ps1"

# 1. 检查 openspec CLI
if ! test_command_exists "openspec"; then
  echo "[opsx-sync] 未找到 openspec CLI。请先安装：npm install -g @fission-ai/openspec@latest"
  exit 1
fi

# 2. 检查 openspec 目录
if [ ! -d "openspec" ]; then
  echo "[opsx-sync] OpenSpec 未初始化。请先运行 /opsx-onboard。"
  exit 1
fi
```

### 2. 同步 config.yaml

```bash
# Unix / Git Bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../_shared/_xplat.sh"

# Windows PowerShell
# . "$PSScriptRoot\..\_shared\_xplat.ps1"

# 保留已有 schema 和 package_manager（通过 xplat 读取）
EXISTING_SCHEMA=$(get_schema_name "openspec/config.yaml")
EXISTING_PKG_MGR=$(get_package_manager "openspec/config.yaml")

# 通过 GENERATE-CONFIG.js 重新生成（保留用户自定义字段）
node .cursor/skills/_shared/GENERATE-CONFIG.js --template auto --merge-existing

echo "[opsx-sync] config.yaml 已更新"
```

### 3. 同步 Agent 指令

```bash
openspec update
```

### 4. Schema 一致性验证（xplat）

```bash
# Unix / Git Bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../_shared/_xplat.sh"

# Windows PowerShell
# . "$PSScriptRoot\..\_shared\_xplat.ps1"

if ! test_schema_exists "openspec/config.yaml"; then
  echo "[opsx-sync] Schema 验证失败。"
  exit 1
fi

echo "[opsx-sync] Schema 验证通过"
```

### 5. 输出摘要

```
## Sync 摘要

| 项目 | 状态 |
|------|------|
| config.yaml | ✓ 已更新 |
| Agent 指令 | ✓ 已同步 |
| Schema | ✓ 验证通过 |

下一步：
- 编辑 openspec/config.yaml 调整 layers 和 verify 命令
- 运行 /opsx-explore 开始探索
```

## Guardrails

- **禁止**在未初始化的项目中运行（先运行 /opsx-onboard）
- **强制**保留用户已有的 schema 和 package_manager 配置
- **强制**同步后验证 Schema 一致性（通过 xplat 函数，详见 SHARED-LAYERS.md）
- **强制**config.yaml 同步使用 GENERATE-CONFIG.js 而非 heredoc（详见 SHARED-LAYERS.md）
- **禁止**同步过程中修改任何业务代码
- **强制**先检查 openspec CLI 是否安装（通过 xplat 函数）
- **禁止**内联 bash/grep/sed 脚本片段（使用 xplat 函数，详见 SHARED-LAYERS.md）
