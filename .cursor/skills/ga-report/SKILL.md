---
name: ga-report
description: View GA upgrade history and reports.
version: "0.1"
category: ga
tags:
  - ga
  - layer:meta
aliases:
  - /ga-report
depends_on: []
permissions: []
risks: []
verify: []
---

View GA upgrade history.

## Guardrails

- **MUST** read reports from `openspec/docs/ga-reports/`
- **MUST** display git tag history

## Steps

1. List all git tags
2. Read all upgrade reports from `openspec/docs/ga-reports/`
3. Display summary

## Output

```
GA Upgrade History

Tags:
  v0.1 — 2026-05-01 — Initial baseline

Reports:
  v0.1-upgrade-report.md — available
```
