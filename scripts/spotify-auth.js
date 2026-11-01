#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const crypto = require("node:crypto");
const readline = require("node:readline");
const { spawnSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const ENV_PATH = path.join(ROOT, ".env.local");
const REDIRECT_URI = "http://127.0.0.1:8888/callback";
const PORT = 8888;
const SCOPES = ["user-read-currently-playing", "user-read-playback-state"];

function assertEnvIsPrivate() {
  const ignored = spawnSync("git", ["check-ignore", "-q", ".env.local"], { cwd: ROOT });
  if (ignored.status !== 0) {
    throw new Error(".env.local is not ignored by Git. Add it to .gitignore before continuing.");
  }
  const tracked = spawnSync("git", ["ls-files", "--error-unmatch", ".env.local"], {
    cwd: ROOT,
    stdio: "ignore",
  });
  if (tracked.status === 0) {
    throw new Error(".env.local is already tracked by Git. Remove it from the index before continuing.");
  }
}

function readEnvFile() {
  let content = "";
  try {
    const info = fs.lstatSync(ENV_PATH);
    if (!info.isFile() || info.isSymbolicLink()) {
      throw new Error(".env.local must be a regular file, not a symlink.");
    }
    content = fs.readFileSync(ENV_PATH, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const values = Object.create(null);
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    let value = match[2];
    if (value.startsWith('"')) {
      try { value = JSON.parse(value); } catch { value = value.slice(1, -1); }
    } else if (value.startsWith("'")) {
      value = value.slice(1, value.endsWith("'") ? -1 : undefined);
    } else {
      value = value.replace(/\s+#.*$/, "").trim();
    }
    values[match[1]] = value;
  }
  return { content, values };
}

function askLine(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve, reject) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
    rl.once("SIGINT", () => {
      rl.close();
      reject(new Error("Setup cancelled."));
    });
  });
}

function askHidden(question) {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
    return Promise.reject(new Error("A terminal is required to securely prompt for the Spotify Client Secret."));
  }
  return new Promise((resolve, reject) => {
    const input = process.stdin;
    let answer = "";
    let settled = false;
    const restore = () => {
      input.removeListener("data", onData);
      if (input.isTTY) input.setRawMode(false);
      input.pause();
    };
    const finish = (error) => {
      if (settled) return;
      settled = true;
      restore();
      process.stdout.write("\n");
      error ? reject(error) : resolve(answer);
    };
    const onData = (chunk) => {
      for (const char of chunk.toString("utf8")) {
        if (char === "\u0003") return finish(new Error("Setup cancelled."));
        if (char === "\r" || char === "\n") return finish();
        if (char === "\u007f" || char === "\b") answer = answer.slice(0, -1);
        else if (char >= " " && char !== "\u007f") answer += char;
      }
    };
    process.stdout.write(question);
    input.setRawMode(true);
    input.setEncoding("utf8");
    input.resume();
    input.on("data", onData);
  });
}

function writeCredentials(envFile, clientId, clientSecret, refreshToken) {
  const updates = {
    SPOTIFY_CLIENT_ID: clientId,
    SPOTIFY_CLIENT_SECRET: clientSecret,
    SPOTIFY_REFRESH_TOKEN: refreshToken,
  };
  const lines = envFile.content.split(/\r?\n/);
  const written = new Set();
  const next = lines.map((line) => {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (!match || !(match[1] in updates)) return line;
    written.add(match[1]);
    return `${match[1]}=${JSON.stringify(updates[match[1]])}`;
  }).filter((line, index, all) => !(line === "" && index === all.length - 1));
  for (const [key, value] of Object.entries(updates)) {
    if (!written.has(key)) next.push(`${key}=${JSON.stringify(value)}`);
  }
  const content = `${next.join("\n")}\n`;
  const tempPath = `${ENV_PATH}.tmp-${process.pid}`;
  try {
    fs.writeFileSync(tempPath, content, { encoding: "utf8", mode: 0o600, flag: "wx" });
    fs.renameSync(tempPath, ENV_PATH);
    fs.chmodSync(ENV_PATH, 0o600);
  } catch (error) {
    try { fs.unlinkSync(tempPath); } catch {}
    throw error;
  }
}

function tokenExchange(clientId, clientSecret, code) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
  });
  return fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  }).then(async (response) => {
    if (!response.ok) {
      // Do not print Spotify's response body; keep token and credential data out of logs.
      throw new Error(`Spotify token exchange failed (HTTP ${response.status}). Check the app credentials and redirect URI.`);
    }
    const tokens = await response.json();
    if (typeof tokens.refresh_token !== "string" || !tokens.refresh_token) {
      throw new Error("Spotify did not return a refresh token. Revoke this app's access and authorize it again.");
    }
    return tokens;
  });
}

function waitForAuthorization(clientId, clientSecret, envFile) {
  const state = crypto.randomBytes(32).toString("hex");
  const authorization = new URL("https://accounts.spotify.com/authorize");
  authorization.search = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: SCOPES.join(" "),
    redirect_uri: REDIRECT_URI,
    state,
  }).toString();

  return new Promise((resolve, reject) => {
    let complete = false;
    const server = http.createServer(async (request, response) => {
      const callback = new URL(request.url, REDIRECT_URI);
      if (request.method !== "GET" || callback.pathname !== "/callback") {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Not found");
        return;
      }
      if (complete) {
        response.writeHead(409, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Authorization already completed.");
        return;
      }
      complete = true;
      const returnedState = callback.searchParams.get("state") || "";
      const validState = returnedState.length === state.length &&
        crypto.timingSafeEqual(Buffer.from(returnedState), Buffer.from(state));
      const denied = callback.searchParams.get("error");
      const code = callback.searchParams.get("code");
      if (!validState || denied || !code) {
        const message = denied ? "Spotify authorization was denied." : "The callback was invalid or missing its authorization code.";
        response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        response.end(`${message} You can close this tab and try again in the terminal.`);
        server.close(() => reject(new Error(message)));
        return;
      }
      try {
        const tokens = await tokenExchange(clientId, clientSecret, code);
        writeCredentials(envFile, clientId, clientSecret, tokens.refresh_token);
        response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Spotify authorization complete. You can close this tab and return to the terminal.");
        server.close(() => resolve());
      } catch (error) {
        response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Authorization could not be saved. Return to the terminal for details.");
        server.close(() => reject(error));
      }
    });

    server.requestTimeout = 30_000;
    server.headersTimeout = 10_000;
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        reject(new Error(`Port ${PORT} is already in use. Close the other process using it and retry.`));
      } else {
        reject(new Error(`Could not start the callback server: ${error.message}`));
      }
    });
    server.listen(PORT, "127.0.0.1", () => {
      console.log("\nOpen this Spotify authorization URL in your browser:\n");
      console.log(authorization.toString());
      console.log(`\nWaiting for Spotify at ${REDIRECT_URI} …`);
    });
    const timeout = setTimeout(() => {
      if (complete) return;
      complete = true;
      server.close(() => reject(new Error("Authorization timed out after 10 minutes.")));
    }, 10 * 60 * 1000);
    timeout.unref();
    server.once("close", () => clearTimeout(timeout));
  });
}

async function main() {
  assertEnvIsPrivate();
  const envFile = readEnvFile();
  const clientId = process.env.SPOTIFY_CLIENT_ID || envFile.values.SPOTIFY_CLIENT_ID || await askLine("Spotify Client ID: ");
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || envFile.values.SPOTIFY_CLIENT_SECRET || await askHidden("Spotify Client Secret (input hidden): ");
  if (!clientId || !clientSecret) throw new Error("Both Spotify Client ID and Client Secret are required.");
  await waitForAuthorization(clientId, clientSecret, envFile);
  console.log("\nSpotify authorization succeeded. Credentials were saved to the Git-ignored .env.local file.");
}

main().catch((error) => {
  console.error(`\nSpotify authorization failed: ${error.message}`);
  process.exitCode = 1;
});
