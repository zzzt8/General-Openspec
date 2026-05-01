---
name: tasks-template
description: Tasks 文档模板。实现检查清单，驱动 apply 阶段。
schema: _shared
---

## Task List

<!-- opsx-meta
id: T1
layer: engine
verify: unit-tests
dependencies:
  - type: task
    refs: []
-->
- [ ] T1: [任务描述]

<!-- opsx-meta
id: T2
layer: backend
verify: api-tests
dependencies:
  - type: task
    refs: [T1]
-->
- [ ] T2: [任务描述]

---

## Manual Acceptance Checklist

- [ ] [验收项]
