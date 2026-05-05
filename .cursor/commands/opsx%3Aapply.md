# /opsx:apply

Implement OpenSpec change tasks. Supports resume from checkpoint, incremental verification, dependency scheduling.

## Before doing anything

1. Read `.cursor/skills/openspec-apply/SKILL.md`.
2. Follow that skill as the source of truth.
3. Do not implement from this stub alone.

## Syntax

- `/opsx:apply <change-name> --from <task-id>` — execute specific task
- `/opsx:apply <change-name>` — start from first incomplete task
- `/opsx:apply` — find active change via `openspec status --json`

See `.cursor/skills/openspec-apply/SKILL.md` for full implementation.
