# OpenSpec Skill System Integration Test Plan

> **v4.1** | OpenSpec Skill System

**创建日期**: 2026-04-25
**更新日期**: 2026-04-26
**基于**: full-workflow-test-report-1.md, full-workflow-test-report-2.md, full-workflow-test-report-3.md, full-workflow-test-report-4.md
**目的**: 将测试报告中的"下次测试方向"建议落地为可执行的测试用例，并跟踪执行状态

---

## 1. 测试套件概述

本测试套件覆盖 OpenSpec skill 系统中尚未被端到端测试覆盖的能力：

| 测试套件 | 对应 Skill | 优先级 | 状态 | 完成于 |
|---------|-----------|--------|------|--------|
| 全流程测试（低风险 change） | `openspec-propose` 等 | P0 | **已完成** | report-1, 2, 3, 4 |
| /opsx-plan 多 change 编排测试 | `openspec-plan` | P0 | **已完成** | report-3, report-4 |
| Health Check 能力测试 | `_shared/health-check` | P0 | **已完成** | report-3 |
| /opsx-review 设计评审测试 | `openspec-review` | P0 | **已完成** | report-1, report-3, report-4 |
| /opsx-test-design 测试用例设计 | `openspec-test-design` | P0 | **已完成** | report-1, report-3 |
| Archive 能力测试 | `openspec-archive` | P0 | 待执行 | — |
| Continue 断点续传测试 | `openspec-continue` | P0 | 待执行 | — |
| Debug 诊断能力测试 | `openspec-debug` | P1 | 待执行 | — |

**已完成测试覆盖**：全流程 7 个核心 skill（explore → propose → review → test-design → apply → verify → archive）+ /opsx-plan 多 change 编排 + Health Check 能力 + /opsx-review 设计评审 + /opsx-test-design 测试用例设计。共 4 份测试报告。

**已知问题（已在本轮优化中处理）：**
- `extended-spec-driven` 模板缺失 → 已补全（proposal/design/spec/tasks/repo-analysis）
- Schema 模板跨目录重复 → 已消除，提取到 `schemas/_shared/templates/`
- SKILL-INDEX.md 缺少 `openspec-review` 条目 → 已补全
- `config.yaml` verify 命令指向不存在包 → 已替换为桩命令
- `health-check` config 孤立 → 已删除（health-check.ps1 独立运行）
- `commands/` 目录未标注废弃 → 已添加 deprecation 声明

---

## 2. Archive 能力测试（`openspec-archive`）

### 背景

测试报告 #1 和 #2 均跳过了 archive 阶段（直接删除测试 change）。Archive 能力未被验证。

### 预置条件

- `openspec` CLI 可用
- 存在已完成 verify 的 change（或已知失败的 change）
- 测试 change 可使用命名空间：`full-workflow-test-archive-*`

### 测试用例

#### TC-ARCH-01: 正常归档流程

| 字段 | 内容 |
|------|------|
| **用例编号** | TC-ARCH-01 |
| **用例名称** | 正常归档流程 |
| **测试类型** | CLI 集成 |
| **优先级** | P0 |
| **前置条件** | 存在已完成 verify 的 change |
| **执行步骤** | 1. 创建测试 change（使用 low class）<br>2. 完成所有 tasks<br>3. 执行 `/opsx-verify`<br>4. 执行 `/opsx-archive` |
| **预期结果** | CLI 输出归档成功，`openspec/list --json` 不包含该 change，归档目录存在 |
| **验证方法** | `ls openspec/changes/archive/` 包含对应日期目录 |

#### TC-ARCH-02: verify 失败时的强制归档路径

| 字段 | 内容 |
|------|------|
| **用例编号** | TC-ARCH-02 |
| **用例名称** | verify 失败时强制归档 |
| **测试类型** | 降级路径 |
| **优先级** | P0 |
| **前置条件** | 存在 verify 失败的 change |
| **执行步骤** | 1. 创建测试 change<br>2. 注入一个 task 失败（如 typecheck 失败）<br>3. 执行 `/opsx-verify`<br>4. 输入 `force-archive` 选择强制归档 |
| **预期结果** | proposal.md 中包含 `force_archive_reason` 字段，归档目录存在 |
| **验证方法** | grep `force_archive_reason` 归档目录/proposal.md |

#### TC-ARCH-03: 归档后查看内容（CLI workaround）

| 字段 | 内容 |
|------|------|
| **用例编号** | TC-ARCH-03 |
| **用例名称** | 归档后绕过 CLI 查看内容 |
| **测试类型** | workaround 验证 |
| **优先级** | P0 |
| **前置条件** | 存在已归档的 change |
| **执行步骤** | 1. 执行 `cat openspec/changes/archive/<date>-<name>/proposal.md`<br>2. 执行 `ls openspec/changes/archive/<date>-<name>/` |
| **预期结果** | 能直接读取归档内容，不依赖 `openspec show` |
| **验证方法** | 文件内容可读，proposal.md 包含 frontmatter |

#### TC-ARCH-04: 归档前 git 工作区检查

| 字段 | 内容 |
|------|------|
| **用例编号** | TC-ARCH-04 |
| **用例名称** | 归档前 git 工作区检查 |
| **测试类型** | Guardrail 验证 |
| **优先级** | P1 |
| **前置条件** | 存在已完成 verify 的 change，且 git 工作区有未提交改动 |
| **执行步骤** | 1. 故意留下未提交的改动<br>2. 执行 `/opsx-archive`<br>3. 观察警告输出 |
| **预期结果** | 提示"git 工作区有未提交改动"，不直接归档 |
| **验证方法** | 输出包含 WARNING 和改动文件列表 |

---

## 3. Continue 断点续传测试（`openspec-continue`）

### 背景

测试报告 #1 和 #2 建议测试断点续传能力。`openspec-continue` 是 `openspec-apply` 的 alias，核心逻辑在 apply 的"续传模式"中。

### 预置条件

- 存在中断的 change（部分 tasks 完成，部分 todo）
- `openspec list --json` 能检测到 active change

### 测试用例

#### TC-CONT-01: 续传单 active change

| 字段 | 内容 |
|------|------|
| **用例编号** | TC-CONT-01 |
| **用例名称** | 续传单个中断的 change |
| **测试类型** | 断点续传 |
| **优先级** | P0 |
| **前置条件** | 存在 1 个 active change，部分 tasks 已完成 |
| **执行步骤** | 1. 创建测试 change（5 个 tasks）<br>2. 完成 T1-T2<br>3. 执行 `/opsx-continue`（无参数）<br>4. 确认续传摘要<br>5. 输入 `continue` |
| **预期结果** | 从 T3 继续执行，完成 T3-T5 |
| **验证方法** | tasks.md checkbox 显示 T1-T5 均为 `- [x]` |

#### TC-CONT-02: 多个 active changes 时列出供选择

| 字段 | 内容 |
|------|------|
| **用例编号** | TC-CONT-02 |
| **用例名称** | 多个 active changes 续传选择 |
| **测试类型** | Guardrail 验证 |
| **优先级** | P0 |
| **前置条件** | 存在 2 个或以上 active changes |
| **执行步骤** | 1. 创建 change A 和 change B<br>2. 中断 change A（部分 tasks 完成）<br>3. 中断 change B（部分 tasks 完成）<br>4. 执行 `/opsx-continue` |
| **预期结果** | 列出所有 active changes 供用户选择，不自动选择 |
| **验证方法** | 输出包含两个 change 名称的列表 |

#### TC-CONT-03: 续传前显示断点摘要

| 字段 | 内容 |
|------|------|
| **用例编号** | TC-CONT-03 |
| **用例名称** | 续传前显示断点摘要 |
| **测试类型** | UX 验证 |
| **优先级** | P1 |
| **前置条件** | 存在中断的 change |
| **执行步骤** | 执行 `/opsx-continue` |
| **预期结果** | 输出包含：当前进度、断点 task ID、断点任务描述、确认 checklist |
| **验证方法** | 输出包含 "断点任务：T" 和 "继续前请确认" |

#### TC-CONT-04: 续传后委托给 apply 执行

| 字段 | 内容 |
|------|------|
| **用例编号** | TC-CONT-04 |
| **用例名称** | continue 委托 apply 执行 |
| **测试类型** | 架构验证 |
| **优先级** | P1 |
| **前置条件** | 存在中断的 change |
| **执行步骤** | 执行 `/opsx-continue`，观察后续执行行为 |
| **预期结果** | 后续执行流程与 `/opsx-apply` 一致（layer 排序、增量验证、checkbox 更新） |
| **验证方法** | 与 TC-CONT-01 对比，执行行为一致 |

---

## 4. Debug 诊断能力测试（`openspec-debug`）

### 背景

测试报告 #2 建议测试 debug 能力。需要注入失败场景才能验证诊断逻辑。

### 预置条件

- `openspec` CLI 可用
- 测试项目有可注入的失败（如 typecheck 错误）
- 测试 change 处于 apply 阶段遇到失败

### 测试用例

#### TC-DEBUG-01: TypeScript 类型错误诊断

| 字段 | 内容 |
|------|------|
| **用例编号** | TC-DEBUG-01 |
| **用例名称** | TypeScript 类型错误诊断 |
| **测试类型** | 诊断逻辑 |
| **优先级** | P0 |
| **前置条件** | 在 skill 项目中注入一个 typecheck 错误 |
| **执行步骤** | 1. 在 `.cursor/skills/` 中注入一个类型错误<br>2. 执行 `/opsx-apply`（或直接执行 `pnpm typecheck`）<br>3. 观察到 typecheck 失败<br>4. 执行 `/opsx-debug` |
| **预期结果** | 输出包含：具体错误文件 + 行号、根因分析、修复建议（具体代码片段）、验证命令 |
| **验证方法** | 输出包含 "具体要改的代码片段" 和 "验证命令" |

#### TC-DEBUG-02: Test Failure Attribution 阻断后转 debug

| 字段 | 内容 |
|------|------|
| **用例编号** | TC-DEBUG-02 |
| **用例名称** | Test Failure Attribution 阻断转 debug |
| **测试类型** | 流程集成 |
| **优先级** | P0 |
| **前置条件** | 存在测试失败且归因为 `related` 或 `undetermined` 的 change |
| **执行步骤** | 1. 执行 `/opsx-apply`<br>2. 观察到 Test Failure Attribution 阻断<br>3. 输出包含 "强制进入 /opsx-debug"<br>4. 执行 `/opsx-debug` |
| **预期结果** | debug 输出归因分析 + 修复建议 |
| **验证方法** | debug 输出包含完整的"归因分析"和"修复方案" |

#### TC-DEBUG-03: undetermined 分类闭环

| 字段 | 内容 |
|------|------|
| **用例编号** | TC-DEBUG-03 |
| **用例名称** | undetermined 状态三步闭环 |
| **测试类型** | 决策树验证 |
| **优先级** | P1 |
| **前置条件** | 存在无法明确判断相关/无关的测试失败 |
| **执行步骤** | 执行 `/opsx-debug`，观察 undetermined 处理流程 |
| **预期结果** | 输出包含三步闭环：增量测试 → 调用栈分析 → 决策分支 |
| **验证方法** | 输出包含 "尝试确定性证明"、"决策分支"、"记录归因" 三个步骤 |

#### TC-DEBUG-04: 环境诊断（Prisma/migration）

| 字段 | 内容 |
|------|------|
| **用例编号** | TC-DEBUG-04 |
| **用例名称** | Prisma 环境诊断 |
| **测试类型** | 环境诊断 |
| **优先级** | P2 |
| **前置条件** | 测试项目使用 Prisma，且存在 migration 不同步 |
| **执行步骤** | 1. 故意删除 migration 文件<br>2. 执行 `pnpm test`<br>3. 观察到 Prisma 相关错误<br>4. 执行 `/opsx-debug` |
| **预期结果** | 输出包含：Prisma Client 生成检查 → 数据库文件检查 → Migration 状态检查 |
| **验证方法** | 输出包含 "Prisma Client 生成状态"、"数据库文件存在性"、"Migration 同步状态" |

---

## 5. 测试执行策略

### 主仓库内执行

所有测试在主仓库 `d:/Desktop/Product/General Openspec/` 内执行，不创建外部项目。

### 测试 change 命名约定

```
full-workflow-test-archive-<n>   # archive 测试
full-workflow-test-continue-<n>  # continue 测试
full-workflow-test-debug-<n>     # debug 测试
```

### 清理策略

每个测试完成后：
1. 删除测试 change 目录
2. 恢复任何注入的错误
3. 确认 `openspec list --json` → `changes: []`

### 测试报告命名

```
openspec/docs/integration-test-report-archive.md
openspec/docs/integration-test-report-continue.md
openspec/docs/integration-test-report-debug.md
```

---

## 6. 依赖关系

```
TC-ARCH-01 → 需要已有 verified change（可手动创建）
TC-ARCH-02 → 需要 verify 失败的 change
TC-ARCH-03 → 需要已归档的 change（TC-ARCH-01 产出）
TC-ARCH-04 → 需要未 commit 的 git 改动

TC-CONT-01 → 需要中断的 change
TC-CONT-02 → 需要多个 active changes
TC-CONT-03 → 需要中断的 change（TC-CONT-01 可复用）
TC-CONT-04 → 需要中断的 change（TC-CONT-01 可复用）

TC-DEBUG-01 → 需要注入 typecheck 错误
TC-DEBUG-02 → 需要 related/undetermined 测试失败
TC-DEBUG-03 → 需要 undetermined 测试失败
TC-DEBUG-04 → 需要 Prisma + migration 不同步
```

---

## 7. 下一步

已完成的测试套件（report-1/2/3/4）：
- 全流程 7 个核心 skill + /opsx-plan 多 change 编排 + Health Check 能力 + /opsx-review 设计评审 + /opsx-test-design 测试用例设计
- 4 份测试报告：`openspec/docs/full-workflow-test-report-{1,2,3}.md` + `openspec/test-artifacts/full-workflow-test-report-4.md`

待执行的测试套件（按优先级）：
1. **P0**: Archive 能力测试（TC-ARCH-01 ~ TC-ARCH-04）
2. **P0**: Continue 断点续传测试（TC-CONT-01 ~ TC-CONT-04）
3. **P1**: Debug 诊断能力测试（TC-DEBUG-01 ~ TC-DEBUG-04）

每个测试完成后生成对应报告（命名：`openspec/docs/integration-test-report-<suite>.md`），并更新本文件状态列。
