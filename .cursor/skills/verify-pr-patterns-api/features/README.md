# PR-Patterns API verification map

This directory is the maintained source for verifying the user-facing behavior of the PR-Patterns API. Read the index before driving the app, then use the matching feature file as the recipe.

The only surface today is HTTP. There is no web UI.

## Baseline preconditions

- Launch with `node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs launch` so the API listens at `http://127.0.0.1:3010` (`PORT=3010`). Leave a user dev server on port 3000 alone.
- Run `node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs doctor` and require pid, port 3010, and `/health` to match that process.
- Postgres database `pr_patterns` on `localhost:5432` is shared with the user. Do not insert, update, or delete.
- Development rows observed in that database: repository `1` / user `1` / name `PR Patterns`; repository `2` / user `2` / name `Portfolio`; pull requests `Add repository layers` and `Connect PostgreSQL` on repository `1`; pull request `Update project list` on repository `2`.
- Never drive an instance that was not started by this verification run. Port 3000 is the default dev port. Verification uses 3010 only.

## Driving conventions

- Start every recipe from a passing doctor unless its preconditions say otherwise.
- Treat every command as literal. Keep query names and flags unchanged.
- Drive HTTP through `verify-api.mjs request`. Capture row counts through `verify-api.mjs db-counts`.
- Do not remove proof artifacts during cleanup.

## Proof and skip reporting

- Capture the request and the resulting HTTP status and body, not only a summary line.
- Read proof includes the `request` artifacts plus a second GET with the same path whose body matches the first.
- Repository and pull-request proof also includes `db-counts` before and after the read.
- Record the feature id and path with every artifact.
- Report an unreachable path with the attempted command and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with verify-api` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

## Features

- [Health](./health.md) covers `GET /health`.
- [List repositories](./list-repositories.md) covers `GET /repositories` for a user who has repositories, a user who has different repositories, and an unknown user.
- [List pull requests](./list-pull-requests.md) covers `GET /pull-requests` for each development repository and an unknown repository.
