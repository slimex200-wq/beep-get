# GitHub Workflow

## Current Branch

- Default branch: `master`
- Remote branch: `origin/master`
- Work branches: use `codex/<short-task>` unless a task explicitly needs another prefix.

## Master Rule

- Do not push directly to `master`.
- All code, native, release, docs, and harness changes must land through a PR.
- Merge only after required CI is green.
- If a hotfix truly needs an exception, get an explicit user instruction in the active thread and record the reason in the commit/PR.

## Issues

- Use issues for platform work, native modules, release assets, design direction, and multi-step mobile tasks.
- Mark platform gaps clearly, especially iOS when macOS is unavailable.

## Pull Requests

- PRs are required for all changes.
- Keep PRs small enough to review and merge safely.
- Include local verification results and platform gaps in the PR body.
- Do not merge a PR while required CI is pending or failing.

## Sync Rule

```bash
git fetch --all --prune
git status -sb
git switch master
git pull --ff-only origin master
git switch -c codex/<short-task>
```

Do not claim mobile parity unless the relevant platforms were actually checked.
