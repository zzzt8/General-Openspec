---
name: _shared-layers
description: OpenSpec Skill 共享层。从 openspec/config.yaml 读取 layer 映射和验证命令，实现项目无关化。
---

# Shared Layers — xplat 版本

> **v5.3 变更：** 模板路径修正；Schema Preflight Windows 路径拼接修复。
> 前置共享片段：参数化配置规范见 [SCHEMA.md](./SCHEMA.md)。

## Layer 优先级

```
engine > backend > editor > runtime > ui-skin > meta
```

## xplat 层初始化

```bash
# Unix / Git Bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/_xplat.sh"

# Windows PowerShell
# (在 skill 执行上下文中通过 . 引用)
. "$PSScriptRoot\..\_shared\_xplat.ps1"
```

## 配置读取（通过 xplat）

```bash
# 读取 package_manager
PKG_MGR=$(get_package_manager "openspec/config.yaml")
# 或（Windows）: $PKG_MGR = Get-PackageManager

# 读取 layers 映射
LAYERS_ENGINE=($(get_layer_paths "engine" "openspec/config.yaml"))

# 读取验证命令
VERIFY_ENGINE_TYPECHECK=$(get_verify_command "engine" "typecheck" "openspec/config.yaml")
VERIFY_ENGINE_TEST=$(get_verify_command "engine" "test" "openspec/config.yaml")
VERIFY_DEFAULT_TYPECHECK=$(get_verify_command "default" "typecheck" "openspec/config.yaml")
VERIFY_DEFAULT_TEST=$(get_verify_command "default" "test" "openspec/config.yaml")
```

## Layer 检测算法

根据 `git diff --name-only` 的结果匹配 config.yaml 中的路径：

```javascript
function detectLayers(changedFiles, config) {
  const layers = new Set();
  const layerPaths = config?.layers || {};

  for (const file of changedFiles) {
    for (const [layer, paths] of Object.entries(layerPaths)) {
      if (paths && paths.some(p => file.startsWith(p))) {
        layers.add(layer);
      }
    }
  }

  return layers.size > 0 ? [...layers] : ['default'];
}
```

**无法判断时的降级策略：** 如果 git diff 结果无法匹配任何 layer，视为 `default` 层，执行全量验证。

## 增量验证策略

### 规则

```
1. 每个 task 完成后执行 git commit
2. git diff --name-only HEAD~1 获取实际改动文件
3. 匹配 config.yaml 中的 layer 路径，获取受影响 layers
4. 按受影响 layers 执行增量验证
5. 增量验证失败 → 立即停止，转 openspec-debug
6. 无法判断 layer → 降级为全量验证
```

### 按 Layer 执行增量验证

```bash
# 读取配置中的验证命令（通过 xplat）
VERIFY_CMD=$(get_verify_command "$LAYER" "typecheck" "openspec/config.yaml")

# 执行验证（通过 xplat）
invoke_verify "$LAYER" "typecheck" "openspec/config.yaml"
```

### Layer → verify 映射

| Layer | typecheck | test |
|-------|-----------|------|
| engine | `verify.engine.typecheck` | `verify.engine.test` |
| backend | `verify.backend.typecheck` | `verify.backend.test` |
| editor | `verify.editor.typecheck` | `verify.editor.test` |
| runtime | `verify.runtime.typecheck` | `verify.runtime.test` |
| ui-skin | `verify.ui-skin.typecheck` | `verify.ui-skin.test` |
| meta | `verify.default.typecheck` | `verify.default.test` |
| default | `verify.default.typecheck` | `verify.default.test` |

## 全量验证

```bash
# 通过 xplat 读取配置并执行
PKG_MGR=$(get_package_manager "openspec/config.yaml")
invoke_verify "default" "typecheck" "openspec/config.yaml"
invoke_verify "default" "test" "openspec/config.yaml"
```

## Git 检查（通过 xplat）

```bash
# 检查命令可用性
if test_command_exists "git" && [ -d ".git" ]; then
  HAS_GIT=1
else
  HAS_GIT=0
  echo "[opsx] 警告：未找到 git，增量验证不可用，将执行全量验证。"
fi

# 获取改动文件（通过 xplat）
if [ $HAS_GIT -eq 1 ]; then
  CHANGED_FILES=($(get_git_changed_files 1))
fi
```

## Windows 用户注意事项

> PowerShell 5.1 不支持 bash 风格的 `&&` 和 `||` 操作符。
> Skill 文档中的 bash 代码块（用 `` ```bash ```` 标记）中的命令由 Skill 系统自动通过 `_xplat.ps1` 执行，用户无需手动复制。
> 如需手动测试，请将 bash 链式命令中的 `&&` 替换为 `;`，例如：
>
> ```powershell
> # bash（原）
> test_command_exists "git" && [ -d ".git" ] && echo "git found"
>
> # PowerShell（等效）
> test_command_exists "git"; if (Test-Path ".git") { echo "git found" }
> ```
>
> 详见 [_xplat.ps1](../_shared/_xplat.ps1) 顶部的注释。

## 验证命令执行策略

```
┌─────────────────────────────────────────────┐
│  Task 完成 → Git commit                      │
│  ↓                                           │
│  Git diff 获取改动文件列表                     │
│  ↓                                           │
│  匹配 config.yaml layers 路径                 │
│  ↓                                           │
│  获取对应 layer 的验证命令                     │
│  ↓                                           │
│  执行验证（typecheck + test）                  │
│  ↓                                           │
│  失败？→ openspec-debug                       │
│  成功？→ 继续下一个 task                      │
└─────────────────────────────────────────────┘

降级路径：
无法判断 layer → 使用 verify.default
verify 命令为空 → 使用 pnpm typecheck / pnpm test
git 不可用 → 直接全量验证
```

## 相关文件

- [SCHEMA.md](./SCHEMA.md) — 参数化配置规范
- [SKILL-INDEX.md](./SKILL-INDEX.md) — 完整 Skill 索引
