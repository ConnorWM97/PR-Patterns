---
name: verify-pr-patterns-api
description: Drive the PR-Patterns Fastify HTTP API (health, repositories, and pull requests) and capture response proof. Use when changing apps/api routes, controllers, or queries and you need to prove the running server.
---

# Verify the PR-Patterns API

PR-Patterns currently exposes one user surface: the Fastify API in `apps/api`. React is planned and is not in this repo. There is no browser UI and no CLI product. Drive the API with HTTP against a server this skill started.

The database is the user's shared local Postgres database `pr_patterns` on `localhost:5432` (user `postgres`, password `postgres`), matching `apps/api/src/db.ts`. These routes only read. Never insert, update, or delete rows from a verification run.

`apps/api/src/app.ts` listens on `process.env.PORT`, or `3000` when `PORT` is unset. A normal `npm run dev` therefore stays on port 3000. Verification always sets `PORT=3010` and talks only to `http://127.0.0.1:3010`. Do not send verification requests to port 3000, and do not kill a process this run did not start. If port 3010 is already taken by another process, stop and report that.

The Postgres database is still shared. Two API processes can listen at once; they cannot have separate data.

## Launch

From the repository root:

```bash
node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs launch
```

This runs `npm run dev` in `apps/api` (`tsx watch src/app.ts`) with `PORT=3010` in its own process group and writes the pid under `.cursor/skills/verify-pr-patterns-api/run/`. The server is ready when `GET http://127.0.0.1:3010/health` returns HTTP 200 and a JSON body whose `status` is `ok`. Fastify also logs `Server listening at http://0.0.0.0:3010` to `.cursor/skills/verify-pr-patterns-api/run/server.log`.

Launch is idempotent when that pid is still serving `/health`. It refuses when something else owns port 3010.

Tear down with the Cleanup section. `run/` is scratch. `evidence/` is not.

## Doctor

Run this before driving, and again whenever a request fails:

```bash
node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs doctor
```

Doctor is read-only. It passes only when all of these are true:

- `.cursor/skills/verify-pr-patterns-api/run/pid` exists and that process is alive
- port 3010 is held by a process in that process group
- `GET /health` on port 3010 returns HTTP 200 and `{"status":"ok"}`

It prints the listener command line, `api` package version from `apps/api/package.json`, `auth none` (these routes have no authentication), and the shared database name. A passing doctor does not prove Postgres is reachable. `/health` does not touch the database.

## Drive

Base URL: `http://127.0.0.1:3010`.

Capture one GET and its response:

```bash
node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs request --feature <feature-id> --name <step> --path <path-and-query>
```

`--path` includes the query string and must start with `/`. The command refuses to run unless doctor would pass. Recipes for each feature are in `features/`. Read `features/README.md` first. A proof that hits one convenient route is incomplete when the map lists other entry points; drive the entry point the feature file names.

Read-only row counts, for proving a GET did not change stored data:

```bash
node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs db-counts --feature <feature-id> --name <step>
```

That runs `SELECT count(*)` on `repositories` and `pull_requests` and writes the counts into the evidence directory. It does not modify rows.

Stable handles are the route paths and query names already in the app:

- `GET /health`
- `GET /repositories?userId=<integer>`
- `GET /pull-requests?repositoryId=<integer>`

There are no ARIA labels or `data-*` hooks. Do not drive by clicking a UI.

## Evidence

Write proof under `.cursor/skills/verify-pr-patterns-api/evidence/<feature-id>/`. `request` writes:

- `<step>.request.txt` — the request line
- `<step>.meta.txt` — URL, method, status, content-type
- `<step>.response.json` — the response body

`db-counts` writes `<step>.db-counts.json`.

Proof standards:

- Exercise the HTTP route a client calls. Do not import controllers, services, or repositories and do not call an unregistered test endpoint.
- Capture the request and the response, including status and body, not only a final summary.
- For repository and pull-request reads, capture `db-counts` before and after the GET. The counts must match. Those routes have no write of their own; a changed count means something else wrote to the shared database during the run, so do not claim the read was side-effect free.
- Do not mock Postgres. The running API uses the real pool in `apps/api/src/db.ts`.
- There is no dry-run mode. A verification GET is a real read against the shared database.
- Record the feature id and the path in the evidence file names and in `*.meta.txt`.

## Cleanup

```bash
node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs cleanup
```

This sends SIGTERM, then SIGKILL if needed, to the process group recorded in `run/pid`. It deletes `run/` (pid file and server log) and leaves `evidence/` in place. It does not kill a listener outside that process group, and it does not change database rows.

After cleanup, confirm the evidence files from the drive are still on disk.

## Helpers

`scripts/verify-api.mjs` is the only helper. Invoke it with `node` from the repository root, as shown above. Commands: `launch`, `doctor`, `request`, `db-counts`, `cleanup`.
