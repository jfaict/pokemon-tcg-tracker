# Tasks: <feature name>

---
references:
  - requirements.md
  - design.md
  - decision-log.md
---

> Coding tasks only. Test-driven. Max 2 levels of nesting (1.1 ✓, 1.1.1 ✗).
> Each subtask references the requirement it satisfies.

- [ ] 1. <main task>
  - [ ] 1.1 Write unit tests for <X>
        - References: REQ 1.1, 1.3
  - [ ] 1.2 Implement <X>
        - References: REQ 1.1, 1.3
- [ ] 2. <main task>
  - [ ] 2.1 …

## Definition of done
- All boxes checked
- All tests green
- Linter clean
- Decision log updated for any choices made during execution
- `user-docs/` regenerated for any user-visible change
