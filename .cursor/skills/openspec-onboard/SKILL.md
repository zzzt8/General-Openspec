---
name: openspec-onboard
description: Guided onboarding for OpenSpec - walk through a complete workflow cycle with narration and real codebase work.
version: "5.3"
category: onboard
tags:
  - openspec
  - layer:meta
aliases:
  - /opsx-onboard
depends_on: []
permissions: []
risks: []
verify: []
---

Guide the user through a complete OpenSpec workflow cycle. Teaching experience — do real work while explaining each step.

## Preflight

Check if OpenSpec CLI is installed:

```bash
openspec --version 2>&1 || echo "CLI_NOT_INSTALLED"
```

If not installed, stop and direct the user to install first.

## Workflow Overview

The full cycle:

```
Explore  ->  New  ->  Proposal  ->  Specs  ->  Design  ->  Tasks  ->  Apply  ->  Archive
```

**Time estimate:** ~15-20 minutes for a small task.

## Phases

### Phase 1: Welcome

```
## Welcome to OpenSpec!

I'll walk you through the complete workflow - idea to archive.

We'll:
1. Pick a small, real task in your codebase
2. Explore the problem
3. Create a change and build all artifacts
4. Implement the tasks
5. Archive the completed change

Time: ~15-20 minutes. Let's start!
```

### Phase 2: Task Selection

Scan for quick improvement opportunities:
- TODO/FIXME/HACK comments
- Missing error handling (`catch` that swallows errors)
- Functions without tests
- `any` types in TypeScript
- `console.log` in production code

Present 3-4 suggestions with location, scope estimate, and why it's a good starter task.

If nothing found, ask what the user wants to build.

**Scope guardrail:** If the task is too large, gently guide toward a smaller slice. Learning the workflow works best with a quick win.

### Phase 3: Explore Demo

Briefly demonstrate explore mode — investigate the relevant code for 1-2 minutes. Show what you find.

```
Explore mode (`/opsx:explore`) is for thinking through problems before committing to a direction. You can use it anytime.
```

Pause for acknowledgment.

### Phase 4: Create the Change

**Explain:** A "change" is a container holding all artifacts for a piece of work, lives in `openspec/changes/<name>/`.

**Do:**
```bash
openspec new change "<derived-name>"
```

### Phase 5: Build Artifacts

Walk through creating all artifacts:

- **Proposal** — captures WHY. Draft it, pause for approval, save.
- **Specs** — defines WHAT in testable terms (WHEN/THEN/AND scenarios).
- **Design** — captures HOW (technical decisions, tradeoffs).
- **Tasks** — breaks work into checkboxes driving apply.

For a small task, each artifact can be brief. That's fine.

Pause after each artifact for feedback before saving.

### Phase 6: Apply (Implementation)

**Explain:** Now implement each task, checking them off as we go. Reference specs/design naturally.

For each task:
1. Announce: "Working on task N: [description]"
2. Implement in codebase
3. Mark complete: `- [ ]` -> `- [x]`
4. Brief status: "✓ Task N complete"

Keep narration light.

### Phase 7: Archive

**Explain:** Archive moves the change from `openspec/changes/` to `openspec/changes/archive/YYYY-MM-DD-<name>/`. The decision record is preserved.

**Do:**
```bash
openspec archive "<name>"
```

### Phase 8: Recap

```
## Congratulations!

You completed the full OpenSpec cycle:
1. Explore - Think through the problem
2. New - Create a change container
3. Proposal - Capture WHY
4. Specs - Define WHAT
5. Design - Decide HOW
6. Tasks - Break into steps
7. Apply - Implement
8. Archive - Preserve the record

This works for any size change.

## Command Reference

| Command              | What it does                    |
|----------------------|--------------------------------|
| `/opsx:propose`    | Create change + all artifacts  |
| `/opsx:explore`    | Think through problems         |
| `/opsx:apply`      | Implement tasks                |
| `/opsx:archive`    | Archive when done              |
| `/opsx:continue`   | Resume existing change         |
| `/opsx:verify`     | Verify implementation          |

Try `/opsx:propose` on something you want to build!
```

## Graceful Exit

If user wants to stop mid-way:
```
Your change is saved at `openspec/changes/<name>/`.
Use `/opsx:continue <name>` to pick up later.
```

If user just wants command reference, show the table above and exit.

## Guardrails

- **Follow EXPLAIN -> DO -> SHOW -> PAUSE** at key transitions
- **Keep narration light** — teach without lecturing
- **Don't skip phases** even if the task is small (goal is teaching the workflow)
- **Handle exits gracefully** — never pressure the user
- **Use real codebase tasks** — don't simulate
- **Adjust scope gently** — guide toward smaller tasks but respect user choice
