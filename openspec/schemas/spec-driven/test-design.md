---
name: test-design-template
description: 测试用例设计模板。TDD 视角明确测试边界，服务于 tasks 实现顺序。
schema: spec-driven
---

# Test Design — <change-name>

|> 设计日期：<YYYY-MM-DD>
|> 基于：proposal.md、specs/**/*.md、design.md、review.md

## 测试范围

### 新增测试

|||| Spec 能力 | 测试用例 | 测试类型 | 优先级 |
|||-----------|---------|---------|---------|
|||| ... | ... | 单元测试 / 集成测试 / E2E / 视觉 | P0/P1/P2 |

### 回归测试

|||| 受影响能力 | 回归范围 |
|||-----------|---------|
|||| ... | ... |

## 测试用例

### [能力名称]

#### TC-xxx: [场景标题]

- **来源**: specs/<cap>/spec.md — Scenario: [名]
- **测试文件**: `<layer>/__tests__/<mod>.test.ts`
- **类型**: 单元测试 / 集成测试 / E2E / 视觉

**边界条件**: 正常路径 / 边界值 / 异常路径

#### TC-xxx: [场景标题]

...

## 测试执行顺序

<!-- 基于 tasks.md 的实现顺序 -->

1. engine 层单元测试
2. backend 层集成测试
3. ...
