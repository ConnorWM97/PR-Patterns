import {
    findCommentsByRepositoryId,
    findCommentsByAuthor,
} from "../repositories/reviewCommentRepository.js";

const STOPWORDS = new Set([
    "a", "an", "the", "please", "can", "could", "you", "your",
    "this", "that", "for", "to", "of", "and", "it", "be", "is",
    "on", "in", "with", "we", "i",
]);

const SYNONYMS: Record<string, string> = {
    tests: "test",
    testing: "test",
    tested: "test",
    adding: "add",
    added: "add",
};

export function patternKey(body: string): string | null {
    const withoutCode = body
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/`[^`]+`/g, " ")
        .replace(/https?:\/\/\S+/g, " ");

    const words = withoutCode
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .map((word) => SYNONYMS[word] ?? word)
        .filter((word) => word.length > 1 && !STOPWORDS.has(word));

    const unique = [...new Set(words)].sort();
    if (unique.length === 0) {
        return null;
    }
    return unique.join(" ");
}

const EXAMPLE_LIMIT = 3;

type CommentRow = {
    id: number;
    body: string;
    pull_request_id: number;
};

export function groupComments(comments: CommentRow[]) {
    const byKey = new Map<string, CommentRow[]>();

    for (const comment of comments) {
        const key = patternKey(comment.body);
        if (key === null) {
            continue;
        }
        const group = byKey.get(key) ?? [];
        group.push(comment);
        byKey.set(key, group);
    }

    const patterns = [];

    for (const group of byKey.values()) {
        const count = new Set(group.map((comment) => comment.pull_request_id)).size;
        if (count < 2) {
            continue;
        }

        const ordered = [...group].sort((a, b) => a.id - b.id);
        const shortest = [...ordered].sort(
            (a, b) => a.body.trim().length - b.body.trim().length || a.id - b.id,
        )[0];

        if (shortest === undefined) {
            continue;
        }

        const label = shortest.body.trim();

        const examples = [];
        const seenPullRequests = new Set<number>();
        for (const comment of ordered) {
            if (seenPullRequests.has(comment.pull_request_id)) {
                continue;
            }
            seenPullRequests.add(comment.pull_request_id);
            examples.push({
                id: comment.id,
                pull_request_id: comment.pull_request_id,
                body: comment.body,
            });
            if (examples.length === EXAMPLE_LIMIT) {
                break;
            }
        }

        patterns.push({ label, count, examples });
    }

    patterns.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
    return patterns;
}

export async function getPatterns(
    scope: { repositoryId: number } | { author: string },
) {
    const comments = "repositoryId" in scope
        ? await findCommentsByRepositoryId(scope.repositoryId)
        : await findCommentsByAuthor(scope.author);

    return groupComments(comments);
}
