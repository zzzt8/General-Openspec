---
name: openspec-sync
description: 同步 OpenSpec CLI 和 Skill 系统。验证 config.yaml、同步 agent 指令、同步 schemas。
version: "1.0"
generatedBy: "1.3.1"
---

同步 OpenSpec 系统的各个组件。验证 config.yaml、同步 agent 指令、同步 schemas。

## 使用方式

```bash
/opsx:sync              # 完整同步
/opsx:sync --config     # 仅同步 config.yaml
/opsx:sync --agents     # 仅同步 agent 指令
/opsx:sync --validate   # 仅验证一致性
```

## 执行流程

### 1. 前置检查

1. 确认 `openspec` CLI 已安装（`openspec --version`）
2. 确认 `openspec/` 目录存在
3. 确认 `openspec/config.yaml` 存在

### 2. 同步 Agent 指令

```bash
openspec update
```

这会同步 `.cursor/commands/` 和 `.cursor/skills/` 下的官方文件。

### 3. 验证 config.yaml

```bash
openspec schema validate
```

确认当前 schema（由 `config.yaml` 中的 `schema:` 指定）有效。

### 4. 验证 schema 文件

```bash
openspec schemas --json
```

确认所有 schema 文件存在且格式正确。

### 5. 输出摘要

```
## Sync 摘要

| 项目 | 状态 |
|------|------|
| config.yaml | ✓ 已验证 |
| Agent 指令 | ✓ 已同步 |
| Schema | ✓ 有效 |

下一步：
- 运行 /opsx-explore 开始探索
- 运行 /opsx-propose 开始提案
```

## Guardrails

- **禁止**在未初始化的项目中运行（openspec/ 目录必须存在）
- **强制**同步后验证 Schema 一致性
- **禁止**同步过程中修改任何业务代码
