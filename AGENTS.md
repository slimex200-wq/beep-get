# Shared AI Entry Point

This repo is used by Codex/OMX and Claude/OMC. Follow your local runtime rules first; this file only points to project-specific context.

Before changing files, read:

1. `PROJECT_STATE.md` - current status, next work, blockers, and last verification.
2. `CHECKS.md` - repo-specific verification commands and platform notes.
3. `DECISIONS.md` - decisions that should not be re-litigated casually.
4. `GITHUB_WORKFLOW.md` - default branch, issue, PR, and sync rules.
5. `.brand.json` and existing mockups for product/visual direction.
6. `package.json` for available Expo/Jest commands.

Project facts in those files override generic assumptions. Keep this file thin; put durable project facts in the dedicated harness files.

## Local Context

- Treat this as an Expo/React Native product, not a generic web mockup.
- iOS, Android, and web verification are separate; report platform gaps explicitly.
