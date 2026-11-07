# Health

Health tells an API client that this process is serving requests. The body is `{"status":"ok"}`. It does not check Postgres.

## Sub-features

- `health-status` returns HTTP 200 and `status` `ok`.
- `health-repeat` returns the same status and body on a second request.

## How to get to it (user POV)

- Send `GET http://127.0.0.1:3010/health`.

## Driving it with verify-api

Preconditions:

- `node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs doctor` prints `ok` and `health {"status":"ok"}`.

- **Check health.** Send `GET /health`. Run `node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs request --feature health --name status --path /health`. HTTP status is `200`, content-type starts with `application/json`, and the body is `{"status":"ok"}`.
- **Repeat.** Send `GET /health` again. Run `node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs request --feature health --name status-again --path /health`. Status and body match the first response.

## Gotchas

- A passing health check does not mean `GET /repositories` or `GET /pull-requests` can reach Postgres.
- Port 3010 belongs to the verification process. Doctor fails when that listener is not the pid from `launch`. Do not send these requests to port 3000.
- `npm run dev` uses `tsx watch`. Saving a file under `apps/api` restarts the process and can fail an in-flight request. Do not edit the API during the drive.
