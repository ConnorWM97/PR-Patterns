const API = "https://api.github.com";

async function githubFetch(token: string, pathOrUrl: string) {
    const url = pathOrUrl.startsWith("https://") ? pathOrUrl : `${API}${pathOrUrl}`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "User-Agent": "pr-patterns",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`GitHub ${response.status} for ${url}: ${body}`);
    }

    return response;
}

export async function githubGet(token: string, path: string) {
    const response = await githubFetch(token, path);
    return response.json();
}

function nextPage(linkHeader: string | null) {
    if (linkHeader == null) {
        return null;
    }

    for (const part of linkHeader.split(",")) {
        const match = part.match(/<([^>]+)>;\s*rel="next"/);
        if (match !== null) {
            return match[1];
        }
    }

    return null;
}

export async function githubGetAll(token: string, path: string) {
    const items = [];
    let url: string | null = path.includes("?") ? `${path}&per_page=100` : `${path}?per_page=100`;

    while (url !== null) {
        const response = await githubFetch(token, url);
        const page = await response.json();
        items.push(...page);
        url = nextPage(response.headers.get("link"));
    }

    return items;
}