# Spec — git-version-control

> status: baseline
> source: v01-foundation change

## Background

General Openspec 项目通过 git 进行版本控制，使用 VERSION 文件和 git tag 作为版本真相源。

## Purpose

建立项目的版本控制基础设施，支持版本追溯和增量升级。

## Requirements

### Requirement: Git Version Control

The system SHALL maintain a git repository with meaningful commit history and version tags.

#### Scenario: Git repository initialized

- **WHEN** the project is initialized
- **THEN** a `.git/` directory SHALL exist
- **AND** an initial commit SHALL be created

#### Scenario: Gitignore excludes upgrade artifacts

- **WHEN** the git repository is initialized
- **THEN** a `.gitignore` file SHALL exist excluding build artifacts, test artifacts, and workflow artifacts

### Requirement: VERSION File as Source of Truth

The system SHALL use a `VERSION` file at the project root to indicate the current version.

#### Scenario: VERSION file exists

- **WHEN** `cat VERSION` is executed in the project root
- **THEN** the output SHALL match the format `vX.X` (e.g., `v0.1`)

### Requirement: CHANGELOG Maintained

The system SHALL maintain a `CHANGELOG.md` file recording version history.

#### Scenario: CHANGELOG format

- **WHEN** the CHANGELOG is read
- **THEN** each version entry SHALL use the format `## [vX.X] — YYYY-MM-DD`
