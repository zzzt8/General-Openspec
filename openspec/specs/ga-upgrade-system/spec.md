# Spec — ga-upgrade-system

> status: baseline
> source: v01-foundation change

## Background

GA（General Agent）升级系统是一套独立于 OpenSpec workflow 的命令命名空间，用于维护 General Openspec 项目本身。命名空间前缀为 `/ga-*`，与 `/opsx-*` workflow 命令完全分离。

## Purpose

让 General Openspec 具备自我迭代能力，通过标准化的升级流程不断演进。

## Requirements

### Requirement: GA Command Namespace

The system SHALL provide a separate command namespace (`/ga-*`) for maintaining General Openspec itself.

#### Scenario: GA commands available

- **WHEN** a user types `/ga` in the Cursor chat input
- **THEN** the command palette SHALL display GA commands

#### Scenario: GA commands reference SKILL.md

- **WHEN** a GA command is executed
- **THEN** the system SHALL load the content from the corresponding `.cursor/skills/ga-<name>/SKILL.md`

### Requirement: GA Upgrade Workflow

The `/ga-upgrade` command SHALL upgrade General Openspec to a new version via a defined workflow.

#### Scenario: Upgrade workflow steps

- **WHEN** `/ga-upgrade` is executed
- **THEN** the system SHALL follow a defined upgrade workflow
  - Run GA test suite
  - If tests pass: create git tag, update VERSION, append to CHANGELOG
  - If any test fails: report failure and abort

#### Scenario: VERSION file updated

- **WHEN** a successful upgrade completes
- **THEN** the VERSION file SHALL contain the new version string

#### Scenario: CHANGELOG updated

- **WHEN** a successful upgrade completes
- **THEN** `CHANGELOG.md` SHALL have a new entry appended

### Requirement: GA Test Suite

The system SHALL provide a test suite that validates General Openspec integrity.

#### Scenario: Test suite exists

- **WHEN** `node ga-test/run-all.js` is executed
- **THEN** the test suite SHALL report pass/fail for each test
- **AND** exit with non-zero code if any test fails
