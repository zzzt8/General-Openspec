# Changelog

All notable changes to General Openspec are documented here.

## [v0.2] — 2026-05-02

### Added

- **GA upgrade system activated**: First successful self-upgrade using `/ga-upgrade` workflow
  - Test branch created: `ga-test/v0.2`
  - GA test suite: 12/12 PASS
  - Upgrade report generated at `openspec/docs/ga-reports/v0.2-upgrade-report.md`

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
