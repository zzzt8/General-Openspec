# OpenSpec Skill System Changelog — V5.3

> **V5.3** | 2026-05-01

## 版本说明

V5.3 是问题修复和一致性优化版本，主要修复测试报告 #9 中发现的问题。

## Bug 修复

### Bug #1: Schema Preflight 路径拼接错误（Critical）
**文件**: `.cursor/skills/_shared/_xplat.ps1`
**问题**: `Test-SchemaExists` 使用相对路径拼接 schema 目录，在 Windows 上可能因路径分隔符导致 `Test-Path` 失败。
**修复**: 改用绝对路径拼接 `Join-Path $PWD.Path "openspec" "schemas" $schemaName`。

### Bug #2: 模板路径重复（Critical）
**文件**: `openspec/schemas/spec-driven/schema.yaml`
**问题**: `review` 和 `test-design` 的 `template` 字段使用 `templates/review.md` 相对路径，拼接后产生 `templates\templates\review.md`。
**修复**: 路径更正为 `review.md` 和 `test-design.md`，模板文件移动到 schema 根目录。

### Bug #4: `.cursor/commands/` 目录被错误删除（Critical）
**问题**: V5.3 的"Legacy 清理"误删了 `.cursor/commands/` 目录，导致 Cursor 无法识别 `/opsx-*` slash 命令。Skill 的 `aliases` 字段只是文档声明，Cursor IDE 需要 `.cursor/commands/*.md` 文件才能暴露命令。
**修复**: 重建全部 14 个 command 文件到 `.cursor/commands/`（onboard, sync, explore, propose, review, test-design, apply, verify, archive, debug, plan, continue, skip, sync-specs）。
**文件**: `.cursor/commands/` 下所有 .md 文件

### Bug #3: GENERATE-INDEX.js 缺少 category
**文件**: `.cursor/skills/_shared/GENERATE-INDEX.js`
**问题**: `order` 数组缺少 `review` 和 `test-design`，导致 SKILL-INDEX.md 中这两个 category 无链接。
**修复**: `order` 数组已添加这两个 category。

## 改进

### 改进 #1: 版本号统一
所有文档和 SKILL.md frontmatter 版本号统一为 **V5.3**。

### 改进 #2: 模板文件规范化
7 个 schema 模板文件（proposal, design, tasks, repo-analysis, spec, review, test-design）已添加标准 YAML frontmatter。

### 改进 #3: Command 文件规范化
`.cursor/commands/` 目录下的命令文件改为轻量 stub，内容引用对应 SKILL.md 的完整实现。

### 改进 #4: FAQ 更新
新增 Q7-Q10，记录本次修复的问题及历史已知问题状态更新。

## 相关文件

- [测试报告 #9](./full-workflow-test-report-9.md)
- [已知问题 FAQ](./faq-known-issues.md)
- [归档指南](./archive-guide.md)
