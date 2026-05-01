---
name: openspec-test-design
description: 测试用例设计。在动手实现前明确测试边界，TDD 视角先写测试用例再写实现。
version: "5.3"
category: test-design
tags:
  - openspec
  - layer:meta
aliases:
  - /opsx-test-design
depends_on:
  - openspec-review
permissions: []
risks: []
verify: []
---

> **前置共享片段：** 配置规范见 [../_shared/SCHEMA.md](../_shared/SCHEMA.md)。

## 核心职责

在 tasks.md 生成之前，以 TDD 视角设计测试用例：
- 每个 spec requirement 对应哪些测试场景？
- 测试的边界条件是什么？
- 哪些是回归测试范围，哪些是本次新增？
- 测试用例设计服务于 tasks.md 的实现顺序

## 入口条件

**硬关卡：以下任一 artifact 缺失时禁止执行 test-design：**

```bash
# 通过 xplat 检测文件是否存在（glob 需要额外展开）
if [ ! -f "openspec/changes/<name>/proposal.md" ] || \
   [ ! -f "openspec/changes/<name>/design.md" ] || \
   [ ! -f "openspec/changes/<name>/review.md" ]; then
  echo "[opsx-test-design] 缺少前置 artifact（<文件名>），请先完成 /opsx-review"
  exit 1
fi

# specs/*.md 至少要有一个存在
if ! ls openspec/changes/<name>/specs/*.md 1>/dev/null 2>&1; then
  echo "[opsx-test-design] 缺少前置 artifact（specs/*.md），请先完成 /opsx-review"
  exit 1
fi
```

缺失时输出：`[opsx-test-design] 缺少前置 artifact（<文件名>），请先完成 /opsx-review`

## 执行流程

### 1. 读取 artifacts

读取以下 artifact，建立测试上下文：

- `proposal.md` — 了解本次 change 的能力边界（ADDED/MODIFIED）
- `specs/*.md` — 每个 capability 的 scenario 是天然测试用例来源
- `design.md` — 了解技术方案中的关键路径和边界
- `review.md` — 了解评审中发现的风险点（需要额外测试覆盖）

### 2. 识别测试范围

```markdown
## 测试范围 — <change-name>

### 2.1 新增测试（本次 change 新增）

| Spec 能力 | 对应测试用例 | 测试类型 | 优先级 |
|-----------|-------------|---------|-------|
| user-auth | TC-001: 成功登录 | 单元测试 | P0 |
| user-auth | TC-002: 密码错误 | 单元测试 | P0 |
| user-auth | TC-003: Token 过期 | 集成测试 | P1 |

### 2.2 回归测试（必须通过的已有测试）

| 受影响能力 | 风险说明 | 回归范围 |
|-----------|---------|---------|
| existing-api | 新增参数后向兼容 | /api/v1/* |
| session-store | Redis 序列化变化 | session 读写 |

### 2.3 不测试范围

| 原因 |
|------|
| [范围] | [排除理由] |
```

### 3. 设计测试用例

对每个新增 spec requirement，逐一设计测试用例：

```markdown
## 测试用例设计

### 3.1 [能力名称]

#### TC-xxx: [场景标题]

| 字段 | 内容 |
|------|------|
| **来源** | specs/<capability>/spec.md — Scenario: [场景名] |
| **测试类型** | 单元测试 / 集成测试 / E2E 测试 / 视觉测试 |
| **测试文件** | `<layer>/__tests__/<module>.test.ts` |
| **依赖** | [外部依赖：数据库 / API / 第三方服务] |
| **Setup** | [测试前置条件] |
| **Teardown** | [测试清理] |

**输入：**
```
[测试输入数据]
```

**预期输出：**
```
[预期结果]
```

**边界条件：**
- [ ] 正常路径
- [ ] 边界值（最小/最大/空值）
- [ ] 异常路径（错误输入/超时/服务不可用）

**与 implement 的关系：**
- [ ] 先写测试（推荐）
- [ ] 实现后补测试

---

#### TC-yyy: [场景标题]

...
```

### 4. 边界条件清单

```markdown
## 边界条件清单

### 4.1 输入边界

| 字段 | 最小值 | 最大值 | 空值处理 | 特殊值 |
|------|------|------|--------|-------|
| username | 1 char | 50 chars | 禁止 | Unicode / SQLi 注入 |
| password | 8 chars | 128 chars | 禁止 | 空格 / 特殊字符 |

### 4.2 并发边界

| 场景 | 预期行为 | 测试方法 |
|------|---------|---------|
| 同一用户多端登录 | 允许 3 个会话 | Mock session store |
| 并发写入同一资源 | 后写胜出 | Thread pool test |

### 4.3 性能边界

| 指标 | 阈值 | 测试方法 |
|-----|------|---------|
| API 响应时间 | < 200ms | Benchmark test |
| 并发用户数 | 1000 QPS | Load test |
```

### 5. Mock / Fixture 策略

```markdown
## Mock / Fixture 策略

### 5.1 外部依赖 Mock

| 依赖 | Mock 方式 | 工具 |
|------|---------|------|
| Database | In-memory SQLite | better-sqlite3 |
| Redis | Mock redis client | ioredis-mock |
| External API | HTTP mock | nock / msw |
| File system | In-memory FS | memfs |

### 5.2 Test Fixture

tests/fixtures/
├── auth/
│   ├── valid-token.json
│   └── expired-token.json
└── data/
    ├── user-min.json
    └── user-max.json

### 5.3 Golden Fixture（视觉/输出不变性测试）

tests/golden/
├── export-csv/
│   ├── sample-input.json
│   └── expected-output.csv

### 5.4 API Contract Fixture（集成测试）

// tests/fixtures/api-contract.yaml
endpoints:
  - path: /api/v1/users
    method: GET
    responses:
      200:
        schema: user-list.schema.json
      401:
        schema: error.schema.json
```

### 6. 测试依赖顺序

基于 design.md 中的 layer 依赖关系，确定测试执行顺序：

**Layer 依赖顺序：**

- engine（无依赖）
  -> backend（依赖 engine）
    -> editor（依赖 backend + engine）
      -> runtime（依赖 backend + engine）
        -> ui-skin（依赖 backend）

**测试执行顺序：**

1. engine 层单元测试（最先，不依赖外部）
2. backend 层集成测试（依赖 engine）
3. editor 层测试（依赖 backend）
4. runtime 层测试（依赖 backend）
5. ui-skin 层视觉测试（依赖 backend）
6. E2E 冒烟测试（最后，所有 layer 已就绪）

**关键路径优先：**
- 先覆盖 design.md 中标注为"高风险"的路径
- 先覆盖 review.md 中"需要额外测试覆盖"的风险点

## 输出：test-design.md artifact

将完整的测试用例设计保存到 `openspec/changes/<name>/test-design.md`：

```markdown
# Test Design — <change-name>

> 设计日期：<YYYY-MM-DD>
> 设计人：AI（openspec-test-design v4.1）
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
| TC-002 | T2.1 实现 Token 验证 | 与 T2.1 并行或之后 |
```

## Guardrails

- **强制**读取 review.md 后再开始设计（确保覆盖评审风险点）
- **强制**每个 spec requirement 都有对应的测试用例
- **强制**覆盖新增能力的正常路径 + 边界值 + 异常路径
- **强制**明确回归测试范围（不得遗漏）
- **强制**输出测试执行顺序（基于 layer 依赖）
- **强制**每个测试用例包含测试文件路径（供 tasks.md 引用）
- **强制**生成 test-design.md artifact
- **强制**入口时检测前置 artifacts，缺失则硬关卡
- **禁止**跳过边界条件设计
- **禁止**在测试设计阶段写测试代码（仅设计，代码在 implement 阶段写）
- **禁止**遗漏 review.md 中标注的高风险路径
- **禁止**内联 bash/grep/sed 脚本片段（使用 xplat 函数，详见 SHARED-LAYERS.md）
