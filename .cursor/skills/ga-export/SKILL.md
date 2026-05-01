---
name: ga-export
description: Export a clean version of General Openspec as a portable template, excluding all upgrade artifacts.
version: "0.1"
category: ga
tags:
  - ga
  - layer:meta
aliases:
  - /ga-export
depends_on: []
permissions:
  - file-write
risks:
  - creates-files
verify: []
---

Export a clean version of General Openspec.

## Guardrails

- **MUST** export to a directory named `General Openspec_vX.X/`
- **MUST** include `.cursor/commands/`, `.cursor/skills/`, `.cursor/README.md`
- **MUST** include `openspec/schemas/`, `openspec/specs/`, `openspec/config.yaml`
- **MUST** include `README.md`
- **MUST NOT** include `.git/` directory
- **MUST NOT** include `VERSION` file
- **MUST NOT** include `CHANGELOG.md`
- **MUST NOT** include `openspec/docs/ga-reports/`
- **MUST NOT** include `openspec/changes/` or archive
- **MUST NOT** include test artifacts (`openspec/test-artifacts/`, `openspec/docs/full-workflow-test-report-*.md`)

## Steps

1. Read VERSION file to get current version
2. Create export directory: `D:\Desktop\Product\General Openspec_vX.X\`
3. Copy required files/directories:
   - `.cursor/commands/` (all .md files)
   - `.cursor/skills/` (all skills directories)
   - `.cursor/README.md`
   - `openspec/schemas/`
   - `openspec/specs/`
   - `openspec/config.yaml`
   - `README.md`
4. Create `.gitignore` in export root
5. Verify export structure matches v5.0 reference
6. Generate export manifest

## Output

```
Export: General Openspec_vX.X
Location: D:\Desktop\Product\General Openspec_vX.X\

Included:
  - .cursor/commands/ (14 files)
  - .cursor/skills/ (19 skills)
  - openspec/schemas/ (schemas)
  - openspec/specs/ (6 specs)
  - openspec/config.yaml
  - README.md

Excluded (upgrade artifacts):
  - .git/
  - VERSION
  - CHANGELOG.md
  - openspec/docs/ga-reports/
  - openspec/changes/
  - openspec/test-artifacts/

Export complete.
```
