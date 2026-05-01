---
name: ga-test
description: Run the GA test suite to verify General Openspec integrity.
version: "0.1"
category: ga
tags:
  - ga
  - layer:meta
aliases:
  - /ga-test
depends_on: []
permissions: []
risks: []
verify: []
---

Run the GA test suite.

## Guardrails

- **MUST** run all tests in `ga-test/` directory
- **MUST** report pass/fail count for each test
- **MUST** exit with non-zero code if any test fails
- **MUST NOT** modify any files during test execution

## Steps

1. Discover all test files in `ga-test/*.test.js`
2. Run each test file with Node.js
3. Collect results
4. Report summary

## Output

```
GA Test Suite — General Openspec vX.X

GA-TC01: opsx commands exist     — PASS
GA-TC02: opsx commands format   — PASS
GA-TC03: ga-upgrade guardrails  — PASS
GA-TC04: ga-export guardrails   — PASS
GA-TC05: export structure        — PASS
SK-TC01: ga commands exist      — PASS
SK-TC02: ga commands format     — PASS
SK-TC03: SKILL.md frontmatter   — PASS
SK-TC04: openspec validate      — PASS
SK-TC05: git initialized        — PASS
SK-TC06: .gitignore valid       — PASS
SK-TC07: VERSION exists         — PASS
SK-TC08: CHANGELOG format      — PASS

Total: 13/13 PASS
```
