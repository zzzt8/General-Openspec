# OpenSpec Skills

> **v5.3** | AI Agent Skills for OpenSpec-based spec-driven development.
> 项目无关：所有配置从 `openspec/config.yaml` 读取。

## Structure

```
.cursor/skills/
├── _shared/
│   ├── SCHEMA.md              # Skill 元数据规范
│   ├── SHARED-LAYERS.md       # Layer 映射（从 config.yaml 读取）
│   ├── SKILL-INDEX.md         # 自动生成的 skill 索引
│   ├── GENERATE-INDEX.js      # 索引生成脚本（v4.0）
│   ├── GENERATE-CONFIG.js     # config.yaml 生成脚本（v5.1）
│   ├── _xplat.ps1             # Windows 跨平台抽象层
│   └── _xplat.sh              # Unix 跨平台抽象层
│
├── openspec-onboard/          # onboard    项目初始化
├── openspec-sync/             # sync       CLI / config 同步
├── openspec-sync-specs/       # sync       delta specs 同步到 main
├── openspec-explore/          # explore    探索代码库
├── openspec-propose/          # propose    创建 change（一次性生成）
├── openspec-plan/             # meta       多 change 编排（非默认）
├── openspec-skip/             # skip       跳过 task / 中止 change
├── openspec-apply/            # apply      实现 tasks
├── openspec-apply-change/     # apply      实现 change 任务（委托 openspec-apply）
├── openspec-continue/         # apply      断点续传（委托 openspec-apply）
├── openspec-continue-change/  # apply      创建下一 artifact（委托 openspec-continue）
├── openspec-verify/           # verify     验证实现一致性
├── openspec-verify-change/    # verify     验证 change（委托 openspec-verify）
├── openspec-review/           # review     设计评审
├── openspec-archive/          # archive    归档 change
├── openspec-archive-change/   # archive    归档 change（委托 openspec-archive）
├── openspec-debug/            # debug      调试 apply 阶段问题
├── openspec-skill/            # meta       Skill 系统维护（不默认暴露）
└── openspec-test-design/      # verify     测试用例设计（TDD 视角）
```

共 **19 个 skill**，按 category 分为 13 类（见下表）。

> Category 数量由 GENERATE-INDEX.js 动态统计（每次运行 `node GENERATE-INDEX.js` 时更新）。

## Category 排序（来自 GENERATE-INDEX.js v4.0）

排序遵循工作流顺序：初始化 → 同步 → 探索 → 提案 → 元操作 → 实现 → 跳过 → 验证 → 归档 → 调试。

| Category | 排序 | Skills |
|----------|------|--------|
| `onboard` | 1 | `openspec-onboard` |
| `sync` | 2 | `openspec-sync`, `openspec-sync-specs` |
| `explore` | 3 | `openspec-explore` |
| `propose` | 4 | `openspec-propose` |
| `meta` | 5 | `openspec-plan`, `openspec-skill` |
| `apply` | 6 | `openspec-apply`, `openspec-continue` |
| `skip` | 7 | `openspec-skip` |
| `verify` | 8 | `openspec-verify` |
| `archive` | 9 | `openspec-archive` |
| `debug` | 10 | `openspec-debug` |
| `review` | 11 | `openspec-review` |
| `test-design` | 12 | `openspec-test-design` |
| `other` | 13 | `openspec-apply-change`, `openspec-archive-change`, `openspec-continue-change`, `openspec-verify-change` |

## 常用 Skill 快速索引

| 命令 | Skill | 用途 |
|------|-------|------|
| `/opsx-onboard` | `openspec-onboard` | 初始化新项目 |
| `/opsx-propose` | `openspec-propose` | 一次性生成完整 proposal + design + tasks |
| `/opsx-apply` | `openspec-apply` | 实现 tasks，逐项勾选进度 |
| `/opsx-continue` | `openspec-continue` | 从断点恢复，继续实现 |
| `/opsx-verify` | `openspec-verify` | 验证实现与 artifacts 一致性 |
| `/opsx-archive` | `openspec-archive` | 归档完成的 change |
| `/opsx-review` | `openspec-review` | 设计评审 |
| `/opsx-debug` | `openspec-debug` | 调试 apply 阶段问题 |

## 工具脚本

### GENERATE-INDEX.js（v4.0）

扫描 `.cursor/skills/` 下所有 SKILL.md，解析 YAML frontmatter，按 category 分组生成 `SKILL-INDEX.md`。

```bash
node .cursor/skills/_shared/GENERATE-INDEX.js
```

输出示例：

```
Generated: ...SKILL-INDEX.md
Found 19 skills in 10 categories
  onboard: openspec-onboard
  sync: openspec-sync, openspec-sync-specs
  explore: openspec-explore
  ...
```

**何时运行**：添加新 skill 后、或修改了 frontmatter 字段（category/aliases/tags/depends_on）后。

### GENERATE-CONFIG.js（v5.1）

扫描项目目录，生成 `openspec/config.yaml`。支持差量合并模式（`--merge-existing`），保留原文件所有字段。

```bash
# 交互模式（自动检测项目类型）
node .cursor/skills/_shared/GENERATE-CONFIG.js

# 交互模式 + 差量合并（保留原有字段，只更新 layers 块）
node .cursor/skills/_shared/GENERATE-CONFIG.js --merge-existing

# 静默模式（使用默认值）
node .cursor/skills/_shared/GENERATE-CONFIG.js --non-interactive --template auto
```

**何时运行**：项目初始化后、或项目目录结构变化后（如新增 `packages/` 子包）。

## 配置

所有项目特定配置通过 `openspec/config.yaml` 提供：

```yaml
schema: default

layers:
  engine:
    - packages/engine/src/
  backend:
    - server/src/

verify:
  default:
    typecheck: pnpm typecheck
    test: pnpm test

package_manager: pnpm
```

## 维护

### 验证 Skill 格式

```bash
/opsx-skill validate
```

### 添加新 Skill

1. 在 `.cursor/skills/` 下创建 `openspec-<name>/` 目录
2. 创建 `SKILL.md`，包含符合 [SCHEMA.md](./_shared/SCHEMA.md) 的 YAML frontmatter
3. 运行 `node .cursor/skills/_shared/GENERATE-INDEX.js` 更新索引
