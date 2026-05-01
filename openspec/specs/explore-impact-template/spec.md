# explore-impact-template Specification

## Purpose
TBD - created by archiving change improve-openspec-skills. Update Purpose after archive.
## Requirements
### Requirement: Task Anchor declaration MUST be output before structure analysis

The Skill's execution flow MUST output the Task Anchor declaration BEFORE the "Structure Analysis Priority" step. The declaration is labeled "强制输出" and the Guardrail states: "强制在结构分析前输出 Task Anchor 声明块".

#### Scenario: Task Anchor precedes structure analysis in execution order

- **WHEN** `/opsx-explore` begins executing
- **THEN** the Task Anchor declaration section is output before the "Structure Analysis Priority" step
- **AND** the Guardrail "强制在结构分析前输出 Task Anchor 声明块" is enforced

### Requirement: Quantified switch criteria MUST provide actionable gate status via checkbox format

Each criterion in the "must satisfy" and "strongly recommend" lists SHALL be rendered as a checkbox (`- [ ]` = not met, `- [x]` = met) in the Impact Map's "Propose Readiness" section. This provides a clear visual gate status.

#### Scenario: Propose Readiness gate criteria use checkbox format

- **WHEN** `/opsx-explore` generates the Impact Map's Propose Readiness section
- **THEN** each criterion is rendered as `- [ ]` (not met) or `- [x]` (met)
- **AND** "must satisfy" gates are visually distinct from "strongly recommend" gates

