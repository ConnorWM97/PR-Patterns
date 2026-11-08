import { randomBytes } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { exchangeCode } from "../services/githubClient.js";
import { importAccount } from "../services/githubImportService.js";

function requiredEnv(name: string): string {
    const value = process.env[name];

    if (value === undefined || value === "") {
        throw new Error(`Missing environment variable ${name}`);
    }

    return value;
}

function readCookie(cookieHeader: string | undefined, name: string) {
    if (cookieHeader === undefined) {
        return undefined;
    }

    for (const part of cookieHeader.split(";")) {
        const separator = part.indexOf("=");
        if (separator === -1) {
            continue;
        }

        const key = part.slice(0, separator).trim();
        if (key === name) {
            return part.slice(separator + 1).trim();
        }
    }

    return undefined;
}

export async function startGithubLogin(
    request: FastifyRequest<{ Querystring: { private?: string } }>,
    reply: FastifyReply,
) {
    const state = randomBytes(16).toString("hex");
    const scope = request.query.private === "1" ? "repo" : "public_repo";
    reply.header(
        "Set-Cookie",
        `github_oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600`,
    );

    const url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("client_id", requiredEnv("GITHUB_CLIENT_ID"));
    url.searchParams.set("redirect_uri", requiredEnv("GITHUB_CALLBACK_URL"));
    url.searchParams.set("scope", scope);
    url.searchParams.set("state", state);

    return reply.redirect(url.toString());
}

export async function githubCallback(
    request: FastifyRequest<{ Querystring: { code?: string; state?: string; error?: string } }>,
    reply: FastifyReply,
) {
    if (request.query.error !== undefined) {
        return reply.code(400).send({ message: "GitHub authorization was denied" });
    }

    const savedState = readCookie(request.headers.cookie, "github_oauth_state");

    if (
        request.query.code === undefined ||
        request.query.state === undefined ||
        request.query.state !== savedState 
    ) {
        return reply.code(400).send({ message: "Invalid GitHub callback" });
    }

    const token = await exchangeCode(request.query.code);
    const userId = await importAccount(token);

    return { userId };
}