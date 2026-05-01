---
name: openspec-skill
description: Skill 系统维护工具。合并了 skill-list / skill-deps / skill-validate / skill-index 功能。不默认暴露，仅维护时使用。
version: "5.3"
category: meta
tags:
  - openspec
  - layer:meta
aliases:
  - /opsx-skill
depends_on: []
permissions: []
risks: []
verify: []
---

> **重要：** 本 skill 不默认暴露给普通用户，仅在维护 Skill 系统时使用。

## 核心职责

合并了以下四个原独立命令的功能：

| 原命令 | 功能 |
|--------|------|
| `opsx-skill-list` | 列出所有 skills |
| `opsx-skill-deps` | 显示 skill 依赖关系 |
| `opsx-skill-validate` | 验证 skill 格式 |
| `opsx-skill-index` | 重新生成索引 |

## 使用方式

```bash
/opsx-skill list                    # 列出所有 skills
/opsx-skill list --category apply   # 按 category 过滤
/opsx-skill list --tag openspec     # 按 tag 搜索

/opsx-skill deps <name>             # 显示依赖关系
/opsx-skill deps --all              # 显示所有依赖

/opsx-skill validate                # 验证所有 skills 格式
/opsx-skill validate --fix          # 自动修复可修复的问题

/opsx-skill index                   # 重新生成索引
```

## 子命令详解

### list

列出所有注册的 Skills，按 category 分组。

```
## Skill Index

### onboard
| Skill | Description | depends_on |
|-------|-------------|------------|
| openspec-onboard | 初始化 OpenSpec | — |

### sync
| Skill | Description | depends_on |
|-------|-------------|------------|
| openspec-sync | 同步 CLI 和 Skill 系统 | — |
```

### deps

显示 skill 之间的依赖关系。

```
## Skill Dependencies: openspec-apply

前置依赖：
├─ openspec-propose
│    └─ openspec-explore
└─ openspec-plan
     └─ openspec-explore

后继依赖：
└─ openspec-verify
```

### validate

验证所有 Skill 文件的 frontmatter 和内容格式。

**检查项：**

| 检查项 | 说明 |
|--------|------|
| frontmatter 完整性 | name, description, category 必填 |
| category 有效性 | 必须是有效值 |
| depends_on 有效性 | 引用的 skill 必须存在 |
| 循环依赖 | depends_on 不允许循环 |
| version 格式 | 遵循 semver |
| Guardrails 存在 | 每个 skill 应有 Guardrails 章节 |

### index

重新生成 SKILL-INDEX.md。

```bash
node .cursor/skills/_shared/GENERATE-INDEX.js
```

**何时需要重新生成索引：**

| 触发条件 | 类型 |
|---------|------|
| 添加了新 skill | 自动（添加后手动触发） |
| 删除了 skill | 自动（删除后手动触发） |
| skill 的 frontmatter 元数据变更（category/alias/depends_on） | 自动 |
| `_shared/` 目录结构变更 | 自动 |
| 新增 skill 目录 | 自动 |

**手动触发时机：**
- 添加/删除 skill 后
- 修改 skill 的 frontmatter 后
- 修改 `openspec-continue` 等 alias 相关配置后

**验证一致性方法：**
```bash
# 对比 SKILL-INDEX.md 和实际 skill 文件
node .cursor/skills/_shared/GENERATE-INDEX.js --dry-run
```

**GENERATE-INDEX.js 输入契约：**

```javascript
// 依赖 yaml npm 包（可选，未安装时使用 fallbackParse）
try {
  const yaml = require('yaml');
  return yaml.parse(content);
} catch (e) {
  return fallbackParse(content);  // 纯字符串解析
}
```

**fallbackParse 行为：**
- 纯字符串解析，不依赖任何外部 npm 包
- 支持简单 YAML（顶级 key: value 和列表）
- 不支持嵌套 anchor/alias、引号字符串、复杂多行值
- 如 yaml 包可用则优先使用

**错误处理：**
- frontmatter 解析失败 → 跳过该文件，记录 warning
- frontmatter 缺少 `name` 字段 → 跳过
- category 缺失 → 归类为 `other`

### validate --fix

**当前状态：** `--fix` 功能的自动修复尚未在 GENERATE-INDEX.js 中实现。
当前 `--validate --fix` 等同于 `--validate`，只读验证可发现问题，但不自动修复。

**`--dry-run` 验证模式（已实现）：**
```bash
node .cursor/skills/_shared/GENERATE-INDEX.js --dry-run
```
此命令读取所有 SKILL.md，重新生成 SKILL-INDEX.md 内容但不写入文件，便于 CI 检查一致性。

**计划支持的自动修复项（待实现）：**

| 问题类型 | 修复方式 | 状态 |
|---------|---------|------|
| frontmatter 缺少 `description` | 自动补全默认值 "TODO" | 待实现 |
| frontmatter 缺少 `version` | 自动补全 "1.0.0" | 待实现 |
| frontmatter 缺少 `category` | 需人工确认 | 待实现 |
| 循环依赖 | 需人工修复 | 不支持 |
| 引用的 skill 不存在 | 需人工修复 | 不支持 |

**触发验证的流程（当前可用）：**
```bash
# 读取验证（dry-run，不写入）
node .cursor/skills/_shared/GENERATE-INDEX.js --dry-run

# 读取验证（实际写入）
node .cursor/skills/_shared/GENERATE-INDEX.js
```

## Guardrails

- **禁止**在日常开发中调用 `/opsx-skill`（不默认暴露）
- **强制**validate 检查循环依赖
- **强制**list 按 category 排序输出
