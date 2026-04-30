# AI Harness

Before making changes, read:

1. `PROJECT_STATE.md` — current status, active goal, blockers, and next work.
2. `CHECKS.md` — commands and manual checks that prove a change is safe.
3. `DECISIONS.md` — decisions that should not be re-litigated casually.
4. `GITHUB_WORKFLOW.md` — issue, branch, PR, and sync rules.
5. `.brand.json` and existing mockups for product/visual direction.
6. `package.json` for available Expo/Jest commands.

## Operating Rules

- Preserve user changes and untracked work. Check `git status --short` before edits.
- Treat this as an Expo/React Native product, not a generic web mockup.
- Do not require macOS-only iOS verification as the default path; note it as a gap when relevant.
- After meaningful changes, run the smallest relevant check from `CHECKS.md` and report any known gap.
- Update `PROJECT_STATE.md` at handoff when status, next work, blockers, or verification changes.
