# Contributing to PR Patterns

first off, thank you for your interest in contributing to this project!
PR Patterns is made to help developers improve their pull requests over time by learning from previous pull requests.
Whether you are fixing a typo, reporting a bug, improving documentation, or adding a feature, your contributions are greatly appreciated.

## Before you start

if you're planning on working on a large feature or a significant change, please open an issue first so that we can discuss the design before
development begins.

for small bug fixes, documentation improvements, or minor enhancements, feel free to submit a pull request directly.

## Development Philosophy



### PR Patterns values:

- Simplicity over cleverness
- Readable code over short code
- Small, focused pull requests
- Good documentation
- Automated testing where practical
- Constructive code reviews



### When making changes, ask yourself:

- Is this easy to understand?
- Would a new contributor understand this code several months from now?
- Does this change make the project simpler or more complicated?



## Setting up the project

1. Fork the repository.
2. Clone your fork.
3. Create a new branch for your work.
4. Start PostgreSQL. The API reads its connection from environment variables (`PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`). Local development uses database `pr_patterns` on `localhost:5432`, user `postgres`, password `postgres`.

If the container does not exist yet:

```bash
docker run -d --name pr-patterns-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=pr_patterns \
  -p 5432:5432 \
  postgres
```

If it already exists:

```bash
docker start pr-patterns-db
```

1. Apply the schema scripts in order, from `apps/api`. `psql` runs inside the container.

```bash
cd apps/api
docker exec -i pr-patterns-db psql -U postgres -d pr_patterns < sql/000_init.sql
docker exec -i pr-patterns-db psql -U postgres -d pr_patterns < sql/001_review_comments.sql
docker exec -i pr-patterns-db psql -U postgres -d pr_patterns < sql/002_users.sql
```

`000`, `001`, and `002` are safe to run more than once. `CREATE TABLE IF NOT EXISTS` and `CREATE UNIQUE INDEX IF NOT EXISTS` skip objects that are already there. On a `pull_requests` or `review_comments` table created before `github_id`, `author`, and `created_at` existed, `000` and `001` add those columns and keep the existing rows: `github_id` becomes `-id` (unique, and distinct from real GitHub ids), `author` becomes `unknown`, and `created_at` becomes the Unix epoch. Those columns are then `NOT NULL`, and `github_id` gets a unique constraint.

1. Install dependencies and start the API, from `apps/api`. Export the database settings in the same terminal before `npm run dev`.

```bash
export PGHOST=localhost
export PGUSER=postgres
export PGPASSWORD=postgres
export PGDATABASE=pr_patterns
npm install
npm run dev
```

The server listens on port `3000`. If any of the four variables are missing, the API exits instead of starting.

## Coding guidelines

- use TypeScript whenever possible.
- Follow the existing code style.
- Write meaningful variable and function names.
- Keep functions focused on a single responsibility.
- Avoid unnecessary dependencies.
- Add comments only when they explain **why**, not **what**.



## Pull Requests

Please keep pull requests focused on a single purpose.

Before submitting, verify that:

- Your code builds successfully.
- Existing tests pass.
- New functionality includes tests when appropriate.
- Documentation has been updated if behavior has changed.
- Pull request descriptions clearly explain the motivation behind the change.



## Reporting bugs

When opening a bug report, please include:

- Expected behavior
- Actual behavior
- Steps to reproduce
- Screenshots (if applicable)
- Browser and operating system
- Relevant error messages



## Suggesting features

feature requests are welcome.

When suggesting a feature, please explain:

- The problem you're trying to solve
- Your proposed solution
- Alternative solutions you considered
- Any trade-offs you see



## Code review

Code reviews are intended to improve the project, not criticize contributors.

Please assume positive intent and provide respectful, constructive feedback.

## Questions

If you are unsure about anything, please open a discussion or issue.
We would rather answer a question early than review a large change that heads in the wrong direction.

Thank you for helping make PR Patterns better!