# Test Failure Attribution Step

> This step is referenced by openspec-apply and openspec-verify. Execute when tests fail during verification.

## Three-Dimensional Scoring

For each failing test, score across three dimensions:

```
Dimension 1: File Coverage (does the test file exist in git diff?)
  1.0 — test file completely within git diff
  0.5 — test file partially within git diff (via shared module)
  0.0 — test file not in git diff

Dimension 2: Call Chain (do the test's called functions overlap with changes?)
  1.0 — test calls core functions within the change
  0.5 — test calls functions via >2 level indirect chain
  0.0 — no call chain overlap

Dimension 3: Failure Signature (does error message match the change?)
  1.0 — error points to specific changed code location
  0.5 — error type matches the types/interfaces changed
  0.0 — error type unrelated to this change

Total = Dim1 + Dim2 + Dim3
```

## Attribution Matrix

| Total Score | Attribution | Action |
|-------------|------------|--------|
| >= 2.0 | `related` | Hard gate: must fix |
| 1.0 - 1.5 | `undetermined` | Meta layer: warning + record, continue. Non-meta: hard gate |
| <= 0.5 | `unrelated_proven` | Record attribution, continue |
| historical flaky | `flaky_proven` | Record attribution, continue |

## Attribution Declaration Template

```markdown
## Test Failure Attribution

**Failed Tests:**
| Test Name | Dim1 | Dim2 | Dim3 | Total | Attribution |
|-----------|------|------|------|-------|------------|
| [TC-xxx]  | X    | X    | X    | X.X    | related / unrelated_proven / flaky_proven / undetermined |

**Attribution Analysis:**
| Test | Attribution | Evidence | Score |
|------|------------|----------|-------|
| [TC-xxx] | ... | git diff / call chain / failure signature | X/X/X |
```

## Hard Gate Conditions

If `related` or `undetermined` (non-meta layer) exists:
- Output: `[opsx-apply] Test Failure Attribution blocking`
- Go to `/opsx:debug` with attribution analysis
- Do NOT mark task as complete

If `undetermined` (meta layer) exists:
- Output: `[opsx-apply] WARNING: undetermined attribution (meta layer) - <test> - score: X/X/X`
- Record in attribution table
- Continue execution
