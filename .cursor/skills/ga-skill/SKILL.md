---
name: ga-skill
description: GA skill system maintenance — add, remove, or update GA skills.
version: "0.1"
category: ga
tags:
  - ga
  - layer:meta
aliases:
  - /ga-skill
depends_on: []
permissions:
  - file-write
risks:
  - modifies-skills
verify: []
---

Maintain GA skill system.

## Guardrails

- **MUST** create both command file and SKILL.md when adding a new GA skill
- **MUST** remove both command file and SKILL.md when removing a GA skill
- **MUST NOT** modify openspec-* skills

## Subcommands

- `ga-skill add <name>` — add a new GA skill
- `ga-skill remove <name>` — remove a GA skill
- `ga-skill list` — list all GA skills
- `ga-skill validate` — validate all GA skill files

## Output

```
GA Skills:
  ga-upgrade  — /ga-upgrade
  ga-export   — /ga-export
  ga-test     — /ga-test
  ga-report   — /ga-report
  ga-skill    — /ga-skill

Total: 5 GA skills
```
