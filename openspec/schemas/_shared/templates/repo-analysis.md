---
name: repo-analysis-template
description: Repository Analysis 文档模板。结构分析与影响映射。
schema: _shared
---

## 影响层（Impact Map）

| 影响层 | 涉及模块 | 影响原因 |
|--------|----------|----------|
| engine | ... | ... |
| editor | ... | ... |
| runtime | ... | ... |
| backend | ... | ... |
| ui-skin | ... | ... |

## 相关目录

```
affected/
├── packages/engine/src/
├── server/src/
├── apps/editor/src/
├── apps/app/src/
└── packages/ui/src/
```

## 关键模块

### [模块名称]

- **位置**: `...`
- **职责**: ...
- **数据流**: ...
- **调用链**: ...

## 复用点

<!-- 可复用的现有代码 -->
- 现有 ... 模块可复用
- shared-types 中定义的标准接口

## 现有问题

1. ...
2. ...

## Impact Summary

本次变更影响：

- **新增依赖**: ...
- **破坏性变更**: ...
- **向后兼容**: ...

## 数据流变化

```
[Before]
...

[After]
...
```
