# fix-commands-and-git-readiness Specification

## Purpose
TBD - created by archiving change fix-commands-and-git-readiness. Update Purpose after archive.
## Requirements
### Requirement: Cursor Slash Commands Available

The system SHALL expose all OpenSpec workflow commands in the Cursor IDE command palette via the `.cursor/commands/` directory. Each command file MUST reference its corresponding SKILL.md as the source of truth.

#### Scenario: Command file exists

- **WHEN** a user types `/opsx` in the Cursor chat input
- **THEN** the command palette SHALL display all available commands (onboard, sync, explore, propose, review, test-design, apply, verify, archive, debug, plan, continue, skip, sync-specs)
- **AND** each command entry SHALL trigger the corresponding SKILL.md workflow

#### Scenario: Command file references SKILL.md

- **WHEN** a command file is executed
- **THEN** the system SHALL load the content from the corresponding `.cursor/skills/<name>/SKILL.md`
- **AND** the SKILL.md SHALL contain the complete workflow logic, guardrails, and implementation steps

### Requirement: Git Version Control Initialized

The system SHALL initialize a git repository with an initial commit capturing the current project state (v5.3 snapshot).

#### Scenario: Git repository initialization

- **WHEN** `git init` is executed in the project root
- **THEN** a `.git/` directory SHALL be created
- **AND** an initial commit SHALL be created with the message "Initial commit: OpenSpec v5.3 Skill System snapshot"
- **AND** `git log --oneline` SHALL show exactly one commit

#### Scenario: Gitignore excludes test artifacts

- **WHEN** the git repository is initialized
- **THEN** a `.gitignore` file SHALL be created excluding: `node_modules/`, `openspec/changes/`, `openspec/changes/archive/`, `*.log`
- **AND** test artifacts and archived changes SHALL NOT appear in `git status`

### Requirement: Version Numbers Unified

All SKILL.md files SHALL declare the same version in their frontmatter, matching the CHANGELOG version (v5.3).

#### Scenario: SKILL.md frontmatter version

- **WHEN** `openspec schemas` is executed
- **THEN** every SKILL.md file under `.cursor/skills/` SHALL have `version: "5.3"` in its YAML frontmatter
- **AND** the SKILL-INDEX.md SHALL reflect the same version

### Requirement: CHANGELOG Corrected

The CHANGELOG-V5.3.md SHALL accurately describe the `.cursor/commands/` directory as "规范化" (normalized) rather than "已删除" (deleted).

#### Scenario: CHANGELOG Bug #4 documented

- **WHEN** the CHANGELOG-V5.3.md is read
- **THEN** it SHALL contain a Bug #4 entry describing the `.cursor/commands/` directory issue
- **AND** the description SHALL use the phrase "规范化" (normalized) not "已删除" (deleted)

