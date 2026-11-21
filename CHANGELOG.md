# Changelog

All notable changes to this project will be documented in this file.

The format is based on the principles of "Keep a Changelog," and this project
follows Semantic Versioning (MAJOR.MINOR.PATCH) where practical.

# [Unreleased]
## Added
- None.

## Changed
- None.

## Fixed
- None.

## Removed
- None.

# [0.2.0] - 2026-11-21
## Added
- `GET /patterns` returns repeated review-feedback groups for a repository (`repositoryId`) or a pull-request author (`author`).
- Pattern grouping normalizes comment bodies (code/URLs stripped, stopwords removed, small synonym list), counts distinct pull requests, and returns a label plus up to three example comments.
- Repository queries load reviewer comments on a repository or developer and exclude comments written by the pull-request author.

## Changed
- None.

## Fixed
- None.

## Removed
- None.

# [0.1.0] - 2026-11-11
## Added
- Review comment storage and HTTP API (`GET`/`POST /review-comments`).
- Versioned SQL setup scripts for repositories, pull requests, review comments, and users.
- GitHub OAuth sign-in and import of public repositories, pull requests, and review comments.
- Upsert paths for users, repositories, pull requests, and review comments used by the importer.

## Changed
- Pull request and review comment schemas gain `github_id`, `author`, and `created_at`, with upgrade-safe migrations for existing databases.
- Repository identity for imports uses GitHub's stable repository id; duplicate `(user_id, name)` rows are deduplicated.
- OAuth no longer requests write scopes or persists the access token.

## Fixed
- Import handles pull requests and comments with a missing GitHub user.
- Orphan pull requests are prevented with a foreign key to repositories; missing parents return 404 from create endpoints.
- Request validation rejects malformed ids and timestamps with HTTP 400 before they reach PostgreSQL.

## Removed
- Unused `access_token` column on `users`.

# [0.0.1] - 2026-11-06
## Added
- Initial project documentation: LICENSE, README, CONTRIBUTING, and CODE_OF_CONDUCT.
- Fastify TypeScript API with PostgreSQL for health, repositories, and pull requests.
- Local setup guidance and API verification skill for health, repository, and pull-request routes.

## Changed
- None.

## Fixed
- None.

## Removed
- None.
