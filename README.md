# General Openspec

> OpenSpec v1.3.1 — 可移植的 spec-driven 开发框架。

将整个目录复制到目标项目根目录即可使用。无需 fork 维护，跟随官方 CLI 升级同步。

## 安装

```bash
npm install -g @fission-ai/openspec@latest
```

## 核心命令

| 命令 | 用途 |
|------|------|
| `/opsx:explore` | 探索代码库，理清思路 |
| `/opsx:propose` | 创建 change，一次性生成 artifacts |
| `/opsx:apply` | 实现 tasks，逐项勾选 |
| `/opsx:verify` | 验证实现一致性 |
| `/opsx:archive` | 归档完成的 change |

## 变更分级

| 级别 | Schema | 场景 |
|------|--------|------|
| `low` | `rapid` | 样式/文案/UI 改版 |
| `medium` | `medium` | 触及 store / API / engine 层 |
| `high` | `high` | 架构决策 / 数据模型 / 跨层重构 |

## 质量门禁

所有变更必须满足：

- **BCF（核心业务路径）** — 每个 medium/high 变更必须识别并验证受影响的核心路径
- **禁止占位组件** — 所有按钮/链接/表单控件必须绑定真实 handler
- **真实环境验证** — E2E 冒烟测试必须连接真实后端，不能只跑 Mock
- **数据消费验证** — UI 层必须真实提取并使用 API 返回的 key 字段

## 升级

```bash
npm install -g @fission-ai/openspec@latest
openspec update
```

`openspec/config.yaml` 和 `openspec/schemas/` 完全不受影响。

## 目录结构

```
openspec/
├── config.yaml          ← 所有定制（layer 映射、rules、verify 命令）
├── schemas/
│   ├── rapid/           ← 一页版：proposal + tasks
│   ├── medium/          ← 中等：proposal + specs + design + review + tasks
│   └── high/            ← 高复杂：完整 artifact + BCF 验证报告
├── specs/               ← 主 specs（source of truth）
└── changes/             ← 变更目录
.cursor/
├── commands/            ← 5 个命令入口
└── skills/              ← 官方 skill 文件
```
