---
name: openspec-review
description: 设计评审。基于结构分析评审 design 决策是否合理，输出 formal review artifact。
version: "5.3"
category: review
tags:
  - openspec
  - layer:meta
aliases:
  - /opsx-review
depends_on:
  - openspec-propose
permissions: []
risks: []
verify: []
---

> **前置共享片段：** 配置规范见 [../_shared/SCHEMA.md](../_shared/SCHEMA.md)。

## 核心职责

将 design.md 中的技术方案与 repo-analysis.md 中的真实代码结构做对照评审：
- 设计决策是否基于真实的代码现状？
- 方案的复杂度估算是否准确？
- 是否有没想到的耦合影响或风险？
- 评审结论是否需要修订 design.md？

## 入口条件

**硬关卡：以下任一 artifact 缺失时禁止执行 review：**

```bash
# 通过 xplat 检测文件是否存在
if [ ! -f "openspec/changes/<name>/repo-analysis.md" ] || \
   [ ! -f "openspec/changes/<name>/proposal.md" ] || \
   [ ! -f "openspec/changes/<name>/design.md" ]; then
  echo "[opsx-review] 缺少前置 artifact（<文件名>），请先完成 /opsx-propose"
  exit 1
fi
```

缺失时输出：`[opsx-review] 缺少前置 artifact（<文件名>），请先完成 /opsx-propose`

## 执行流程

### 1. 读取 artifacts

读取以下三个 artifact，建立评审上下文：

- `proposal.md` — 了解"为什么改"和"改什么"
- `repo-analysis.md` — 了解真实代码结构和影响层
- `design.md` — 了解"怎么改"的技术方案

### 2. 评审 checklist

对 design.md 中的每个技术决策，逐一核验：

```markdown
## 设计评审 — <change-name>

### D1: [决策标题]

| 评审维度 | 结论 | 依据 |
|---------|------|------|
| 代码现状符合 | ✓/✗/存疑 | repo-analysis 中标注的实际情况 |
| 方案复杂度准确 | ✓/✗ | 预估文件数/模块数 vs 实际 |
| 耦合影响已识别 | ✓/✗ | 是否标注了受影响的 layer/module |
| 可测试性 | ✓/✗ | 是否有明确的测试边界 |
| 回滚可行性 | ✓/✗ | 方案是否支持低风险回滚 |

**风险标注：**
- [Risk-1] <描述> -> <缓解措施>
- [Risk-2] <描述> -> <缓解措施>

**评审意见：**
<具体意见，如有修改建议则必须输出修订后的段落>
```

### 3. 结构分析闭环检查

将 repo-analysis 的发现与 design 的决策对照，输出闭环表：

```markdown
### 结构分析闭环表

| 结构发现（repo-analysis） | 对应设计决策（design） | 闭环状态 |
|-------------------------|----------------------|---------|
| [发现A] engine 层模块 X 调用链复杂 | D3 中提到了拆分方案 | ✓ 已覆盖 |
| [发现B] backend API contract 不稳定 | 未提及 | ⚠ 缺失，需补充 |
| [发现C] UI 层有第三方依赖 | D5 中有回退方案 | ✓ 已覆盖 |

**闭环判定：**
- 全部 ✓ -> 可以进入 tasks
- 有 ⚠ -> 必须先修订 design.md，再重新 review
- 有 ✗ -> 严重风险，评审不通过
```

### 4. 评审结论

```markdown
## 评审结论

| 决策 | 闭环状态 | 风险等级 |
|------|---------|---------|
| D1: [决策标题] | ✓ 已闭环 | 低 |
| D2: [决策标题] | ⚠ 需补充 | 中 |
| D3: [决策标题] | ✗ 未覆盖 | 高 |

**综合结论：**
- [ ] **通过**：所有决策已闭环，可进入 tasks
- [ ] **修订后通过**：D2 需修订 design.md，重新 review
- [ ] **不通过**：存在高风险缺口，建议重新设计
```

### 5. 修订路径（当结论为"修订后通过"时）

#### 5.1 输出修订指令

```markdown
## design.md 修订指令

### 必须补充的内容

**D2 补充项：**
- [ ] 补充 backend API contract 稳定性评估
- [ ] 补充对现有接口的兼容性影响分析
- [ ] 补充 fallback 方案

### 建议修订的位置

- D2 章节「Decisions」段落，补充 1 段（约 200 字）
- 新增「风险」小节，补充 [Risk] -> Mitigation 条目

修订后请重新运行 /opsx-review。
```

#### 5.2 修订后的 review 流程

修订 design.md 后，重新执行 `/opsx-review`：
- 仅重新核验修订涉及的决策（D2）
- 其他已通过的决策保持结论

### 6. 生成 review.md artifact

将评审结果保存到 `openspec/changes/<name>/review.md`：

```markdown
# Design Review — <change-name>

> 评审日期：<YYYY-MM-DD>
> 评审人：AI（openspec-review v4.1）
> 基于：proposal.md、repo-analysis.md、design.md

## 评审结论

[综合结论：通过 / 修订后通过 / 不通过]

## 评审 checklist

[完整的逐决策评审表]

## 结构分析闭环表

[闭环表]

## design.md 修订指令（如有）

[修订指令]

## 修订记录（如有）

| 修订轮次 | 日期 | 修订内容 | 评审结论 |
|---------|------|---------|---------|
| R1 | YYYY-MM-DD | 初始评审 | 修订后通过 |
| R2 | YYYY-MM-DD | D2 补充了 API 稳定性分析 | 通过 |
```

## Guardrails

- **强制**读取 repo-analysis.md 后再开始评审
- **强制**每个 design 决策都有对应的 checklist 填写
- **强制**输出结构分析闭环表
- **强制**综合结论为"不通过"时不得进入 tasks
- **强制**修订 design.md 后必须重新 review（不得跳过）
- **强制**生成 review.md artifact
- **强制**入口时检测前置 artifacts，缺失则硬关卡
- **禁止**在 review 阶段修改代码（Mutation Gate 适用）
- **禁止**在发现高风险缺口时仍给出"通过"结论
- **禁止**内联 bash/grep/sed 脚本片段（使用 xplat 函数，详见 SHARED-LAYERS.md）
