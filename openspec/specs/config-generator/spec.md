# config-generator Specification

## Purpose
TBD - created by archiving change improve-openspec-skills. Update Purpose after archive.
## Requirements
### Requirement: openspec-sync MUST eliminate duplicate config generation heredoc

openspec-sync's `--config` mode MUST call `GENERATE-CONFIG.js` instead of containing heredoc templates. The Skill SHALL remove all heredoc and grep/sed logic, retaining only the confirmation prompts and summary output.

#### Scenario: openspec-sync --config delegates to GENERATE-CONFIG.js

- **WHEN** `/opsx-sync --config` executes
- **THEN** the skill calls `node .cursor/skills/_shared/GENERATE-CONFIG.js --template auto --merge-existing`
- **AND** the skill's SKILL.md contains no heredoc config templates

