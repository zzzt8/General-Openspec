---
name: ga-upgrade
description: Upgrade General Openspec to a new version. Creates test branch, runs GA test suite, creates git tag, updates VERSION and CHANGELOG.
version: "0.1"
category: ga
tags:
  - ga
  - layer:meta
aliases:
  - /ga-upgrade
depends_on: []
permissions:
  - file-write
risks:
  - modifies-git
  - modifies-files
verify: []
---

Upgrade General Openspec to a new version.

## Guardrails

- **MUST** create a test branch (`ga-test/vX.X`) before running tests
- **MUST** run GA test suite before tagging
- **MUST** update VERSION file with new version
- **MUST** append new entry to CHANGELOG.md
- **MUST** create git tag only after all tests pass
- **MUST** clean up test branch after successful upgrade
- **MUST NOT** modify files outside of VERSION, CHANGELOG.md, and test artifacts
- **MUST NOT** proceed if any test fails

## Steps

1. Parse new version from user input (e.g., `v0.2`)
2. Create test branch: `git checkout -b ga-test/vX.X`
3. Run GA test suite: `node ga-test/run-all.js`
4. If all tests pass:
   - Merge test branch to main
   - Create git tag: `git tag vX.X`
   - Update VERSION file
   - Append to CHANGELOG.md
   - Generate upgrade report: `openspec/docs/ga-reports/vX.X-upgrade-report.md`
5. If any test fails:
   - Report failure
   - Delete test branch
   - Abort

## Output

```
## GA Upgrade Report — vX.X

Date: YYYY-MM-DD
Status: SUCCESS / FAILED

Tests Run: N
Tests Passed: N
Tests Failed: N

Git Tag: vX.X
VERSION: updated
CHANGELOG: updated

Upgrade report saved to: openspec/docs/ga-reports/vX.X-upgrade-report.md
```
