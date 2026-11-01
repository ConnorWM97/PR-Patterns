# List repositories

List repositories returns the repositories stored for one numeric user id. Each item has `id` and `name`. Another user's repositories are absent. An unknown user gets an empty array. The read does not change row counts.

## Sub-features

- `repos-by-user` lists repositories for user `1`.
- `repos-other-user` lists repositories for user `2` and omits user `1`'s repository.
- `repos-unknown-user` returns an empty array for a user id with no rows.
- `repos-unchanged` leaves `repositories` and `pull_requests` row counts unchanged.

## How to get to it (user POV)

- Send `GET http://127.0.0.1:3010/repositories?userId=1`.
- Send `GET http://127.0.0.1:3010/repositories?userId=2`.
- Send `GET http://127.0.0.1:3010/repositories?userId=999999`.

## Driving it with verify-api

Preconditions:

- `node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs doctor` prints `ok`.
- The shared database still has repository `PR Patterns` for user `1` and `Portfolio` for user `2`. If those names are gone, record the actual bodies and stop. Do not insert rows to recreate them.

- **Count before.** Run `node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs db-counts --feature list-repositories --name before`. The file `evidence/list-repositories/before.db-counts.json` holds `repositories` and `pull_requests` counts.
- **User 1.** Send `GET /repositories?userId=1`. Run `node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs request --feature list-repositories --name user-1 --path /repositories?userId=1`. HTTP status is `200` and the body is a JSON array containing `{"id":1,"name":"PR Patterns"}` and not containing `Portfolio`.
- **User 1 again.** Run `node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs request --feature list-repositories --name user-1-again --path /repositories?userId=1`. The body matches `user-1.response.json`.
- **User 2.** Run `node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs request --feature list-repositories --name user-2 --path /repositories?userId=2`. HTTP status is `200` and the body contains `{"id":2,"name":"Portfolio"}` and does not contain `PR Patterns`.
- **Unknown user.** Run `node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs request --feature list-repositories --name unknown-user --path /repositories?userId=999999`. HTTP status is `200` and the body is `[]`.
- **Count after.** Run `node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs db-counts --feature list-repositories --name after`. `after.db-counts.json` matches `before.db-counts.json`.

## Gotchas

- `userId` is required. Omitting it sends `NaN` into the query and the request fails. Do not treat that failure as an empty list.
- User `2` is a separate entry point from user `1`. A successful user `1` response does not verify user `2`.
- The database is shared. A count mismatch means rows changed during the run; do not delete or restore them from this skill.
- Response objects include only `id` and `name`. `user_id` is not in the JSON body.
