# xplat-abstraction Specification

## Purpose
TBD - created by archiving change improve-openspec-skills. Update Purpose after archive.
## Requirements
### Requirement: SCHEMA.md MUST define xplat as the shared layer authority

SCHEMA.md explicitly states that all executable scripts MUST use xplat functions from `_xplat.ps1` (Windows) or `_xplat.sh` (Unix). The document SHALL include a "Cross-Platform Compliance" section requiring all bash snippets in Skills to be migrated to xplat calls.

#### Scenario: SCHEMA.md contains Cross-Platform Compliance section

- **WHEN** a user reads SCHEMA.md
- **THEN** they find a "Cross-Platform Compliance" section declaring xplat as the required abstraction layer
- **AND** the section lists all mandatory xplat functions with their purposes

### Requirement: SHARED-LAYERS.md MUST be the single source of executable layer logic

SHARED-LAYERS.md contains the canonical xplat-aware implementations of layer detection and verify command resolution. SCHEMA.md references SHARED-LAYERS.md as the implementation source. All executable layer logic MUST be centralized in SHARED-LAYERS.md.

#### Scenario: SHARED-LAYERS.md contains no overlapping bash with SCHEMA.md

- **WHEN** a user reads SHARED-LAYERS.md
- **THEN** they find complete xplat-aware layer detection and verify command implementations
- **AND** SCHEMA.md references SHARED-LAYERS.md as the source without duplicating executable logic

