# List pull requests

List pull requests returns the pull requests stored for one numeric repository id. Each item has `id` and `title`. Another repository's pull requests are absent. An unknown repository gets an empty array. The read does not change row counts.

## Sub-features

- `prs-by-repository` lists pull requests for repository `1`.
- `prs-other-repository` lists pull requests for repository `2` and omits repository `1`'s titles.
- `prs-unknown-repository` returns an empty array for a repository id with no rows.
- `prs-unchanged` leaves `repositories` and `pull_requests` row counts unchanged.

## How to get to it (user POV)

- Send `GET http://127.0.0.1:3010/pull-requests?repositoryId=1`.
- Send `GET http://127.0.0.1:3010/pull-requests?repositoryId=2`.
- Send `GET http://127.0.0.1:3010/pull-requests?repositoryId=999999`.

## Driving it with verify-api

Preconditions:

- `node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs doctor` prints `ok`.
- The shared database still has `Add repository layers` and `Connect PostgreSQL` on repository `1`, and `Update project list` on repository `2`. If those titles are gone, record the actual bodies and stop. Do not insert rows to recreate them.

- **Count before.** Run `node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs db-counts --feature list-pull-requests --name before`. The file `evidence/list-pull-requests/before.db-counts.json` holds `repositories` and `pull_requests` counts.
- **Repository 1.** Send `GET /pull-requests?repositoryId=1`. Run `node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs request --feature list-pull-requests --name repository-1 --path /pull-requests?repositoryId=1`. HTTP status is `200` and the body contains titles `Add repository layers` and `Connect PostgreSQL` and does not contain `Update project list`.
- **Repository 1 again.** Run `node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs request --feature list-pull-requests --name repository-1-again --path /pull-requests?repositoryId=1`. The body matches `repository-1.response.json`.
- **Repository 2.** Run `node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs request --feature list-pull-requests --name repository-2 --path /pull-requests?repositoryId=2`. HTTP status is `200` and the body contains `Update project list` and does not contain `Add repository layers` or `Connect PostgreSQL`.
- **Unknown repository.** Run `node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs request --feature list-pull-requests --name unknown-repository --path /pull-requests?repositoryId=999999`. HTTP status is `200` and the body is `[]`.
- **Count after.** Run `node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs db-counts --feature list-pull-requests --name after`. `after.db-counts.json` matches `before.db-counts.json`.

## Gotchas

- `repositoryId` is required. Omitting it sends `NaN` into the query and the request fails. Do not treat that failure as an empty list.
- Repository `2` is a separate entry point from repository `1`. A successful repository `1` response does not verify repository `2`.
- The database is shared. A count mismatch means rows changed during the run; do not delete or restore them from this skill.
- Response objects include only `id` and `title`. `repository_id` is not in the JSON body.
