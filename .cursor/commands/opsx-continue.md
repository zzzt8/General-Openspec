# /opsx-continue

Resume from checkpoint — continue an unfinished change. Pure locator: finds the active change, locates the next task, and outputs the resume command.

## Before doing anything

1. Read `.cursor/skills/openspec-continue/SKILL.md`.
2. Follow that skill as the source of truth.
3. Do not execute any task logic — only locate the checkpoint.
4. If the skill file cannot be read, stop and report the missing skill.

## Syntax

- `/opsx-continue` — resume the active change
- `/opsx-continue <change-name>` — resume a specific change

See `.cursor/skills/openspec-continue/SKILL.md` for full implementation.
