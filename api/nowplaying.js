/* Spotify current playback. Credentials stay on the server; the browser only
   receives the small, public track object below. */

const fs = require("node:fs");
const path = require("node:path");

const SPOTIFY_API = "https://api.spotify.com/v1/me/player/currently-playing";
const TOKEN_API = "https://accounts.spotify.com/api/token";
const CACHE = "s-maxage=30, stale-while-revalidate=120";
let accessToken = "";
let accessTokenExpiresAt = 0;
let refreshing = null;

function parseEnvValue(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith('"')) {
    try { return JSON.parse(trimmed); } catch { return ""; }
  }
  if (trimmed.startsWith("'")) {
    const end = trimmed.lastIndexOf("'");
    return end > 0 ? trimmed.slice(1, end) : "";
  }
  return trimmed.replace(/\s+#.*$/, "").trim();
}

function credentials() {
  const result = {
    clientId: process.env.SPOTIFY_CLIENT_ID || "",
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
    refreshToken: process.env.SPOTIFY_REFRESH_TOKEN || "",
  };

  /* Vercel injects configured variables into process.env. This private local
     file fallback supports running the function directly during development;
     it is never read in production or tests. */
  if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test" &&
      Object.values(result).some((value) => !value)) {
    try {
      const envPath = path.resolve(__dirname, "../.env.local");
      const info = fs.lstatSync(envPath);
      if (!info.isFile() || info.isSymbolicLink()) return result;
      const values = Object.create(null);
      for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
        const match = line.match(/^\s*(?:export\s+)?(SPOTIFY_CLIENT_ID|SPOTIFY_CLIENT_SECRET|SPOTIFY_REFRESH_TOKEN)\s*=\s*(.*)\s*$/);
        if (match) values[match[1]] = parseEnvValue(match[2]);
      }
      result.clientId ||= values.SPOTIFY_CLIENT_ID || "";
      result.clientSecret ||= values.SPOTIFY_CLIENT_SECRET || "";
      result.refreshToken ||= values.SPOTIFY_REFRESH_TOKEN || "";
    } catch {
      // Missing or unreadable local credentials use the regular offline path.
    }
  }
  return result;
}

async function refreshAccessToken(creds, force = false) {
  if (!force && accessToken && accessTokenExpiresAt > Date.now() + 30_000) return accessToken;
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const form = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: creds.refreshToken,
    });
    const response = await fetch(TOKEN_API, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    });
    if (!response.ok) throw new Error("token refresh failed");
    const body = await response.json();
    if (typeof body.access_token !== "string" || !body.access_token) throw new Error("token refresh response invalid");
    accessToken = body.access_token;
    accessTokenExpiresAt = Date.now() + Math.max(30, Number(body.expires_in) || 3600) * 1000;
    return accessToken;
  })();
  try {
    return await refreshing;
  } finally {
    refreshing = null;
  }
}

function noPlayback() {
  return { live: false, paused: false, artist: "", track: "", album: "", image: "", url: "" };
}

function mapPlayback(data) {
  const item = data?.item;
  if (!item || item.type !== "track") return noPlayback();
  const live = data.is_playing === true;
  return {
    live,
    paused: data.is_playing === false,
    artist: Array.isArray(item.artists) ? item.artists.map((artist) => artist.name).filter(Boolean).join(", ") : "",
    track: item.name || "",
    album: item.album?.name || "",
    image: Array.isArray(item.album?.images) ? item.album.images[0]?.url || "" : "",
    url: item.external_urls?.spotify || "",
  };
}

function send(res, status, body) {
  res.setHeader("Cache-Control", CACHE);
  return res.status(status).json(body);
}

module.exports = async (req, res) => {
  if (req.method !== "GET") return send(res, 405, { error: "Method not allowed" });
  const creds = credentials();
  if (!creds.clientId || !creds.clientSecret || !creds.refreshToken) {
    return send(res, 503, { error: "offline" });
  }

  try {
    let token = await refreshAccessToken(creds);
    let response = await fetch(SPOTIFY_API, { headers: { Authorization: `Bearer ${token}` } });
    if (response.status === 401) {
      token = await refreshAccessToken(creds, true);
      response = await fetch(SPOTIFY_API, { headers: { Authorization: `Bearer ${token}` } });
    }
    if (response.status === 204) return send(res, 200, noPlayback());
    if (response.status === 429) {
      const retry = response.headers?.get?.("retry-after");
      if (retry) res.setHeader("Retry-After", retry);
      return send(res, 503, { error: "offline" });
    }
    if (!response.ok) return send(res, 503, { error: "offline" });
    return send(res, 200, mapPlayback(await response.json()));
  } catch {
    // Upstream bodies and errors are deliberately not sent to clients or logs.
    return send(res, 503, { error: "offline" });
  }
};

module.exports._test = { credentials, mapPlayback, refreshAccessToken, reset() {
  accessToken = "";
  accessTokenExpiresAt = 0;
  refreshing = null;
} };
