# Spec — clean-export

> status: baseline
> source: v01-foundation change

## Background

导出功能将 General Openspec 的当前状态打包为纯净的可移植模板，供用户迁移到目标项目。导出包不包含任何升级因素（VERSION、CHANGELOG、git、GA 系统）。

## Purpose

让 General Openspec 可以快速部署到新项目，提供一个开箱即用的 spec-driven 开发框架模板。

## Requirements

### Requirement: Clean Export Available

The system SHALL export a clean version of General Openspec containing only portable files.

#### Scenario: Export includes portable files

- **WHEN** `/ga-export` is executed
- **THEN** the exported directory SHALL contain:
  - `.cursor/` with commands/ and skills/ directories
  - `openspec/` with schemas/, specs/, config.yaml
  - `README.md`

#### Scenario: Export excludes upgrade artifacts

- **WHEN** `/ga-export` is executed
- **THEN** the export SHALL NOT contain:
  - `.git/` directory
  - `VERSION` file
  - `CHANGELOG.md`
  - `openspec/docs/ga-reports/`
  - `openspec/changes/` or its archive
  - `openspec/test-artifacts/`

#### Scenario: Export naming

- **WHEN** exporting version v0.1
- **THEN** the export directory SHALL be named `General Openspec_v0.1/`
