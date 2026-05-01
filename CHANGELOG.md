# Changelog

All notable changes to General Openspec are documented here.

## [v0.1] — 2026-05-01

### Added

- **Commands restored**: 14 `/opsx-*` slash commands (onboard, sync, explore, propose, review, test-design, apply, verify, archive, debug, plan, continue, skip, sync-specs)
- **Git version control**: Initialized git repository with baseline snapshot
- **Version system**: VERSION file and git tags establish independent version numbering
- **GA upgrade system**: `/ga-*` command namespace for maintaining General Openspec itself
  - `/ga-upgrade` — upgrade to new version
  - `/ga-export` — export clean version package
  - `/ga-test` — run GA test suite
  - `/ga-report` — view upgrade history
  - `/ga-skill` — GA skill system maintenance
