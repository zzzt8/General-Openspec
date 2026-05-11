---
name: repo-analysis-template
description: Repository Analysis document template. Structure analysis and impact mapping.
schema: _shared
---

## Impact Map

| Layer | Modules | Reason |
|-------|---------|--------|
| engine | ... | ... |
| backend | ... | ... |
| editor | ... | ... |
| runtime | ... | ... |
| ui-skin | ... | ... |

## Relevant Directories

```
affected/
├── packages/engine/src/
├── server/src/
├── apps/editor/src/
├── apps/app/src/
└── packages/ui/src/
```

## Key Modules

### [Module Name]

- **Location**: `...`
- **Responsibility**: ...
- **Data flow**: ...
- **Call chain**: ...

## Reuse Points

- Existing ... module can be reused
- shared-types standard interfaces

## Existing Issues

1. ...
2. ...

## Impact Summary

- **New dependencies**: ...
- **Breaking changes**: ...
- **Backward compatible**: ...

## Data Flow Changes

```
[Before]
...

[After]
...
```
