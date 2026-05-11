# /opsx-sync

Sync OpenSpec CLI and Skill system. Generate/update config.yaml, sync agent instructions, sync schemas.

## Before doing anything

1. Read `.cursor/skills/openspec-sync/SKILL.md`.
2. Follow that skill as the source of truth.
3. Do not execute from this stub alone.
4. If the skill file cannot be read, stop and report the missing skill.

## Syntax

- `/opsx-sync` — full sync
- `/opsx-sync --config` — sync config.yaml only
- `/opsx-sync --agents` — sync agent instructions only

See `.cursor/skills/openspec-sync/SKILL.md` for full implementation.
