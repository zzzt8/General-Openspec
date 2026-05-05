---
name: openspec-review
description: 设计评审。基于结构分析评审 design 决策是否合理，输出 formal review artifact。
version: "5.3"
category: review
tags:
  - openspec
  - layer:meta
aliases:
  - /opsx:review
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
  echo "[opsx-review] 缺少前置 artifact（<文件名>），请先完成 /opsx:propose"
  exit 1
fi
```

缺失时输出：`[opsx-review] 缺少前置 artifact（<文件名>），请先完成 /opsx:propose`

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

修订后请重新运行 /opsx:review。
```

#### 5.2 修订后的 review 流程

修订 design.md 后，重新执行 `/opsx:review`：
- 仅重新核验修订涉及的决策（D2）
- 其他已通过的决策保持结论

### 6. 生成 review.md artifact

将评审结果保存到 `openspec/changes/<name>/review.md`：

```markdown
# Design Review — <change-name>

> 评审日期：<YYYY-MM-DD>
> 评审人：AI（openspec-review v5.3）
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

---

## Phase 6: Test Design（TDD 视角）

> 在 tasks.md 生成之前，以 TDD 视角设计测试用例。每个 spec requirement 对应哪些测试场景？测试边界条件？回归范围？

### 6.1 读取 artifacts

读取以下 artifact 建立测试上下文：
- `proposal.md` — 了解本次 change 的能力边界（ADDED/MODIFIED）
- `specs/*.md` — 每个 capability 的 scenario 是天然测试用例来源
- `design.md` — 了解技术方案中的关键路径和边界
- `review.md` — 了解评审中发现的风险点（需要额外测试覆盖）

### 6.2 识别测试范围

```markdown
## 测试范围 — <change-name>

### 新增测试（本次 change 新增）

| Spec 能力 | 对应测试用例 | 测试类型 | 优先级 |
|-----------|-------------|---------|-------|
| user-auth | TC-001: 成功登录 | 单元测试 | P0 |
| user-auth | TC-002: 密码错误 | 单元测试 | P0 |

### 回归测试（必须通过的已有测试）

| 受影响能力 | 风险说明 | 回归范围 |
|-----------|---------|---------|
| existing-api | 新增参数后向兼容 | /api/v1/* |

### 不测试范围

| 范围 | 排除理由 |
|------|---------|
```

### 6.3 设计测试用例

对每个新增 spec requirement，逐一设计测试用例：

```markdown
## 测试用例设计

### TC-xxx: [场景标题]

| 字段 | 内容 |
|------|------|
| **来源** | specs/<capability>/spec.md — Scenario: [场景名] |
| **测试类型** | 单元测试 / 集成测试 / E2E 测试 / 视觉测试 |
| **测试文件** | `<layer>/__tests__/<module>.test.ts` |

**输入：** `[测试输入数据]`
**预期输出：** `[预期结果]`

**边界条件：**
- [ ] 正常路径
- [ ] 边界值（最小/最大/空值）
- [ ] 异常路径（错误输入/超时/服务不可用）
```

### 6.4 边界条件清单

```markdown
## 边界条件清单

### 输入边界

| 字段 | 最小值 | 最大值 | 空值处理 | 特殊值 |
|------|------|------|--------|-------|
| username | 1 char | 50 chars | 禁止 | Unicode / SQLi 注入 |

### 并发边界

| 场景 | 预期行为 | 测试方法 |
|------|---------|---------|
| 同一用户多端登录 | 允许 3 个会话 | Mock session store |
```

### 6.5 Mock / Fixture 策略

```markdown
## Mock / Fixture 策略

| 依赖 | Mock 方式 | 工具 |
|------|---------|------|
| Database | In-memory SQLite | better-sqlite3 |
| Redis | Mock redis client | ioredis-mock |
| External API | HTTP mock | nock / msw |
```

### 6.6 测试执行顺序

基于 design.md 中的 layer 依赖关系，确定测试执行顺序：

```
engine（无依赖）
  -> backend（依赖 engine）
    -> editor（依赖 backend + engine）
      -> runtime（依赖 backend + engine）
        -> ui-skin（依赖 backend）
```

**关键路径优先：**
- 先覆盖 design.md 中标注为"高风险"的路径
- 先覆盖 review.md 中"需要额外测试覆盖"的风险点

### 6.7 生成 test-design.md artifact

将完整的测试用例设计保存到 `openspec/changes/<name>/test-design.md`：

```markdown
# Test Design — <change-name>

> 设计日期：<YYYY-MM-DD>
> 基于：proposal.md、specs/*.md、design.md、review.md

## 测试范围

[测试范围表]

## 测试用例设计

[完整的逐能力测试用例]

## 边界条件清单

[边界条件表]

## Mock / Fixture 策略

[Mock 策略]

## 测试执行顺序

[执行顺序 + 关键路径]

## 与 tasks.md 的映射关系

| 测试用例 | 对应 Task | 执行时机 |
|---------|---------|---------|
| TC-001 | T1.1 实现登录 API | 与 T1.1 并行（推荐）或之后 |
```

## Test Design Guardrails

- **强制**读取 review.md 后再开始设计（确保覆盖评审风险点）
- **强制**每个 spec requirement 都有对应的测试用例
- **强制**覆盖新增能力的正常路径 + 边界值 + 异常路径
- **强制**明确回归测试范围（不得遗漏）
- **强制**输出测试执行顺序（基于 layer 依赖）
- **强制**每个测试用例包含测试文件路径（供 tasks.md 引用）
- **强制**生成 test-design.md artifact
- **禁止**跳过边界条件设计
- **禁止**在测试设计阶段写测试代码（仅设计，代码在 implement 阶段写）
- **禁止**遗漏 review.md 中标注的高风险路径

