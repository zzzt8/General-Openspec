# archive-test Specification

## Purpose
TBD - created by archiving change opsx-archive-test. Update Purpose after archive.
## Requirements
### Requirement: openspec archive 命令必须正确归档完成的 change

`openspec archive <change-name>` MUST move the completed change to the archive directory and update specs.

#### Scenario: 正常归档
- **WHEN** 用户执行 `openspec archive "opsx-archive-test" --yes`
- **THEN** change 目录移到 `openspec/changes/archive/<date>-opsx-archive-test/`

