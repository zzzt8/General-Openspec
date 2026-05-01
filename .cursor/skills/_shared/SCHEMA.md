---
name: _schema
description: OpenSpec Skill 系统配置规范。定义从 openspec/config.yaml 读取的运行时参数，实现项目无关化。
---

> **v5.3 核心变更：** 模板路径修正（review/test-design 移至 schema 根目录）；Schema Preflight Windows 路径拼接修复；模板文件添加 frontmatter；新增 Q7 FAQ。
---

# OpenSpec Skill 配置规范

> **v5.0 核心变更：** 所有项目特定配置从 `openspec/config.yaml` 读取，Skills 本身不再硬编码任何项目路径、包名、验证命令。**所有可执行脚本通过 xplat 抽象层跨平台化。**

## 设计原则

```
1. Skills 永远是通用的 — 不含任何项目特定路径
2. openspec/config.yaml 是运行时配置 — 提供项目参数
3. 无 config.yaml 时使用硬编码默认值（兼容旧项目）
4. Schema Preflight 阶段统一读取所有配置
5. 所有可执行脚本通过 _xplat.ps1 / _xplat.sh 跨平台化（v5.0）
```

## 配置读取规范

> **v5.0：** 所有可执行脚本片段移至 `SHARED-LAYERS.md`。本节仅保留概念说明和 YAML 格式示例。

### config.yaml 标准格式（项目根目录）

```yaml
schema: default

layers:
  engine:
    - packages/workflow-core/src/
    - packages/image-ops/src/
    - packages/node-definitions/src/
  backend:
    - server/src/
    - server/prisma/
  editor:
    - apps/dev-tool/src/
  runtime:
    - apps/user-app/src/
  ui-skin:
    - packages/shared-ui/src/

verify:
  engine:
    typecheck: pnpm typecheck --filter=@prism/workflow-core --filter=@prism/image-ops --filter=@prism/node-definitions
    test: pnpm test --filter=@prism/workflow-core --filter=@prism/image-ops
  backend:
    typecheck: pnpm typecheck --filter=@prism/server
    test: pnpm test --filter=@prism/server
    migrate: pnpm --filter=@prism/server exec prisma migrate status
  editor:
    typecheck: pnpm typecheck --filter=@prism/dev-tool
    test: pnpm test --filter=@prism/dev-tool
  runtime:
    typecheck: pnpm typecheck --filter=@prism/user-app
    test: pnpm test --filter=@prism/user-app
  ui-skin:
    typecheck: pnpm typecheck --filter=@prism/shared-ui
  default:
    typecheck: pnpm typecheck
    test: pnpm test

openspec:
  changes_dir: openspec/changes
  archive_dir: openspec/changes/archive
  specs_dir: openspec/specs
  schema_dir: openspec/schemas

package_manager: pnpm  # pnpm | npm | yarn | bun
```

### 默认值（config.yaml 不存在时）

```yaml
schema: default

layers:
  engine: []
  backend: []
  editor: []
  runtime: []
  ui-skin: []

verify:
  default:
    typecheck: pnpm typecheck
    test: pnpm test

openspec:
  changes_dir: openspec/changes
  archive_dir: openspec/changes/archive
  specs_dir: openspec/specs
  schema_dir: openspec/schemas

package_manager: pnpm
```

## Layer 执行优先级

```
engine > backend > editor > runtime > ui-skin > meta
```

### Layer 检测算法

从 git diff 文件列表推断受影响 layers：

```javascript
function detectLayers(changedFiles, config) {
  const layers = new Set();
  const layerPaths = config.layers || {};

  for (const file of changedFiles) {
    for (const [layer, paths] of Object.entries(layerPaths)) {
      if (paths.some(p => file.startsWith(p))) {
        layers.add(layer);
      }
    }
  }

  // 无法判断时降级为全量
  if (layers.size === 0) {
    return ['default'];
  }
  return [...layers];
}
```

## Schema Preflight（统一硬关卡）

> **v5.0：** 通过 xplat 层执行，详见 [SHARED-LAYERS.md](./SHARED-LAYERS.md)。

所有操作类 Skill（propose/apply/verify/archive）必须先执行此检查：

```bash
# Unix / Git Bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../_shared/_xplat.sh"

# Windows PowerShell
# . "$PSScriptRoot\..\_shared\_xplat.ps1"

if ! test_schema_exists "openspec/config.yaml"; then
  echo "[opsx] Schema Preflight 失败。停止执行。"
  exit 1
fi
```

检查项：
1. `openspec/` 目录存在
2. `openspec/config.yaml` 存在
3. `schema` 字段引用的 schema 目录存在于 `openspec/schemas/`
4. `schema.yaml` 文件存在

## Task 元数据 Schema

每个 task 必须包含 `<!-- opsx-meta -->` 块：

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

### 字段规范

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | ✓ | 任务唯一标识 |
| `layer` | string | ✓ | engine / backend / editor / runtime / ui-skin / meta |
| `verify` | string[] | ✓ | unit-tests / golden-fixture / api-tests / smoke-test / visual-check / typecheck |
| `dependencies` | array | | 统一依赖模型 |

### verify 取值

| 值 | 说明 |
|----|------|
| `unit-tests` | 运行对应模块的单元测试 |
| `golden-fixture` | 比对 golden fixture 文件 |
| `api-tests` | 运行 API 集成测试 |
| `smoke-test` | 冒烟测试 |
| `visual-check` | 需要人工视觉检查 |
| `typecheck` | TypeScript 类型检查 |

### 统一依赖模型

```yaml
dependencies:
  - type: task      # 同一 tasks.md 内的前置 task
    refs: ["T1", "T2"]
  - type: change    # 外部 change 的完成状态
    refs: ["C1-mapper-contract"]
    status_required: completed  # 可选，默认 completed
```

| type | refs | status_required | 含义 |
|------|------|----------------|------|
| `task` | `["T1", "T2"]` | — | 必须等这些 task done 才能开始 |
| `change` | `["C1"]` | `completed` | 必须等这些 change 完成才能开始 |
| `change` | `["C1"]` | `in-progress` | 必须等这些 change 至少开始才能开始 |

## 状态真相源

> Task 状态以 tasks.md checkbox 为主（`- [ ]` / `- [x]`），tasks-state.json 仅作兼容参考。

## CLI 命令规范

| 操作 | 命令 |
|------|------|
| 初始化 | `openspec init` |
| 列出 changes | `openspec list --json` |
| 查看状态 | `openspec status --change "<name>" --json` |
| 新建 change | `openspec new change "<name>"` |
| 归档 | `openspec archive --change "<name>" --yes` |
| 更新 agent 指令 | `openspec update` |
| 同步配置 | `openspec config profile` |

## 兼容性检查

> **v5.0：** 通过 xplat 函数执行。

```bash
# Unix / Git Bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../_shared/_xplat.sh"

# Windows PowerShell
# . "$PSScriptRoot\..\_shared\_xplat.ps1"

# 检查 Node.js 版本
if ! test_command_exists "node"; then
  echo "[opsx] 未找到 Node.js。"
  exit 1
fi

# 检查 openspec CLI（可选）
if ! test_command_exists "openspec"; then
  echo "[opsx] 警告：未找到 openspec CLI。某些功能可能不可用。"
fi

# 检查 git（可选）
if ! test_command_exists "git"; then
  echo "[opsx] 警告：未找到 git，增量验证功能不可用。"
fi
```

## 相关文件

- [SHARED-LAYERS.md](./SHARED-LAYERS.md) — Layer 映射和验证命令
- [SKILL-INDEX.md](./SKILL-INDEX.md) — 完整 Skill 索引

---

## Cross-Platform Compliance（v5.0）

> **v5.0 强制要求：** 所有 executable script 片段（grep/sed/heredoc）必须通过 xplat 抽象层实现。
> Windows + PowerShell 环境和 Unix + bash 环境必须等价运行。

### xplat 函数接口

所有 skill 脚本通过 `source` 引用跨平台抽象层：

```bash
# Unix / Git Bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../_shared/_xplat.sh"

# Windows PowerShell
. "$PSScriptRoot\..\_shared\_xplat.ps1"
```

**必须使用的 xplat 函数：**

| 函数 | 用途 | 必需 |
|------|------|------|
| `Get-ConfigValue` / `get_config_value` | 读取 config.yaml | ✓ |
| `Get-LayerPaths` / `get_layer_paths` | 读取 layer 路径 | ✓ |
| `Get-VerifyCommand` / `get_verify_command` | 读取验证命令 | ✓ |
| `Invoke-Verify` / `invoke_verify` | 执行验证 | ✓ |
| `Test-CommandExists` / `test_command_exists` | 检测命令可用性 | ✓ |
| `Test-SchemaExists` / `test_schema_exists` | Schema Preflight | ✓ |

### 职责边界

|| 文件 | 职责 |
||------|------|
|| `SCHEMA.md` | 概念定义、YAML 格式规范、默认值、CLI 命令契约、**Cross-Platform Compliance 声明** |
|| `SHARED-LAYERS.md` | 跨平台可执行脚本（xplat 化后）、layer 检测算法、验证命令映射 |

### 禁止事项

- **禁止**在 skill 中内联 bash/grep/sed 脚本片段（改用 xplat 函数）
- **禁止**在 `openspec/` 目录修改 schema 定义文件（仅修改 `.cursor/skills/`）
- 所有 config.yaml 读取操作必须经过 xplat 层
