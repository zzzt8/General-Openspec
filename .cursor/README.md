# .cursor Skills

> OpenSpec Skill System — 官方 v1.3.1 CLI 驱动。

## 5 个核心命令

| 命令 | Skill | 作用 |
|------|-------|------|
| `/opsx:explore` | `openspec-explore` | 探索代码库，澄清需求 |
| `/opsx:propose` | `openspec-propose` | 创建 change（rapid schema: proposal + tasks） |
| `/opsx:apply` | `openspec-apply-change` | 实现 tasks |
| `/opsx:verify` | `openspec-verify-change` | 验证实现一致性 |
| `/opsx:archive` | `openspec-archive-change` | 归档完成的 change |

## 变更分级

| 级别 | Schema | 场景 |
|------|--------|------|
| `low` | `rapid` | 样式/文案/UI 改版 |
| `medium` | `spec-driven` | 触及 store / API / engine 层 |
| `high` | `spec-driven` | 架构决策 / 数据模型 / 跨层重构 |

## 工作流

```
/opsx:explore  → 理清思路，识别 BCF
/opsx:propose  → 创建 change，一次性生成 proposal + tasks
/opsx:apply    → 按 layer 优先级实现 tasks
/opsx:verify   → 验证实现一致性
/opsx:archive  → 归档完成的 change
```

## 安装

```bash
npm install -g @fission-ai/openspec@latest
openspec --version
```

## 升级

```bash
npm install -g @fission-ai/openspec@latest
openspec update
```

`openspec/config.yaml` 和 `openspec/schemas/` 完全不受影响。

## Layer 优先级

```
engine > backend > editor > runtime > ui-skin > meta
```
