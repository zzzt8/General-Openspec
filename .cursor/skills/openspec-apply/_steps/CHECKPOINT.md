# Checkpoint Step

> This step is referenced by openspec-apply. Used for resuming interrupted tasks.

## Checkpoint State

After each task completes, record:
- The current task ID
- The baseline git ref (for incremental diff)
- Any relevant context for resume

## Checkpoint Format in tasks.md

```markdown
- [x] Task 1: Implement user auth
  task-id: T1
  layer: engine
  baseline_ref: abc1234
  completed_at: 2026-05-05

- [ ] Task 2: Add auth middleware
  task-id: T2
  layer: backend
  baseline_ref:
```

## Finding the Resume Point

```bash
# Find the first incomplete task with satisfied dependencies
incomplete=$(openspec status --change "<name>" --json | jq -r '.tasks[] | select(.status == "todo") | .id' | head -1)

if [ -z "$incomplete" ]; then
  echo "All tasks complete"
else
  echo "Resume from: $incomplete"
fi
```

## Large Task Split Decision

Split a task if any condition is met:
- Estimated to modify > 5 files
- Spans > 3 sub-modules
- Touches > 2 layers

Split direction:
- Can it run as a minimal independent feature? → Split into T1a + T1b + T1c
- Has clear sequential dependency? → Split into ordered independent tasks
- Touches multiple layers? → Split by layer
