# GitHub Workflow

## Current Branch

- Active branch: `master`
- Remote branch: `origin/master`

## Issues

- Use issues for platform work, native modules, release assets, design direction, and multi-step mobile tasks.
- Mark platform gaps clearly, especially iOS when macOS is unavailable.

## Pull Requests

- Prefer PRs for navigation, native module, Supabase, or release changes.
- Small docs/harness updates may go directly to `master` when checks pass.

## Sync Rule

```bash
git fetch --all --prune
git status -sb
git pull --rebase origin master
```

Do not claim mobile parity unless the relevant platforms were actually checked.
