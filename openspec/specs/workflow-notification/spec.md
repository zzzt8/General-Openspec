# workflow-notification Specification

## Purpose
TBD - created by archiving change workflow-integration-test-9. Update Purpose after archive.
## Requirements
### Requirement: Start notification

当用户执行 `openspec notify start <change-name>` 或 /opsx-apply 流程开始时，系统 SHALL 输出包含以下字段的开始通知：
- `type`: "start"
- `change`: change name
- `timestamp`: ISO 8601 格式时间戳
- `phase`: 当前执行阶段

#### Scenario: Start notification with valid change name
- **WHEN** 用户执行 `openspec notify start my-change`
- **THEN** 系统输出 JSON 格式的开始通知，包含 change name 和当前时间戳

#### Scenario: Start notification during apply workflow
- **WHEN** /opsx-apply 流程开始处理第一个任务
- **THEN** 系统自动输出开始通知，包含 change name 和 "apply" 阶段

### Requirement: Progress notification

系统 SHALL 在每个任务完成后输出进度通知，包含：
- `type`: "progress"
- `change`: change name
- `completed_tasks`: 已完成任务数
- `total_tasks`: 总任务数
- `current_task`: 当前完成的任务描述

#### Scenario: Progress update after task completion
- **WHEN** /opsx-apply 完成第 2 个任务（共 5 个任务）
- **THEN** 系统输出进度通知，显示 "2/5 tasks complete"

### Requirement: Complete notification

当用户执行 `openspec notify complete <change-name>` 或所有任务完成时，系统 SHALL 输出包含以下字段的完成通知：
- `type`: "complete"
- `change`: change name
- `timestamp`: ISO 8601 格式时间戳
- `status`: "success" 或 "partial"

#### Scenario: Completion notification
- **WHEN** 用户执行 `openspec notify complete my-change`
- **THEN** 系统输出包含 change name、完成时间戳和 "success" 状态的完成通知

### Requirement: JSON output format

所有通知 SHALL 以 JSON 格式输出到 stdout，确保可被外部工具解析。

#### Scenario: JSON format validation
- **WHEN** 系统输出任何通知
- **THEN** 输出必须是有效的 JSON 格式，可被 `jq` 解析

