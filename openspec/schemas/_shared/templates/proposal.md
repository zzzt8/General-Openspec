---
name: proposal-template
description: Proposal document template. Captures change motivation and impact scope with BCF.
schema: _shared
---

## Why

<!-- Describe the reason for this change. What problem does it solve? Why now? -->

## What Changes

<!-- List specific changes. New / Modified / Removed capabilities. Use **BREAKING** for breaking changes. -->

## Capabilities

### New Capabilities

<!-- New capabilities introduced. Format: `<name>`: <description>. Each corresponds to specs/<name>/spec.md -->
- `<name>`: <description>

### Modified Capabilities

<!-- Existing capabilities with changed requirements. Only when spec-level behavior changes. -->
- `<existing-name>`: <change>

## Impact

<!-- Affected code, APIs, dependencies, systems -->

## BCF (Core Business Flows)

<!-- Identify and list BCF for affected pages.
BCF = complete loop from entry to exit + acceptance criteria.
Required for medium/high changes. -->

| BCF | Entry | Key Steps | Exit | Acceptance Criteria |
|-----|-------|-----------|------|---------------------|
| BCF-1 | <!-- entry page --> | <!-- step1 -> step2 -> ... --> | <!-- exit page --> | <!-- how to verify --> |

## Out of Scope

<!-- Explicitly excluded scope. If BCF doesn't apply, explain why here. -->

## Acceptance

- [ ] All BCF paths verified
- [ ] No placeholder components (all controls have real handlers)
- [ ] UI consumes real API data
- [ ] Code compiles without errors
