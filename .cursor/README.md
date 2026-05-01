# .cursor Skills

> **v5.3** | OpenSpec Skill System

## 13 个命令

|| 命令 | Skill | 作用 |
||------|-------|------|
|| `/opsx-onboard` | `openspec-onboard` | 初始化 OpenSpec（新项目） |
|| `/opsx-sync` | `openspec-sync` | 同步 CLI 和 Skill 系统 |
|| `/opsx-explore` | `openspec-explore` | 探索代码库，澄清需求 |
|| `/opsx-propose` | `openspec-propose` | 创建 change（首次调用时自动初始化） |
|| `/opsx-review` | `openspec-review` | 设计评审，检查 design 决策合理性 |
|| `/opsx-apply` | `openspec-apply` | 实现 tasks（含断点续传、跳过、中止） |
|| `/opsx-verify` | `openspec-verify` | Full 验证 + coherence-lite |
|| `/opsx-archive` | `openspec-archive` | 归档完成的 change |
|| `/opsx-debug` | `openspec-debug` | 诊断错误，提供修复方案 |
|| `/opsx-plan` | `openspec-plan` | 多 change 编排（非默认能力） |
|| `/opsx-skip` | `openspec-skip` | 跳过 task / 中止 change |
|| `/opsx-continue` | `openspec-continue` | 断点续传（别名，委托 apply） |
|| `/opsx-skill` | `openspec-skill` | Skill 系统维护（不默认暴露） |

---

## 安装 OpenSpec CLI

在使用 skill 系统前，需要安装 OpenSpec CLI：

```bash
# 通过 npm 安装（推荐）
npm install -g @fission-ai/openspec@latest

# 或通过 pnpm
pnpm add -g @fission-ai/openspec@latest
```

验证安装成功：

```bash
openspec --version
# 应输出类似：openspec/1.3.1
```

> **注意**：本项目为 OpenSpec Skill 系统的元项目，本身不包含实际业务代码包。
> `openspec/config.yaml` 中的 verify 命令使用桩命令（echo），不影响 Skill 系统正常运行。
> 实际项目请替换为真实验证命令。

---

## 快速开始

### 1. 在新项目中初始化

首次运行 `/opsx-propose` 时，如检测到 `openspec/` 目录不存在，会自动：

- 安装 OpenSpec CLI（如未安装）
- 运行 `openspec init`
- 生成 `openspec/config.yaml`（基于项目结构推断 layers）
- 生成 `openspec/schemas/spec-driven/` schema

### 2. 调整配置（可选）

编辑 `openspec/config.yaml` 调整 layers 映射和验证命令：

```yaml
layers:
  engine:
    - packages/engine/src/
    - packages/core/src/
  backend:
    - server/src/

verify:
  engine:
    typecheck: pnpm typecheck --filter=@myproject/engine
    test: pnpm test --filter=@myproject/engine
  default:
    typecheck: pnpm typecheck
    test: pnpm test

package_manager: pnpm
```

### 3. 开始工作流

```
/opsx-propose <name>  → 创建 change
/opsx-review           → 评审 design 决策
/opsx-apply           → 实现 tasks
/opsx-verify          → 验证实现一致性
/opsx-archive         → 归档完成的 change
```

---

## Change 生命周期

```
┌─────────────────────────────────────────────────────────┐
│  /opsx-propose <name>                                  │
│  自动检测初始化 → 推断 change_class → 生成 artifacts    │
│  ↓                                                      │
│  /opsx-review                                          │
│  结构分析闭环 → 评审 design 决策                        │
│  ↓                                                      │
│  /opsx-apply                                           │
│  按 layer 优先级执行 → 增量验证 → 断点续传             │
│  ↓ 遇到问题                                             │
│  /opsx-debug                                           │
│  诊断 → 修复 → 继续 apply                              │
│  ↓ 所有 task 完成                                       │
│  /opsx-verify                                          │
│  Full + coherence-lite                                  │
│  ↓ 全部通过                                             │
│  /opsx-archive                                         │
│  最终确认 → 归档                                         │
└─────────────────────────────────────────────────────────┘
```

### 规划路径（非默认）

```
/opsx-plan <expert-doc>   → 解析专家报告 → 产出 change-index
/opsx-plan --derive        → 按依赖顺序批量创建子 change
```

---

## 关键概念

### change_class 风险分层

|| 条件 | change_class | 触发动作 |
||------|-------------|---------|
|| 仅样式/文案/UI 布局 | `low` | 跳过 review checklist；测试并入 tasks |
|| 触及 store / API contract / engine 层 | `high` | 插入 review checklist + 独立测试章节 |

### Layer 执行优先级

```
engine > backend > editor > runtime > ui-skin > meta
```

### 状态真相源

Task 状态以 `tasks.md` checkbox 为主：
- `- [ ]` → todo
- `- [x]` → done
- `- [S]` → skipped

---

## 迁移到新项目

将整个 `.cursor` 文件夹复制到新项目根目录：

```bash
cp -r .cursor /path/to/new-project/
```

首次运行 `/opsx-propose` 时会自动完成初始化。

---

## Skill 系统维护

Skill 系统本身也由 OpenSpec 驱动。如需维护 skills：

```bash
# 重新生成索引（添加/删除 skill 后执行）
node .cursor/skills/_shared/GENERATE-INDEX.js

# 验证所有 skills 格式
# 检查 .cursor/skills/_shared/SKILL-INDEX.md
```

### v5.0 改进摘要

|| 改进项 | 说明 |
||--------|------|
|| **跨平台抽象层** | 新增 `_xplat.ps1`（Windows）和 `_xplat.sh`（Unix），所有 skill 不再内联 bash 语法 |
|| **统一配置生成器** | 新增 `GENERATE-CONFIG.js`，消除 onboard/propose/sync 三处重复的 heredoc 逻辑 |
|| **Schema 职责边界** | `SCHEMA.md` 仅保留概念定义，`SHARED-LAYERS.md` 为 executable layer logic 唯一来源 |
|| **continue 降级** | `openspec-continue` 简化为 apply alias，续传逻辑统一由 apply 执行 |
|| **Explore Impact Map** | 新增六段式 Impact Map 模板，gate 状态可视化 |
|| **Verify undetermined 闭环** | 三步闭环流程 + Traceability Map 归因判定过程列 |
|| **Plan CLI 语法修正** | 嵌套语法不支持，改为 kebab-case 子 change 名称 |
|| **Archive 强制归档路径** | verify 失败时提供决策分支，强制归档需记录原因 |
|| **Health Check** | 新增 `_shared/health-check.ps1`，4 维度诊断（CLI/Schema/配置/Layer 路径），`/opsx-apply` 入口集成（WARNING 不阻断） |
|| **Review Skill** | 新增 `openspec-review` skill，规范化 design 评审流程 |
|| **Schema 模板去重** | 共享模板提取到 `schemas/_shared/templates/`，消除 schema 间重复 |

### Skill 文件结构

```
.cursor/skills/
├── openspec-propose/
├── openspec-explore/
├── openspec-apply/
├── openspec-review/
├── openspec-verify/
├── openspec-archive/
├── openspec-debug/
├── openspec-plan/
├── openspec-onboard/
├── openspec-sync/
├── openspec-skill/
├── openspec-skip/
├── openspec-continue/     ← 简化为 apply alias
└── _shared/
    ├── SKILL-INDEX.md      ← 自动生成
    ├── GENERATE-INDEX.js   ← 索引生成器
    ├── GENERATE-CONFIG.js  ← v5.0: 配置生成器
    ├── _xplat.ps1         ← v5.0: Windows 跨平台抽象层
    ├── _xplat.sh          ← v5.0: Unix 跨平台抽象层
    ├── SCHEMA.md          ← 概念定义（v5.0 精简）
    └── SHARED-LAYERS.md   ← executable layer logic（v5.0 xplat 化）
```

---

## 配置文件

|| 文件 | 说明 |
||------|------|
|| `openspec/config.yaml` | 项目配置（layers、verify 命令、包管理器） |
|| `openspec/schemas/` | OpenSpec schema 定义 |
|| `openspec/changes/` | OpenSpec change 目录 |
|| `.cursor/skills/_shared/SCHEMA.md` | Skill 配置规范 |

## 相关文件

- [.cursor/README.md](../.cursor/README.md) — Skill 系统总览
- [.cursor/skills/_shared/SKILL-INDEX.md](./skills/_shared/SKILL-INDEX.md) — 完整 Skill 索引
- [.cursor/skills/_shared/SCHEMA.md](./skills/_shared/SCHEMA.md) — 配置规范
- [openspec/docs/faq-known-issues.md](./openspec/docs/faq-known-issues.md) — 已知问题与 FAQ
- [openspec/docs/archive-guide.md](./openspec/docs/archive-guide.md) — 归档操作指南
