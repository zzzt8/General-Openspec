---
name: /opsx:verify
id: opsx-verify
category: Workflow
description: Verify implementation matches change artifacts before archiving
---

Verify that an implementation matches the change artifacts (proposal, tasks).

**Input**: Optionally specify a change name after `/opsx:verify` (e.g., `/opsx:verify add-auth`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **If no change name provided, prompt for selection**

   Run `openspec list --json` to get available changes. Use the **AskUserQuestion tool** to let the user select.

   Show changes that have implementation tasks (tasks artifact exists).
   Include the schema used for each change if available.
   Mark changes with incomplete tasks as "(In Progress)".

   **IMPORTANT**: Do NOT guess or auto-select a change. Always let the user choose.

2. **Check status to understand the schema**
   ```bash
   openspec status --change "<name>" --json
   ```
   Parse the JSON to understand:
   - `schemaName`: The workflow being used (e.g., "rapid")
   - Which artifacts exist for this change

3. **Get the change directory and load artifacts**

   ```bash
   openspec instructions apply --change "<name>" --json
   ```

   This returns the change directory and `contextFiles` (artifact ID -> array of concrete file paths). Read all available artifacts from `contextFiles`.

4. **Initialize verification report structure**

   Create a report structure with three dimensions:
   - **Completeness**: Track tasks and spec coverage
   - **Correctness**: Track requirement implementation and scenario coverage
   - **Coherence**: Track adherence to proposal scope and pattern consistency

   Each dimension can have CRITICAL, WARNING, or SUGGESTION issues.

5. **Verify Completeness**

   **Task Completion**:
   - If `contextFiles.tasks` exists, read every file path in it
   - Parse checkboxes: `- [ ]` (incomplete) vs `- [x]` (complete)
   - Count complete vs total tasks
   - If incomplete tasks exist:
     - Add CRITICAL issue for each incomplete task
     - Recommendation: "Complete task: <description>" or "Mark as done if already implemented"

   **BCF Coverage** (if proposal.md exists):
   - Extract the BCF table from proposal.md (entry → key steps → exit → acceptance criteria)
   - For each BCF row:
     - Verify implementation covers the described path
     - If BCF path appears unimplemented:
       - Add CRITICAL issue: "BCF path not implemented: <BCF description>"
       - Recommendation: "Implement or update BCF to match reality"

6. **Verify Correctness**

   **BCF Implementation Mapping**:
   - For each BCF from proposal.md:
     - Search codebase for implementation evidence matching the described path
     - If found, note file paths and line ranges
     - Assess if implementation matches BCF intent
     - If divergence detected:
       - Add WARNING: "Implementation may diverge from BCF: <details>"
       - Recommendation: "Review <file>:<lines> against BCF X"

   **Scenario Coverage**:
   - If scenarios are described in proposal.md (under BCF):
     - Check if conditions are handled in code
     - If scenario appears uncovered:
       - Add WARNING: "Scenario not covered: <scenario name>"
       - Recommendation: "Add test or implementation for scenario: <description>"

7. **Verify Coherence**

   **Proposal/Scope Adherence**:
   - If `proposal.md` exists:
     - Extract the Scope and BCF sections
     - Verify implementation aligns with the scoped scope
     - If divergence detected:
       - Add WARNING: "Implementation diverges from proposal scope: <details>"
       - Recommendation: "Update implementation or revise proposal.md to match reality"
   - If no proposal.md: Skip scope adherence check, note "No proposal.md to verify against"

   **Code Pattern Consistency**:
   - Review new code for consistency with project patterns
   - Check file naming, directory structure, coding style
   - If significant deviations found:
     - Add SUGGESTION: "Code pattern deviation: <details>"
     - Recommendation: "Consider following project pattern: <example>"

8. **Generate Verification Report**

   **Summary Scorecard**:
   ```
   ## Verification Report: <change-name>

   ### Summary
   | Dimension    | Status           |
   |--------------|------------------|
   | Completeness | X/Y tasks, N BCFs  |
   | Correctness  | M/N BCFs covered   |
   | Coherence    | Followed/Issues  |
   ```

   **Issues by Priority**:

   1. **CRITICAL** (Must fix before archive):
      - Incomplete tasks
      - Missing BCF implementations
      - Each with specific, actionable recommendation

   2. **WARNING** (Should fix):
      - Spec/proposal divergences
      - Missing scenario coverage
      - Each with specific recommendation

   3. **SUGGESTION** (Nice to fix):
      - Pattern inconsistencies
      - Minor improvements
      - Each with specific recommendation

   **Final Assessment**:
   - If CRITICAL issues: "X critical issue(s) found. Fix before archiving."
   - If only warnings: "No critical issues. Y warning(s) to consider. Ready for archive (with noted improvements)."
   - If all clear: "All checks passed. Ready for archive."

**Verification Heuristics**

- **Completeness**: Focus on objective checklist items (checkboxes, requirements list)
- **Correctness**: Use keyword search, file path analysis, reasonable inference - don't require perfect certainty
- **Coherence**: Look for glaring inconsistencies, don't nitpick style
- **False Positives**: When uncertain, prefer SUGGESTION over WARNING, WARNING over CRITICAL
- **Actionability**: Every issue must have a specific recommendation with file/line references where applicable

**Graceful Degradation**

- If only tasks.md exists: verify task completion only
- If tasks + proposal exist: verify completeness and scope adherence
- If full artifacts: verify all three dimensions
- Always note which checks were skipped and why

**Output Format**

Use clear markdown with:
- Table for summary scorecard
- Grouped lists for issues (CRITICAL/WARNING/SUGGESTION)
- Code references in format: `file.ts:123`
- Specific, actionable recommendations
- No vague suggestions like "consider reviewing"
