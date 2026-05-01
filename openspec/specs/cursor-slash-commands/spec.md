# Spec — cursor-slash-commands

> status: baseline
> source: v01-foundation change

## Background

General Openspec 使用 `.cursor/commands/` 目录向 Cursor IDE 暴露 slash 命令。Cursor 扫描该目录下所有 `.md` 文件，将文件名（不带扩展名）作为命令名暴露给用户。

## Purpose

提供可发现的命令行入口，让用户在 Cursor 中通过 `/opsx-*` 触发 OpenSpec workflow 命令。

## Requirements

### Requirement: Cursor Slash Commands Available

The system SHALL expose all OpenSpec workflow commands in the Cursor IDE command palette via the `.cursor/commands/` directory.

#### Scenario: Command file exists

- **WHEN** a user types `/opsx` in the Cursor chat input
- **THEN** the command palette SHALL display workflow commands
- **AND** each command entry SHALL trigger the corresponding SKILL.md workflow

#### Scenario: Command file references SKILL.md

- **WHEN** a command file is executed
- **THEN** the system SHALL load the content from the corresponding `.cursor/skills/<name>/SKILL.md`
- **AND** the SKILL.md SHALL contain the complete workflow logic, guardrails, and implementation steps
