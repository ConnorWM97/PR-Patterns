import { importAccount } from "../services/githubImportService.js";

const token = process.env.GITHUB_TOKEN;

if (token === undefined || token === "") {
    throw new Error("Missing environment variable GITHUB_TOKEN");
}

const userId = await importAccount(token);
console.log(userId);