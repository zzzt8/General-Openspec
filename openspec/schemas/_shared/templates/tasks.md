---
name: tasks-template
description: Tasks document template. Implementation checklist with quality gates.
schema: _shared
---

## BCF Implementation

<!-- Corresponding to each row in proposal BCF table. Required for medium/high changes. -->

- [ ] BCF-1: <!-- brief description of verification process and results -->

## Layer Implementation

<!-- In priority order: engine > backend > editor > runtime > ui-skin > meta -->

### engine

<!-- Core business logic, state management, data layer -->

- [ ] T1: [Task description]

### backend

<!-- API endpoints, data models, database changes -->

- [ ] T2: [Task description]

### editor

<!-- Editor-related logic -->

- [ ] T3: [Task description]

### runtime

<!-- Main application runtime logic -->

- [ ] T4: [Task description]

### ui-skin

<!-- UI components, styles, interactions -->

- [ ] T5: All buttons/links/form controls have real handlers (no empty onClick)

## Quality Gates

<!-- Required for all change classes -->

- [ ] Code passes typecheck
- [ ] No placeholder components (no `onClick={() => {}}` or empty handlers)
- [ ] UI correctly extracts and uses key fields from API response
- [ ] All BCF verified in real environment (connected backend + database)

## Delivery Confirmation

<!-- User confirms after all tasks complete -->

- [ ] All BCF verified in real environment
- [ ] E2E smoke tests cover all BCF (if E2E tests exist)
- [ ] User confirms delivery and agrees to commit
