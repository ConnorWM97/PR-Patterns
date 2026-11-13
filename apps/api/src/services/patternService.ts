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