#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const skillDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.resolve(skillDir, "../../..");
const apiDir = path.join(root, "apps/api");
const runDir = path.join(skillDir, "run");
const evidenceDir = path.join(skillDir, "evidence");
const pidFile = path.join(runDir, "pid");
const logFile = path.join(runDir, "server.log");
const port = 3010;
const baseUrl = `http://127.0.0.1:${port}`;

const usage = `usage:
  node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs launch
  node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs doctor
  node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs request --feature <id> --name <name> --path <path>
  node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs db-counts --feature <id> --name <name>
  node .cursor/skills/verify-pr-patterns-api/scripts/verify-api.mjs cleanup`;

function fail(message, code = 1) {
    console.error(message);
    process.exit(code);
}

function readPid() {
    if (!fs.existsSync(pidFile)) return null;
    const pid = Number(fs.readFileSync(pidFile, "utf8").trim());
    return Number.isInteger(pid) && pid > 0 ? pid : null;
}

function alive(pid) {
    try {
        process.kill(pid, 0);
        return true;
    } catch {
        return false;
    }
}

function pgrp(pid) {
    const stat = fs.readFileSync(`/proc/${pid}/stat`, "utf8");
    const fields = stat.slice(stat.lastIndexOf(")") + 2).split(" ");
    return Number(fields[2]);
}

function cmdline(pid) {
    try {
        return fs.readFileSync(`/proc/${pid}/cmdline`, "utf8").replaceAll("\0", " ").trim();
    } catch {
        return "";
    }
}

function listenInodes(listenPort) {
    const hexPort = listenPort.toString(16).padStart(4, "0").toUpperCase();
    const inodes = [];
    for (const file of ["/proc/net/tcp", "/proc/net/tcp6"]) {
        if (!fs.existsSync(file)) continue;
        for (const line of fs.readFileSync(file, "utf8").trim().split("\n").slice(1)) {
            const parts = line.trim().split(/\s+/);
            const localPort = parts[1]?.split(":")[1]?.toUpperCase();
            const state = parts[3];
            if (localPort === hexPort && state === "0A") inodes.push(parts[9]);
        }
    }
    return inodes;
}

function pidForInode(inode) {
    const target = `socket:[${inode}]`;
    for (const entry of fs.readdirSync("/proc")) {
        if (!/^\d+$/.test(entry)) continue;
        let fds;
        try {
            fds = fs.readdirSync(`/proc/${entry}/fd`);
        } catch {
            continue;
        }
        for (const fd of fds) {
            try {
                if (fs.readlinkSync(`/proc/${entry}/fd/${fd}`) === target) return Number(entry);
            } catch {
                // fd can vanish between readdir and readlink
            }
        }
    }
    return null;
}

function listeners() {
    const pids = new Set();
    for (const inode of listenInodes(port)) {
        const pid = pidForInode(inode);
        if (pid) pids.add(pid);
    }
    return [...pids];
}

function ownedByGroup(listenerPid, groupPid) {
    try {
        return pgrp(listenerPid) === groupPid;
    } catch {
        return false;
    }
}

function flag(args, name) {
    const index = args.indexOf(`--${name}`);
    if (index === -1 || args[index + 1] === undefined || args[index + 1].startsWith("--")) {
        fail(`missing --${name}\n${usage}`, 2);
    }
    return args[index + 1];
}

async function health() {
    const response = await fetch(`${baseUrl}/health`);
    const body = await response.text();
    let json = null;
    try {
        json = JSON.parse(body);
    } catch {
        json = null;
    }
    return { response, body, json };
}

async function waitUntilReady(timeoutMs) {
    const started = Date.now();
    let last = "no response";
    while (Date.now() - started < timeoutMs) {
        try {
            const result = await health();
            if (result.response.status === 200 && result.json?.status === "ok") return result;
            last = `HTTP ${result.response.status} ${result.body}`;
        } catch (error) {
            last = error instanceof Error ? error.message : String(error);
        }
        await delay(200);
    }
    throw new Error(`server did not become ready at ${baseUrl}/health: ${last}`);
}

function ensureRunDir() {
    fs.mkdirSync(runDir, { recursive: true });
}

async function launch() {
    const existing = readPid();
    if (existing && alive(existing)) {
        const ours = listeners().filter((listenerPid) => ownedByGroup(listenerPid, existing));
        if (ours.length > 0) {
            const result = await health();
            if (result.response.status === 200 && result.json?.status === "ok") {
                console.log(`already running pid ${existing} at ${baseUrl}`);
                return;
            }
        }
        await cleanup();
    }

    const currentListeners = listeners();
    if (currentListeners.length > 0) {
        const owner = currentListeners[0];
        fail(
            `port ${port} is already used by pid ${owner} (${cmdline(owner) || "unknown command"}). ` +
                "Refusing to start a second PR-Patterns API on the shared port.",
        );
    }

    ensureRunDir();
    const logFd = fs.openSync(logFile, "a");
    const child = spawn("npm", ["run", "dev"], {
        cwd: apiDir,
        detached: true,
        stdio: ["ignore", logFd, logFd],
        env: { ...process.env, PORT: String(port) },
    });
    fs.closeSync(logFd);
    child.unref();
    fs.writeFileSync(pidFile, `${child.pid}\n`);
    try {
        await waitUntilReady(30000);
    } catch (error) {
        await cleanup();
        throw error;
    }
    const listening = listeners().filter((pid) => ownedByGroup(pid, child.pid));
    console.log(`launched pid ${child.pid} listening pid ${listening.join(",") || "unknown"} at ${baseUrl}`);
}

function doctor() {
    const pid = readPid();
    if (!pid) fail(`no verification server recorded. Run launch first.`);
    if (!alive(pid)) fail(`recorded pid ${pid} is not running. Run launch again.`);
    const listening = listeners();
    if (listening.length === 0) {
        fail(`nothing is listening on port ${port}. Recorded pid ${pid} is not serving the API.`);
    }
    const ours = listening.filter((listenerPid) => ownedByGroup(listenerPid, pid));
    if (ours.length === 0) {
        const owner = listening[0];
        fail(
            `port ${port} is owned by pid ${owner} (${cmdline(owner) || "unknown command"}), not verification pid ${pid}. ` +
                "Refusing to drive a server this run did not start.",
        );
    }
    return { pid, listening: ours };
}

async function doctorCommand() {
    const { pid, listening } = doctor();
    const result = await health();
    if (result.response.status !== 200 || result.json?.status !== "ok") {
        fail(`GET /health returned HTTP ${result.response.status} body ${result.body}`);
    }
    const pkg = JSON.parse(fs.readFileSync(path.join(apiDir, "package.json"), "utf8"));
    console.log(`ok pid ${pid}`);
    console.log(`listening ${listening.map((listenerPid) => `${listenerPid} ${cmdline(listenerPid)}`).join("; ")}`);
    console.log(`url ${baseUrl}`);
    console.log(`package ${pkg.name}@${pkg.version}`);
    console.log(`auth none`);
    console.log(`database shared postgresql://postgres@localhost:5432/pr_patterns`);
    console.log(`health ${result.body}`);
}

async function request(args) {
    doctor();
    const feature = flag(args, "feature");
    const name = flag(args, "name");
    const requestPath = flag(args, "path");
    if (!requestPath.startsWith("/")) fail("--path must start with /", 2);
    const url = `${baseUrl}${requestPath}`;
    const response = await fetch(url);
    const body = await response.text();
    const dir = path.join(evidenceDir, feature);
    fs.mkdirSync(dir, { recursive: true });
    const requestText = `GET ${requestPath} HTTP/1.1\nHost: 127.0.0.1:${port}\n`;
    const meta = [
        `url: ${url}`,
        `method: GET`,
        `status: ${response.status}`,
        `content-type: ${response.headers.get("content-type") ?? ""}`,
        "",
    ].join("\n");
    fs.writeFileSync(path.join(dir, `${name}.request.txt`), requestText);
    fs.writeFileSync(path.join(dir, `${name}.meta.txt`), meta);
    fs.writeFileSync(path.join(dir, `${name}.response.json`), `${body}\n`);
    console.log(meta.trim());
    console.log(body);
}

async function dbCounts(args) {
    const feature = flag(args, "feature");
    const name = flag(args, "name");
    const require = createRequire(path.join(apiDir, "package.json"));
    const pg = require("pg");
    const pool = new pg.Pool({
        host: "localhost",
        port: 5432,
        user: "postgres",
        password: "postgres",
        database: "pr_patterns",
    });
    try {
        const counts = await pool.query(
            "SELECT (SELECT count(*)::int FROM repositories) AS repositories, (SELECT count(*)::int FROM pull_requests) AS pull_requests",
        );
        const body = counts.rows[0];
        const dir = path.join(evidenceDir, feature);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, `${name}.db-counts.json`), `${JSON.stringify(body)}\n`);
        console.log(JSON.stringify(body));
    } finally {
        await pool.end();
    }
}

async function cleanup() {
    const pid = readPid();
    if (pid && alive(pid)) {
        try {
            process.kill(-pid, "SIGTERM");
        } catch {
            try {
                process.kill(pid, "SIGTERM");
            } catch {
                // already gone
            }
        }
        for (let attempt = 0; attempt < 50; attempt += 1) {
            const stillListening = listeners().some((listenerPid) => ownedByGroup(listenerPid, pid));
            if (!alive(pid) && !stillListening) break;
            await delay(100);
        }
        if (alive(pid) || listeners().some((listenerPid) => ownedByGroup(listenerPid, pid))) {
            try {
                process.kill(-pid, "SIGKILL");
            } catch {
                // already gone
            }
            await delay(200);
        }
    }
    fs.rmSync(runDir, { recursive: true, force: true });
    const leftover = listeners();
    if (pid && leftover.some((listenerPid) => ownedByGroup(listenerPid, pid))) {
        fail(`cleanup left a listener from pid ${pid} on port ${port}`);
    }
    console.log("cleaned up verification server; evidence kept");
}

const [command, ...args] = process.argv.slice(2);
try {
    if (command === "launch") await launch();
    else if (command === "doctor") await doctorCommand();
    else if (command === "request") await request(args);
    else if (command === "db-counts") await dbCounts(args);
    else if (command === "cleanup") await cleanup();
    else fail(usage, 2);
} catch (error) {
    fail(error instanceof Error ? error.message : String(error));
}
